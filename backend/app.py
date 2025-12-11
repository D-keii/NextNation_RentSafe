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

# --- RUN THE SERVER ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database connected and ready.")
    app.run(debug=True, port=5000)