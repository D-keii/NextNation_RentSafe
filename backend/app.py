# app.py
from flask import Flask
from flask_cors import CORS
from db.db import db
from api.routes import api_bp
import os

app = Flask(__name__)

# Enable CORS for frontend (Vite / React)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# SQLite setup
db_file = os.path.join(os.path.dirname(__file__), "rentsafe.db")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_file}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

# Register API routes
app.register_blueprint(api_bp, url_prefix="/api")

# Create tables immediately on startup
with app.app_context():
    db.create_all()

print("Available Routes:")
print(app.url_map)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8889)


from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from db.models import db, Property, Application, Contract, Escrow
from datetime import datetime, timedelta
app = Flask(__name__)

# --- CONFIGURATION ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.getcwd(), 'rentsafe.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Connect the database to this app
db.init_app(app)
CORS(app)

# --- ROUTES ---

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "RentSafe Backend is running!"})

# 1. CREATE Property 
@app.route('/properties/create', methods=['POST'])
def add_property():
    data = request.get_json()
    
    # Simple validation
    if not data or 'title' not in data or 'price' not in data:
        return jsonify({"message": "Error: Title and Price are required"}), 400

    # Handle Address Logic (Combine fields if needed)
    full_address = data.get('location')
    if not full_address and 'address' in data:
        full_address = f"{data['address']}, {data.get('city', '')}, {data.get('state', '')}"

    new_property = Property(
        title=data['title'],
        description=data.get('description', ''),
        location=full_address,
        price=data['price'],
        landlord_ic=data.get('landlord_ic', 'UNKNOWN'),
        
        # New fields
        bedrooms=int(data.get('bedrooms', 1)),
        bathrooms=int(data.get('bathrooms', 1)),
        size_sqft=int(data.get('size_sqft', 800)),
        image_url=data.get('imageUrl', None),
        status='available'
    )

    try:
        db.session.add(new_property)
        db.session.commit()
        return jsonify({"message": "Property created!", "property": new_property.to_dict()}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# 2. UPDATE Property
@app.route('/properties/<int:id>/update', methods=['PUT'])
def update_property(id):
    property_item = Property.query.get(id)
    if not property_item:
        return jsonify({"message": "Property not found"}), 404
        
    data = request.get_json()
    if 'title' in data: property_item.title = data['title']
    if 'price' in data: property_item.price = data['price']
    if 'location' in data: property_item.location = data['location']
        
    db.session.commit()
    return jsonify({"message": "Property updated", "property": property_item.to_dict()}), 200

# 3. DELETE Property
@app.route('/properties/<int:id>/delete', methods=['DELETE'])
def delete_property(id):
    property_item = Property.query.get(id)
    if not property_item:
        return jsonify({"message": "Property not found"}), 404
        
    db.session.delete(property_item)
    db.session.commit()
    return jsonify({"message": "Property deleted"}), 200

# --- TASK 2: PROPERTY RETRIEVAL ---

# 4. GET ALL Properties
@app.route('/properties/all', methods=['GET'])
def get_all_properties():
    properties = Property.query.all()
    result = [p.to_dict() for p in properties]
    return jsonify(result), 200

# 5. GET SINGLE Property
@app.route('/properties/<int:id>', methods=['GET'])
def get_property(id):
    property_item = Property.query.get(id)
    if not property_item:
        return jsonify({"message": "Property not found"}), 404
    return jsonify(property_item.to_dict()), 200

# --- TASK 3: APPLICATION REVIEW ---

# 6. GET ALL Applications for a Specific Property (THIS WAS MISSING!)
@app.route('/properties/<int:property_id>/applications', methods=['GET'])
def get_property_applications(property_id):
    # Fetch all applications where property_id matches
    apps = Application.query.filter_by(property_id=property_id).all()
    
    # Return empty list if none found, instead of 404
    if not apps:
        return jsonify([]), 200
        
    result = [app.to_dict() for app in apps]
    return jsonify(result), 200

# 7. GET Single Application (For Review Page)
@app.route('/applications/<int:app_id>', methods=['GET'])
def get_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"message": "Application not found"}), 404
    return jsonify(application.to_dict()), 200

