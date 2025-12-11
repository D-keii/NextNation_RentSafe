from app import app
from db.models import db, Property, Contract

def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # 1. Create Property
        prop = Property(
            title="Luxury Condo in KL",
            location="KL City Centre",
            price=3000,
            landlord_ic="800515-01-5678"
        )
        db.session.add(prop)
        db.session.commit()

        # 2. Create Contract (Status: pending_photos)
        contract = Contract(
            property_id=prop.id,
            tenant_ic="950101-01-1234",
            landlord_ic="800515-01-5678",
            monthly_rent=3000,
            deposit_amount=6000,
            status='pending_photos' # <--- This allows you to test the upload!
        )
        db.session.add(contract)
        db.session.commit()
        print(f"✅ Created Contract ID: {contract.id} (Pending Photos)")

if __name__ == '__main__':
    seed()