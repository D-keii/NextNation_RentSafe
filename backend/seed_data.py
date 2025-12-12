from app import app
from db.db_tables import db, Property, Application
from datetime import datetime

def seed():
    with app.app_context():
        # 1. Reset Database
        db.drop_all()
        db.create_all()
        print("🗑️  Old data wiped. Database created.")

        # 2. INSERT PROPERTIES
        properties = [
            Property(
                title="Modern Studio Apartment in KLCC",
                description="Fully furnished studio with stunning city views. Walking distance to Pavilion and KLCC.",
                location="Unit 15-03, The Troika, Persiaran KLCC, Kuala Lumpur",
                price=2800,
                landlord_ic="800515-01-5678",
                bedrooms=1,
                bathrooms=1,
                size_sqft=550,
                property_type="studio",
                amenities="WiFi, Air Conditioning, Swimming Pool, Gym, Security, Parking",
                image_url="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
                status="verified"
            ),
            Property(
                title="Cozy 2BR Condo in Bangsar South",
                description="Spacious 2-bedroom unit with modern finishes. Near LRT station and The Sphere.",
                location="Block A, Southview Residences, Jalan Kerinchi, Petaling Jaya",
                price=2200,
                landlord_ic="800515-01-5678",
                bedrooms=2,
                bathrooms=2,
                size_sqft=850,
                property_type="condo",
                amenities="WiFi, Air Conditioning, Swimming Pool, Playground, Security",
                image_url="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
                status="verified"
            ),
            Property(
                title="Family Home in Mont Kiara",
                description="3-bedroom family home with garden. Quiet neighborhood, near international schools.",
                location="12, Jalan Kiara 5, Mont Kiara, Kuala Lumpur",
                price=4500,
                landlord_ic="750820-02-9012",
                bedrooms=3,
                bathrooms=3,
                size_sqft=1800,
                property_type="house",
                amenities="Garden, Parking, Air Conditioning, Security, Near Schools",
                image_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
                status="verified"
            ),
            Property(
                title="Family Home in Johor",
                description="3-bedroom family home with garden. Quiet neighborhood, near international schools.",
                location="12, Jalan Kiara 5, Johor Bahru, Johor Bahru",
                price=4500,
                landlord_ic="000000-00-0000",
                bedrooms=3,
                bathrooms=3,
                size_sqft=1800,
                property_type="house",
                amenities="Garden, Parking, Air Conditioning, Security, Near Schools",
                image_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
                status="verified"
            )
        ]

        db.session.add_all(properties)
        db.session.commit()  # Commit to get IDs
        print(f"✅ {len(properties)} Properties added.")

        # 3. INSERT APPLICATIONS
        apps = [
            Application(property_id=properties[0].id, tenant_ic="950101-01-1234", tenant_name="Ahmad Bin Abdullah", status="pending", applied_at=datetime(2024, 2, 20)),
            Application(property_id=properties[1].id, tenant_ic="960202-02-2222", tenant_name="Nur Aina Binti Salleh", status="approved", applied_at=datetime(2024, 2, 22)),
            Application(property_id=properties[2].id, tenant_ic="920707-07-7777", tenant_name="Chan Li Wei", status="rejected", applied_at=datetime(2024, 2, 18)),
            Application(property_id=properties[1].id, tenant_ic="950101-01-1234", tenant_name="Ahmad Bin Abdullah", status="approved", applied_at=datetime(2023, 2, 15)),
            Application(property_id=properties[0].id, tenant_ic="930808-08-8888", tenant_name="Lim Wei Jie", status="approved", applied_at=datetime(2024, 1, 10)),
            Application(property_id=properties[2].id, tenant_ic="960202-02-2222", tenant_name="Nur Aina Binti Salleh", status="approved", applied_at=datetime(2024, 3, 1)),
        ]

        db.session.add_all(apps)
        db.session.commit()
        print(f"✅ All {len(apps)} Applications added successfully!")

if __name__ == '__main__':
    seed()