# 8. APPROVE Application & AUTO-GENERATE CONTRACT
@app.route('/applications/<int:app_id>/approve', methods=['POST'])
def approve_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"message": "Application not found"}), 404
        
    application.status = 'approved'
    
    # Check if contract exists
    existing_contract = Contract.query.filter_by(property_id=application.property.id, tenant_ic=application.tenant_ic).first()
    
    if not existing_contract:
        # Create a 1-year contract automatically
        new_contract = Contract(
            property_id=application.property.id,
            tenant_ic=application.tenant_ic,
            landlord_ic=application.property.landlord_ic,
            monthly_rent=application.property.price,
            deposit_amount=application.property.price * 2,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=365),
            status='pending_photos'
        )
        db.session.add(new_contract)
    
    db.session.commit()
    return jsonify({"message": "Application approved & Contract generated!", "application": application.to_dict()}), 200

# 9. REJECT Application
@app.route('/applications/<int:app_id>/reject', methods=['POST'])
def reject_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"message": "Not found"}), 404
        
    application.status = 'rejected'
    db.session.commit()
    return jsonify({"message": "Rejected", "application": application.to_dict()}), 200

# --- TASK 4 & 5: CONTRACTS & PHOTOS ---

# 10. GET SINGLE CONTRACT
@app.route('/contracts/<int:contract_id>', methods=['GET'])
def get_contract(contract_id):
    contract = Contract.query.get(contract_id)
    if not contract:
        return jsonify({"message": "Contract not found"}), 404
    return jsonify(contract.to_dict()), 200

# 11. LANDLORD SIGN CONTRACT
@app.route('/contracts/<int:contract_id>/landlord/sign', methods=['POST'])
def sign_contract_landlord(contract_id):
    contract = Contract.query.get(contract_id)
    if not contract:
        return jsonify({"message": "Contract not found"}), 404

    # Simulate Digital Signature
    signature = f"Signed by {contract.landlord_ic} at {datetime.utcnow()}"
    
    contract.landlord_signed = True
    contract.landlord_signature_data = signature
    
    # If both signed, make active
    if contract.tenant_signed:
        contract.status = 'active'
    else:
        contract.status = 'pending_signatures' 
        
    db.session.commit()
    return jsonify({"message": "Contract signed successfully", "contract": contract.to_dict()}), 200

# 12. UPLOAD PHOTOS
@app.route('/contracts/<int:contract_id>/upload-photos', methods=['POST'])
def upload_contract_photos(contract_id):
    contract = Contract.query.get(contract_id)
    if not contract:
        return jsonify({"message": "Contract not found"}), 404

    mock_photos = [
        "https://placehold.co/600x400?text=Living+Room",
        "https://placehold.co/600x400?text=Kitchen",
        "https://placehold.co/600x400?text=Bedroom"
    ]
    contract.property_photos = ",".join(mock_photos)
    contract.status = 'pending_tenant_approval'
    
    db.session.commit()
    return jsonify({"message": "Photos uploaded", "contract": contract.to_dict()}), 200

# TASK 6: ESCROW SYSTEM

# 13. GET ESCROW STATUS (By Contract ID)
@app.route('/escrow/<int:contract_id>', methods=['GET'])
def get_escrow_status(contract_id):
    # Try to find existing escrow
    escrow = Escrow.query.filter_by(contract_id=contract_id).first()
    
    # Logic: If contract exists but no escrow record yet, return a "Pending" placeholder
    # OR we can auto-create one. Let's return a basic status if not found.
    if not escrow:
        return jsonify({"status": "pending", "amount": 0}), 200
        
    return jsonify(escrow.to_dict()), 200

# 14. APPROVE RELEASE (Landlord releases money to themselves or tenant)
@app.route('/escrow/<int:escrow_id>/approve-release', methods=['POST'])
def approve_escrow_release(escrow_id):
    escrow = Escrow.query.get(escrow_id)
    if not escrow:
        return jsonify({"message": "Escrow record not found"}), 404
        
    escrow.status = 'released'
    # In a real app, this would trigger a Bank API transfer
    
    db.session.commit()
    return jsonify({"message": "Funds released successfully", "escrow": escrow.to_dict()}), 200

