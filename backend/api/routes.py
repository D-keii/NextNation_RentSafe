from flask import request, url_for, jsonify, redirect, render_template_string
from . import api_bp
from db.db import db
from db.db_tables import User, TenantPreference, Listing, SavedListing, RentalApplication, Contract, Escrow, Property, Application
from datetime import datetime, timedelta
# Genrate unique session id
import uuid
import json

# Store mapping session ID to user profiles
MOCK_TOKENS = {}

# Just to get the redirect url
@api_bp.route("/auth/login-mydigitalid", methods=["GET"])
def login_mydigitalid():
    session_id = str(uuid.uuid4())

    # Mock a session id
    MOCK_TOKENS[session_id] = {
        "name": "NextNation",
        "ic": "000000-00-0000",
        "email": "next_nation@gmail.com",
        "age": 25,
        "gender": "Male",
        "verified": True
    }

    # redirect_url = url_for(
    #     "api_bp.mock_mydigitalid_page",
    #     session=session_id,
    #     _external=True
    # )

    redirect_url = f"http://localhost:5173/mock-digitalid?session={session_id}"
    return jsonify({"redirect_url": redirect_url})

# # Mock Mydigitalid page (frontend did mocking)
# @api_bp.route("/mock/mydigitalid", methods=["GET"])
# def mock_mydigitalid_page():
#     session_id = request.args.get("session")
#     if session_id not in MOCK_TOKENS:
#         return "Invalid session", 400
#
#     user = MOCK_TOKENS[session_id]
#     html = f"""
#         <html>
#         <body>
#             <h2>Mock MyDigitalID Login</h2>
#             <p>Name: {user['name']}</p>
#             <p>IC: {user['ic']}</p>
#             <p>Email: {user['email']}</p>
#             <p>Age: {user['age']}</p>
#             <p>Gender: {user['gender']}</p>
#             <form action="{url_for('api_bp.callback')}" method="GET">
#                 <input type="hidden" name="token" value="{session_id}">
#                 <button type="submit">Approve</button>
#             </form>
#         </body>
#         </html>
#         """
#     return html

# Callback
@api_bp.route("/auth/callback", methods=["GET"])
def callback():
    token = request.args.get("token")
    if token not in MOCK_TOKENS:
        return jsonify({"error": "Invalid token"}), 400
    profile = MOCK_TOKENS[token]

    # Query by IC since User model uses IC as unique identifier (not email)
    existing = User.query.filter_by(ic=profile["ic"]).first()
    if not existing:
        user = User(ic=profile["ic"], name=profile["name"], age=profile["age"], gender=profile["gender"])
        db.session.add(user)
        db.session.commit()
        user_id = user.id
    else:
        user_id = existing.id

    return jsonify({
        "message": "MyDigitalID verified",
        "profile": profile,
        "user_id": user_id
    })

