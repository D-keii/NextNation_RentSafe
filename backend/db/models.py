from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Property(db.Model):
    __tablename__ = 'properties'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    landlord_ic = db.Column(db.String(15), nullable=False) 
    
    # --- NEW FIELDS FOR FRONTEND ---
    bedrooms = db.Column(db.Integer, default=1)
    bathrooms = db.Column(db.Integer, default=1)
    size_sqft = db.Column(db.Integer, default=500)
    image_url = db.Column(db.String(255), nullable=True) # To store image link
    status = db.Column(db.String(20), default='available') # available, rented, etc.
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Converts this object to a dictionary matching Frontend names"""
        return {
            'id': self.id,
            # Frontend uses 'name' or 'propertyName' - let's send 'title' and frontend can adapt, 
            # OR we send multiple keys to be safe:
            'title': self.title,
            'name': self.title,              # For SavedListings
            'propertyName': self.title,      # For ApplicationListings
            
            'location': self.location,
            
            'price': self.price,
            'monthlyRental': self.price,     # For SavedListings
            
            # New fields
            'noOfBed': self.bedrooms,
            'noOfToilet': self.bathrooms,
            'noOfSqft': self.size_sqft,
            'imageUrl': self.image_url if self.image_url else "https://placehold.co/600x400", # Fallback image
            'status': self.status,
            'applyDate': self.created_at.strftime('%Y-%m-%d') # Format date for frontend
        }