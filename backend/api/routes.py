from flask import request, url_for, jsonify, redirect, render_template_string
from . import api_bp
from db.db import db
from db.db_tables import User, TenantPreference, Listing, SavedListing, RentalApplication, Contract
from datetime import datetime
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

