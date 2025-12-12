from app import app
from db.db_tables import db, Property, Contract, Escrow
from datetime import datetime

def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # 1. Create Property
        prop = Property(
            title="Escrow Test Condo",
            location="Cyberjaya",
            price=2000,
            landlord_ic="800515-01-5678"
        )
        db.session.add(prop)
        db.session.commit()

        # 2. Create Contract
        contract = Contract(
            property_id=prop.id,
            tenant_ic="950101-01-1234",
            landlord_ic="800515-01-5678",
            monthly_rent=2000,
            deposit_amount=4000,
            status='active'
        )
        db.session.add(contract)
        db.session.commit()

        # 3. Create Escrow (Status: release_requested)
        # This simulates a tenant asking for their deposit back, or a landlord claiming rent
        escrow = Escrow(
            contract_id=contract.id,
            amount=4000,
            status='release_requested', # Ready for you to Approve/Reject
            payment_method='FPX',
            paid_at=datetime.utcnow()
        )
        db.session.add(escrow)
        db.session.commit()
        
        print(f"✅ Created Escrow ID: {escrow.id} for Contract {contract.id}")

if __name__ == '__main__':
    seed()