from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Property(db.Model):
    __tablename__ = 'properties'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # We will combine address+city+state into this column
    location = db.Column(db.String(255), nullable=False)
    
    price = db.Column(db.Float, nullable=False)
    landlord_ic = db.Column(db.String(20), default='UNKNOWN')
    
    # Details
    bedrooms = db.Column(db.Integer, default=1)
    bathrooms = db.Column(db.Integer, default=1)
    size_sqft = db.Column(db.Integer, default=500)
    
    # New Fields matched to your Frontend
    property_type = db.Column(db.String(50), nullable=True) # For "housingType"
    amenities = db.Column(db.Text, nullable=True)           # Will save as "WiFi, Gym, Pool"
    
    image_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'price': self.price,
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'size_sqft': self.size_sqft,
            'housingType': self.property_type,
            'amenities': self.amenities.split(', ') if self.amenities else [], # Convert string back to list
            'imageUrl': self.image_url if self.image_url else "https://placehold.co/600x400",
            'status': self.status
        }