# Register
@api_bp.route("/users/setup", methods=["POST"])
def register_role():
    data = request.json
    user_id = data.get("user_id")
    role = data.get("role")

    if not user_id or not role:
        return jsonify({"error": "Missing user_id or role"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.role = role
    db.session.commit()
    return jsonify({"message": "Role updated", "role": user.role})

# tenant get recommend lsiting based on pref
@api_bp.get("/listings/recommended")
def get_recommended():
    user_id = request.args.get("user_id")

    prefs = TenantPreference.query.filter_by(user_id=user_id).first()

    query = Listing.query

    if prefs:
        if prefs.preferred_location:
            query = query.filter_by(location=prefs.preferred_location)
        if prefs.min_rent:
            query = query.filter(Listing.monthly_rental >= prefs.min_rent)
        if prefs.max_rent:
            query = query.filter(Listing.monthly_rental <= prefs.max_rent)
        if prefs.min_bedrooms:
            query = query.filter(Listing.no_bed >= prefs.min_bedrooms)

    results = query.limit(10).all()

    return jsonify([{
        "id": l.id,
        "name": l.name,
        "location": l.location,
        "monthlyRental": l.monthly_rental,
        "noOfBed": l.no_bed,
        "noOfToilet": l.no_toilet,
        "noOfSqft": l.sqft,
        "imageUrl": l.image_url
    } for l in results])

# Tenant get to favourite the listing and also remove from fav
@api_bp.post("/listings/save")
def save_listing():
    data = request.json
    user_id = data["user_id"]
    listing_id = data["listing_id"]

    saved = SavedListing.query.filter_by(user_id=user_id, listing_id=listing_id).first()

    if saved:
        db.session.delete(saved)
        db.session.commit()
        return jsonify({"message": "Removed from saved listings"})

    new_saved = SavedListing(user_id=user_id, listing_id=listing_id)
    db.session.add(new_saved)
    db.session.commit()

    return jsonify({"message": "Added to saved listings"})

# Create rental application
@api_bp.route("/applications/create", methods=["POST"])
def create_application():
    data = request.get_json()

    tenant_ic = data.get("tenant_ic")
    property_id = data.get("property_id")
    message = data.get("message")

    # 1. Ensure user exists (already verified via MyDigitalID)
    tenant = User.query.filter_by(ic=tenant_ic).first()
    if not tenant:
        return jsonify({"error": "Tenant not found. User must login first."}), 404

    # 2. Create application record
    application = RentalApplication(
        tenant_ic = tenant_ic,
        property_id = property_id,
        message = message
    )
    db.session.add(application)
    db.session.commit()

    return jsonify({
        "message": "Application created",
        "application_id": application.id
    })

# Get all the applications by the tenant
@api_bp.route("/applications/<tenant_ic>", methods=["GET"])
def get_applications(tenant_ic):
    apps = RentalApplication.query.filter_by(tenant_ic=tenant_ic).all()

    return jsonify([{
        "application_id": a.id,
        "tenant_ic": a.tenant_ic,
        "property_id": a.property_id,
        "message": a.message,
        "status": a.status
    } for a in apps])

# Approve all landlord-uploaded photos for a contract
@api_bp.route("/contracts/<contract_id>/photos/approve", methods=["POST"])
def tenant_approve_photos(contract_id):
    contract = Contract.query.get(contract_id)
    if not contract:
        return jsonify({"error": "Contract not found"}), 404

    # if there are no photos uploaded, reject the request
    photos = contract.property_photos.split(",") if contract.property_photos else []
    if not photos:
        return jsonify({"error": "No photos to approve"}), 400

    # mark photos approved and update contract status
    contract.photos_approved = True
    # move contract to next state awaiting signature
    contract.status = "awaiting_tenant_signature"
    db.session.commit()

    return jsonify({"message": "Photos approved", "status": contract.status}), 200


# Reject photos
@api_bp.route("/contracts/<contract_id>/photos/reject", methods=["POST"])
def tenant_reject_photos(contract_id):
    contract = Contract.query.get(contract_id)
    if not contract:
        return jsonify({"error": "Contract not found"}), 404

    contract.photos_approved = False
    contract.status = "photos_rejected_by_tenant"
    db.session.commit()

    return jsonify({
        "message": "Photos rejected.",
        "status": contract.status
    }), 200


# Tenant signs contract (save name, IC, timestamp, document hash)
@api_bp.route("/contracts/<int:contract_id>/tenant/sign", methods=["POST"])
def tenant_sign_contract(contract_id):
    contract = Contract.query.get(contract_id)
    if not contract:
        return jsonify({"error": "Contract not found"}), 404

    # Ensure photos were approved before tenant can sign
    if not contract.photos_approved:
        return jsonify({"error": "Photos must be approved before signing"}), 400

    data = request.get_json() or {}
    name = data.get("name")
    ic = data.get("ic")
    document_hash = data.get("document_hash")  # optional

    if not name or not ic:
        return jsonify({"error": "name and ic are required for signing"}), 400

    # Record signature
    contract.tenant_signature_name = name
    contract.tenant_signature_ic = ic
    contract.tenant_signature_at = datetime.utcnow()
    contract.tenant_document_hash = document_hash
    contract.tenant_signed = True

    if contract.landlord_signed:
        contract.status = "signed"
    else:
        # tenant has signed; wait for landlord
        contract.status = "tenant_signed_waiting_landlord"

    db.session.commit()

    return jsonify({
        "message": "Contract signed by tenant",
        "contract": contract.to_dict()
    }), 200

# Tenant creates escrow payment
@api_bp.route("/escrow/create", methods=["POST"])
def create_escrow():
    data = request.get_json()

    contract_id = data.get("contract_id")
    amount = data.get("amount")

    contract = Contract.query.get(contract_id)
    if not contract:
        return jsonify({"error": "Contract not found"}), 404

    # prevent double creation
    existing = Escrow.query.filter_by(contract_id=contract_id).first()
    if existing:
        return jsonify({"error": "Escrow already exists"}), 400

    escrow = Escrow(
        contract_id=contract_id,
        amount=amount,
        status="holding"
    )
    db.session.add(escrow)

    # Update contract state
    contract.status = "deposit_paid"
    db.session.commit()

    return jsonify({
        "message": "Mock deposit payment created",
        "escrow": escrow.to_dict()
    }), 201

# Tenant request deposit release
@api_bp.route("/escrow/<int:escrow_id>/request-release", methods=["POST"])
def escrow_request_release(escrow_id):
    escrow = Escrow.query.get(escrow_id)
    if not escrow:
        return jsonify({"error": "Escrow not found"}), 404

    if escrow.status != "holding":
        return jsonify({"error": "Escrow already processed"}), 400

    escrow.status = "release_requested"
    db.session.commit()

    return jsonify({
        "message": "Release request submitted",
        "escrow": escrow.to_dict()
    }), 200

# Rental history
@api_bp.route("/users/<string:ic>/rental-history", methods=["GET"])
def get_rental_history(ic):
    # Fetch contracts for this tenant
    contracts = Contract.query.filter_by(tenant_ic=ic).all()

    result = []
    for c in contracts:
        escrow = Escrow.query.filter_by(contract_id=c.id).first()

        result.append({
            "contract": c.to_dict(),
            "escrow": escrow.to_dict() if escrow else None
        })

    return jsonify(result), 200


# DEVELOPER B
@api_bp.route('/', methods=['GET'])
def home():
    return jsonify({"message": "RentSafe Backend is running!"})

# 1. CREATE Property
@api_bp.route('/properties/create', methods=['POST'])
def add_property():
    data = request.get_json()

    # Simple validation
    if not data or 'title' not in data or 'price' not in data:
        return jsonify({"message": "Error: Title and Price are required"}), 400

    # Normalize address and optional fields
    full_address = data.get('location') or data.get('address')
    if not full_address:
        full_address = f"{data.get('address', '')}, {data.get('city', '')}, {data.get('state', '')}".strip(", ")

    def to_int(value, default=0):
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def to_float(value, default=0.0):
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    amenities_value = data.get('amenities', '')
    if isinstance(amenities_value, list):
        amenities_value = ",".join(amenities_value)

    image_url = data.get('imageUrl') or data.get('image_url')

    new_property = Property(
        title=data['title'],
        description=data.get('description', ''),
        location=full_address,
        price=to_float(data.get('price')),
        landlord_ic=data.get('landlord_ic', 'UNKNOWN'),

        bedrooms=to_int(data.get('bedrooms', 1), 1),
        bathrooms=to_int(data.get('bathrooms', 1), 1),
        size_sqft=to_int(data.get('size_sqft', data.get('size', 800)), 800),
        amenities=amenities_value,
        property_type=data.get('housingType') or data.get('property_type'),
        image_url=image_url,
        status=data.get('status', 'available')
    )

    try:
        db.session.add(new_property)
        db.session.commit()
        return jsonify({"message": "Property created!", "property": new_property.to_dict()}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# 2. UPDATE Property
@api_bp.route('/properties/<int:id>/update', methods=['PUT'])
def update_property(id):
    property_item = Property.query.get(id)
    if not property_item:
        return jsonify({"message": "Property not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    def to_int(value, default=None):
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def to_float(value, default=None):
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    if 'title' in data: property_item.title = data['title']
    if 'description' in data: property_item.description = data['description']

    # Address/location
    full_address = data.get('location') or data.get('address')
    if full_address or ('city' in data or 'state' in data):
        if not full_address:
            full_address = f"{data.get('address', '')}, {data.get('city', '')}, {data.get('state', '')}".strip(", ")
        property_item.location = full_address

    price_val = to_float(data.get('price'))
    if price_val is not None: property_item.price = price_val

    bedrooms_val = to_int(data.get('bedrooms'))
    if bedrooms_val is not None: property_item.bedrooms = bedrooms_val

    bathrooms_val = to_int(data.get('bathrooms'))
    if bathrooms_val is not None: property_item.bathrooms = bathrooms_val

    size_val = to_int(data.get('size_sqft') or data.get('size'))
    if size_val is not None: property_item.size_sqft = size_val

    amenities_value = data.get('amenities')
    if amenities_value is not None:
        if isinstance(amenities_value, list):
            amenities_value = ",".join(amenities_value)
        property_item.amenities = amenities_value

    if 'housingType' in data: property_item.property_type = data['housingType']
    if 'property_type' in data: property_item.property_type = data['property_type']

    if 'imageUrl' in data: property_item.image_url = data.get('imageUrl')
    if 'image_url' in data: property_item.image_url = data.get('image_url')

    if 'status' in data: property_item.status = data['status']

    db.session.commit()
    return jsonify({"message": "Property updated", "property": property_item.to_dict()}), 200

# 3. DELETE Property
@api_bp.route('/properties/<int:id>/delete', methods=['DELETE'])
def delete_property(id):
    property_item = Property.query.get(id)
    if not property_item:
        return jsonify({"message": "Property not found"}), 404

    db.session.delete(property_item)
    db.session.commit()
    return jsonify({"message": "Property deleted"}), 200

# --- TASK 2: PROPERTY RETRIEVAL ---

# 4. GET ALL Properties
@api_bp.route('/properties/all', methods=['GET'])
def get_all_properties():
    properties = Property.query.all()
    result = [p.to_dict() for p in properties]
    return jsonify(result), 200

# 5. GET SINGLE Property
@api_bp.route('/properties/<int:id>', methods=['GET'])
def get_property(id):
    property_item = Property.query.get(id)
    if not property_item:
        return jsonify({"message": "Property not found"}), 404
    return jsonify(property_item.to_dict()), 200

# --- TASK 3: APPLICATION REVIEW ---

# 6. GET ALL Applications for a Specific Property (THIS WAS MISSING!)
@api_bp.route('/properties/<int:property_id>/applications', methods=['GET'])
def get_property_applications(property_id):
    # Fetch all applications where property_id matches
    apps = Application.query.filter_by(property_id=property_id).all()

    # Return empty list if none found, instead of 404
    if not apps:
        return jsonify([]), 200

    result = [app.to_dict() for app in apps]
    return jsonify(result), 200

# 7. GET Single Application (For Review Page)
@api_bp.route('/applications/<int:app_id>', methods=['GET'])
def get_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"message": "Application not found"}), 404
    return jsonify(application.to_dict()), 200

# 8. APPROVE Application & AUTO-GENERATE CONTRACT
@api_bp.route('/applications/<int:app_id>/approve', methods=['POST'])
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
@api_bp.route('/applications/<int:app_id>/reject', methods=['POST'])
def reject_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"message": "Not found"}), 404

    application.status = 'rejected'
    db.session.commit()
    return jsonify({"message": "Rejected", "application": application.to_dict()}), 200

# --- TASK 4 & 5: CONTRACTS & PHOTOS ---

# 10. GET SINGLE CONTRACT
@api_bp.route('/contracts/<int:contract_id>', methods=['GET'])
def get_contract(contract_id):
    contract = Contract.query.get(contract_id)
    if not contract:
        return jsonify({"message": "Contract not found"}), 404
    return jsonify(contract.to_dict()), 200

# 11. LANDLORD SIGN CONTRACT
@api_bp.route('/contracts/<int:contract_id>/landlord/sign', methods=['POST'])
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
@api_bp.route('/contracts/<int:contract_id>/upload-photos', methods=['POST'])
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
@api_bp.route('/escrow/<int:contract_id>', methods=['GET'])
def get_escrow_status(contract_id):
    # Try to find existing escrow
    escrow = Escrow.query.filter_by(contract_id=contract_id).first()

    # Logic: If contract exists but no escrow record yet, return a "Pending" placeholder
    # OR we can auto-create one. Let's return a basic status if not found.
    if not escrow:
        return jsonify({"status": "pending", "amount": 0}), 200

    return jsonify(escrow.to_dict()), 200

# 14. APPROVE RELEASE (Landlord releases money to themselves or tenant)
@api_bp.route('/escrow/<int:escrow_id>/approve-release', methods=['POST'])
def approve_escrow_release(escrow_id):
    escrow = Escrow.query.get(escrow_id)
    if not escrow:
        return jsonify({"message": "Escrow record not found"}), 404

    escrow.status = 'released'
    # In a real app, this would trigger a Bank API transfer

    db.session.commit()
    return jsonify({"message": "Funds released successfully", "escrow": escrow.to_dict()}), 200

# 15. REJECT RELEASE / DISPUTE
@api_bp.route('/escrow/<int:escrow_id>/reject-release', methods=['POST'])
def reject_escrow_release(escrow_id):
    escrow = Escrow.query.get(escrow_id)
    if not escrow:
        return jsonify({"message": "Escrow record not found"}), 404

    escrow.status = 'disputed'
    db.session.commit()
    return jsonify({"message": "Release rejected. Dispute process started.", "escrow": escrow.to_dict()}), 200

# --- TASK 7: LANDLORD DASHBOARD ---

@api_bp.route('/users/<string:ic>/landlord-dashboard', methods=['GET'])
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


@api_bp.route('/landlord/<string:ic>/tenant-history', methods=['GET'])
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

