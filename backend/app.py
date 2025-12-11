from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from db.models import db, Property, Application

# Import the database connection and the Property model we just made
from db.models import db, Property

app = Flask(__name__)

# CONFIGURATION 
# This creates a file named 'rentsafe.db' in your backend folder
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.getcwd(), 'rentsafe.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Connect the database to this app
db.init_app(app)
CORS(app)

# ROUTES 

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
        location=data.get('location', data.get('address')), # Handle both names
        price=data['price'],
        landlord_ic=data.get('landlord_ic', 'UNKNOWN'), # Default if missing
        
        # Capture new fields from frontend (with defaults if they don't send them)
        bedrooms=data.get('noOfBed', data.get('bedrooms', 1)),
        bathrooms=data.get('noOfToilet', data.get('bathrooms', 1)),
        size_sqft=data.get('noOfSqft', data.get('size_sqft', 800)),
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

# TASK 2: PROPERTY RETRIEVAL

# 4. GET ALL Properties
@app.route('/properties/all', methods=['GET'])
def get_all_properties():
    # Fetch all properties from the database
    properties = Property.query.all()
    
    # Convert the list of objects into a list of dictionaries (JSON)
    result = [p.to_dict() for p in properties]
    
    return jsonify(result), 200

# 5. GET SINGLE Property
@app.route('/properties/<int:id>', methods=['GET'])
def get_property(id):
    # Find the property by ID
    property_item = Property.query.get(id)
    
    if not property_item:
        return jsonify({"message": "Property not found"}), 404
        
    return jsonify(property_item.to_dict()), 200

# TASK 3: APPLICATION REVIEW 

# 6. GET Application (For Review Page)
@app.route('/applications/<int:app_id>', methods=['GET'])
def get_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"message": "Application not found"}), 404
    return jsonify(application.to_dict()), 200

# 7. APPROVE Application
@app.route('/applications/<int:app_id>/approve', methods=['POST'])
def approve_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"message": "Not found"}), 404
        
    application.status = 'approved'
    db.session.commit()
    return jsonify({"message": "Approved", "application": application.to_dict()}), 200

# 8. REJECT Application
@app.route('/applications/<int:app_id>/reject', methods=['POST'])
def reject_application(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({"message": "Not found"}), 404
        
    application.status = 'rejected'
    db.session.commit()
    return jsonify({"message": "Rejected", "application": application.to_dict()}), 200

# --- RUN THE SERVER ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # This creates the database file automatically
        print("Database connected and ready.")
    app.run(debug=True, port=5000)