from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# 1. PROPERTY MODEL
class Property(db.Model):
    __tablename__ = 'properties'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    landlord_ic = db.Column(db.String(20), default='UNKNOWN')
    bedrooms = db.Column(db.Integer, default=1)
    bathrooms = db.Column(db.Integer, default=1)
    size_sqft = db.Column(db.Integer, default=500)
    property_type = db.Column(db.String(50), nullable=True)
    amenities = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'location': self.location,
            'price': self.price,
            'description': self.description,
            'photos': [self.image_url] if self.image_url else ["https://placehold.co/600x400"], # Frontend expects an array
            'city': self.location.split(',')[1] if ',' in self.location else self.location, # Simple mock city extraction
            'state': self.location.split(',')[-1] if ',' in self.location else "Malaysia"
        }

# 2. APPLICATION MODEL 
class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    tenant_ic = db.Column(db.String(20), nullable=False)
    tenant_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Link to Property
    property = db.relationship('Property', backref=db.backref('applications', lazy=True))

    def to_dict(self):
        return {
            'id': str(self.id), # Frontend often expects string IDs in URLs
            'propertyId': str(self.property_id),
            'tenantName': self.tenant_name,
            'tenantIc': self.tenant_ic,
            'status': self.status,
            'appliedAt': self.applied_at.isoformat(),
            # NESTED PROPERTY DATA
            'property': self.property.to_dict() if self.property else None
        }