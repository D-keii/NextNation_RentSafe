from db.db import db
from sqlalchemy import UniqueConstraint
from sqlalchemy import func
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key = True)
    ic = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(20), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String(20), nullable=True)
    def to_dict(self):
        return {
            "id": self.id,
            "ic": self.ic,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
        }

# Tenant Dashboard
class Listing(db.Model):
    __tablename__ = "listings"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    location = db.Column(db.String(200))
    monthly_rental = db.Column(db.Integer)
    no_bed = db.Column(db.Integer)
    no_toilet = db.Column(db.Integer)
    sqft = db.Column(db.Integer)
    image_url = db.Column(db.String(300))

class SavedListing(db.Model):
    __tablename__= "saved_listings"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    listing_id = db.Column(db.Integer, db.ForeignKey("listings.id"))

class TenantPreference(db.Model):
    __tablename__ = "tenant_preferences"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    preferred_location = db.Column(db.String(200), nullable=True)
    min_rent = db.Column(db.Integer, nullable=True)
    max_rent = db.Column(db.Integer, nullable=True)
    min_bedrooms = db.Column(db.Integer, nullable=True)

