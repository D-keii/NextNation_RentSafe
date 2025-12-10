from flask import Flask, jsonify, request
from flask_cors import CORS
import os

# Import the database connection and the Property model we just made
from db.models import db, Property

app = Flask(__name__)

# --- CONFIGURATION ---
# This creates a file named 'rentsafe.db' in your backend folder
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

    new_property = Property(
        title=data['title'],
        description=data.get('description', ''),
        location=data['location'],
        price=data['price'],
        landlord_ic=data['landlord_ic']
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

# --- RUN THE SERVER ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # This creates the database file automatically
        print("Database connected and ready.")
    app.run(debug=True, port=5000)