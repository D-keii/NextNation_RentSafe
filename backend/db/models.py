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
            'photos': [self.image_url] if self.image_url else ["https://placehold.co/600x400"],
            'city': self.location.split(',')[1] if ',' in self.location else self.location,
            'state': self.location.split(',')[-1] if ',' in self.location else "Malaysia"
        }

# 2. APPLICATION MODEL
class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    tenant_ic = db.Column(db.String(20), nullable=False)
    tenant_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='pending')
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    property = db.relationship('Property', backref=db.backref('applications', lazy=True))

    def to_dict(self):
        return {
            'id': str(self.id),
            'propertyId': str(self.property_id),
            'tenantName': self.tenant_name,
            'tenantIc': self.tenant_ic,
            'status': self.status,
            'appliedAt': self.applied_at.isoformat(),
            'property': self.property.to_dict() if self.property else None
        }

# 3. CONTRACT MODEL 
class Contract(db.Model):
    __tablename__ = 'contracts'
    
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    tenant_ic = db.Column(db.String(20), nullable=False)
    landlord_ic = db.Column(db.String(20), nullable=False)
    
    # Financials
    monthly_rent = db.Column(db.Float, nullable=False)
    deposit_amount = db.Column(db.Float, nullable=False)
    
    # Status Tracking
    # pending_photos -> pending_tenant_approval -> active
    status = db.Column(db.String(50), default='pending_photos') 
    
    # Store photos as a long string
    property_photos = db.Column(db.Text, nullable=True) 
    
    # Relationships
    property = db.relationship('Property', backref=db.backref('contracts', lazy=True))

    def to_dict(self):
        return {
            'id': str(self.id),
            'propertyId': str(self.property_id),
            'tenantIc': self.tenant_ic,
            'landlordIc': self.landlord_ic,
            'status': self.status,
            'monthlyRent': self.monthly_rent,
            'depositAmount': self.deposit_amount,
            # Convert string back to list for frontend
            'propertyPhotos': self.property_photos.split(',') if self.property_photos else [],
            'property': self.property.to_dict() if self.property else None
        }