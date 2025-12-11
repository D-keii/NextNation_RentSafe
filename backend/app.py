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
