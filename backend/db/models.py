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
    monthly_rent = db.Column(db.Float, nullable=False)
    deposit_amount = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='pending_photos') 
    property_photos = db.Column(db.Text, nullable=True) 
    tenant_signed = db.Column(db.Boolean, default=False)
    landlord_signed = db.Column(db.Boolean, default=False)
    landlord_signature_data = db.Column(db.Text, nullable=True)
    photos_approved = db.Column(db.Boolean, default=False)
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
            'startDate': self.start_date.isoformat(),
            'endDate': self.end_date.isoformat(),
            'propertyPhotos': self.property_photos.split(',') if self.property_photos else [],
            'tenantSigned': self.tenant_signed,
            'landlordSigned': self.landlord_signed,
            'photosApproved': self.photos_approved,
            'property': self.property.to_dict() if self.property else None
        }

# 4. ESCROW MODEL (NEW!)
class Escrow(db.Model):
    __tablename__ = 'escrow'
    
    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    
    # Status options: pending, secured, release_requested, released, disputed
    status = db.Column(db.String(50), default='pending') 
    payment_method = db.Column(db.String(50), nullable=True) # FPX, DuitNow
    paid_at = db.Column(db.DateTime, nullable=True)

    contract = db.relationship('Contract', backref=db.backref('escrow', uselist=False))

    def to_dict(self):
        return {
            'id': str(self.id),
            'contractId': str(self.contract_id),
            'amount': self.amount,
            'status': self.status,
            'paymentMethod': self.payment_method,
            'paidAt': self.paid_at.isoformat() if self.paid_at else None
        }