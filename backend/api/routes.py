from flask import request, url_for, jsonify, redirect, render_template_string
from . import api_bp
from db.db import db
from db.db_tables import User, TenantPreference, Listing, SavedListing
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

    redirect_url = url_for(
        f"http://localhost:5173/mock-digitalid?session={session_id}"
    )
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

    existing = User.query.filter_by(email=profile["email"]).first()
    if not existing:
        user = User(email=profile["ic"], name=profile["name"], age=profile["age"], gender=profile["gender"])
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