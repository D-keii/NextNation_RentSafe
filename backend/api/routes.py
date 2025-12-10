from flask import request, url_for, jsonify, redirect, render_template_string
from . import api_bp
from db.db import db
from db.db_tables import Tenant
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
        "verified": True
    }

    redirect_url = url_for(
        "api_bp.mock_mydigitalid_page",
        session=session_id,
        _external=True
    )
    return jsonify({"redirect_url": redirect_url})


