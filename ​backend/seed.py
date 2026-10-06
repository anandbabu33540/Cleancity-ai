from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.models import Ward, WasteReport
import random

Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(WasteReport).first():
        print("Database already seeded!")
        db.close()
        return

    # Seed Wards
    wards = [
        Ward(name="Downtown Ward", latitude=26.8467, longitude=80.9462),
        Ward(name="North Ward", latitude=26.8567, longitude=80.9562),
        Ward(name="Industrial Ward", latitude=26.8367, longitude=80.9362),
    ]
    db.add_all(wards)
    db.commit()

    # Seed Reports
    waste_types = ["Plastic", "Paper", "Metal", "Glass", "Mixed Waste"]
    severities = ["Low", "Medium", "High", "Critical"]
    statuses = ["Pending", "In Progress", "Resolved"]
    
    print("Generating demo reports...")
    for i in range(1, 45):
        report = WasteReport(
            report_id=f"REP-DEMO-{i:04d}",
            image_path="/uploads/demo.jpg",
            waste_type=random.choice(waste_types),
            confidence=round(random.uniform(0.70, 0.99), 2),
            category="Recyclable" if i % 2 == 0 else "Mixed Waste",
            severity=random.choice(severities),
            description=f"Generated demo report {i}",
            latitude=26.8467 + random.uniform(-0.02, 0.02),
            longitude=80.9462 + random.uniform(-0.02, 0.02),
            address="Demo Address, City",
            status=random.choice(statuses)
        )
        db.add(report)
        
    db.commit()
    print("Successfully seeded 45 reports and 3 wards for demo purposes.")
    db.close()

if __name__ == "__main__":
    seed_data()