# 15. REJECT RELEASE / DISPUTE
@app.route('/escrow/<int:escrow_id>/reject-release', methods=['POST'])
def reject_escrow_release(escrow_id):
    escrow = Escrow.query.get(escrow_id)
    if not escrow:
        return jsonify({"message": "Escrow record not found"}), 404
        
    escrow.status = 'disputed'
    db.session.commit()
    return jsonify({"message": "Release rejected. Dispute process started.", "escrow": escrow.to_dict()}), 200

# --- TASK 7: LANDLORD DASHBOARD ---

@app.route('/users/<string:ic>/landlord-dashboard', methods=['GET'])
def get_landlord_dashboard(ic):
    # 1. My Properties
    properties = Property.query.filter_by(landlord_ic=ic).all()
    
    # 2. Pending Applications
    # (Join with Property to find apps for this landlord)
    pending_apps = db.session.query(Application).join(Property).filter(
        Property.landlord_ic == ic,
        Application.status == 'pending'
    ).all()
    
    # 3. Active Contracts
    active_contracts = Contract.query.filter_by(landlord_ic=ic, status='active').all()
    
    # 4. Pending Contracts (Signatures, Photos, Tenant Approval)
    pending_statuses = ['pending_signatures', 'pending_photos', 'pending_tenant_approval']
    pending_contracts = Contract.query.filter(
        Contract.landlord_ic == ic, 
        Contract.status.in_(pending_statuses)
    ).all()
    
    # 5. Secured Escrows
    # (Join with Contract to find escrows for this landlord)
    secured_escrows = db.session.query(Escrow).join(Contract).filter(
        Contract.landlord_ic == ic,
        Escrow.status == 'secured'
    ).all()
    
    return jsonify({
        "myProperties": [p.to_dict() for p in properties],
        "pendingApplications": [a.to_dict() for a in pending_apps],
        "activeContracts": [c.to_dict() for c in active_contracts],
        "pendingContracts": [c.to_dict() for c in pending_contracts],
        "securedEscrows": [e.to_dict() for e in secured_escrows]
    }), 200

# TASK 8: TENANT HISTORY FOR LANDLORD

@app.route('/landlord/<string:ic>/tenant-history', methods=['GET'])
def get_landlord_tenant_history(ic):
    # 1. Fetch all contracts associated with this Landlord
    # We order by end_date descending so the most recent history appears top
    contracts = Contract.query.filter_by(landlord_ic=ic).order_by(Contract.end_date.desc()).all()

    history_data = []

    for contract in contracts:
        # 2. Logic to find Tenant Name
        # Since the Contract model only has tenant_ic, we try to find the name 
        # from the Application table. 
        # (Assumption: A contract usually starts from an application).
        tenant_app = Application.query.filter_by(tenant_ic=contract.tenant_ic).first()
        tenant_name = tenant_app.tenant_name if tenant_app else "Unknown Name"

        # 3. Get Escrow Data safely
        escrow_info = contract.escrow.to_dict() if contract.escrow else {
            "status": "No Escrow", 
            "amount": 0, 
            "paymentMethod": "N/A"
        }

        # 4. Build the data object
        history_data.append({
            "contractId": contract.id,
            "tenant": {
                "name": tenant_name,
                "ic": contract.tenant_ic
            },
            "property": {
                "id": contract.property.id,
                "title": contract.property.title,
                "location": contract.property.location
            },
            "contractDetails": {
                "status": contract.status,
                "startDate": contract.start_date.isoformat(),
                "endDate": contract.end_date.isoformat(),
                "monthlyRent": contract.monthly_rent
            },
            "escrow": escrow_info
        })

    return jsonify(history_data), 200

# --- RUN THE SERVER ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database connected and ready.")
    app.run(debug=True, port=5000)
