"""
Script to add a new verified property to the database.
This adds a property with verified status without resetting the database.
"""
from app import app
from db.db_tables import db, Property

def add_verified_property():
    with app.app_context():
        # Create a new verified property
        new_property = Property(
            title="Luxury Penthouse in Damansara Heights",
            description="Spacious 4-bedroom penthouse with panoramic city views. Premium finishes and modern amenities. Perfect for executives and families.",
            location="Level 38, The Pinnacle, Damansara Heights, Kuala Lumpur",
            price=6500,
            landlord_ic="000000-00-0000",
            bedrooms=4,
            bathrooms=3,
            size_sqft=2200,
            property_type="penthouse",
            amenities="WiFi, Air Conditioning, Swimming Pool, Gym, Security, Parking, Concierge, Rooftop Garden",
            image_url="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
            status="verified"
        )

        try:
            db.session.add(new_property)
            db.session.commit()
            print(f"✅ Successfully added verified property: '{new_property.title}' (ID: {new_property.id})")
            print(f"   Price: RM {new_property.price}/month")
            print(f"   Location: {new_property.location}")
            return new_property
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error adding property: {e}")
            return None

if __name__ == '__main__':
    add_verified_property()

