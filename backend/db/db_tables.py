from db.db import db
from sqlalchemy import UniqueConstraint
from sqlalchemy import func
from datetime import datetime


class Tenant(db.Model):
    __tablename__ = "tenants"
    id = db.Column(db.Integer, primary_key = True)
    ic = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(20), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "ic": self.ic,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
        }