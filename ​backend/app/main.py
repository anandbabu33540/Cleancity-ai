import os
import uuid
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import engine, Base, get_db
from app.models.models import WasteReport, Ward, User
from app.schemas.schemas import ReportCreate, ReportOut
from app.ai.analyzer import save_upload, analyze_image_hf

# Generate database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CleanCity-AI API")

# CORS Configuration for GitHub Pages integration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "https://*.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- AI ENDPOINT ---
@app.post("/api/ai/analyze")
async def analyze_waste(image: UploadFile = File(...)):
    filepath = save_upload(image)
    result = analyze_image_hf(filepath)
    result["image_path"] = f"/uploads/{os.path.basename(filepath)}"
    return result

# --- REPORTS ENDPOINT ---
@app.post("/api/reports", response_model=ReportOut)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    report_id = f"REP-{uuid.uuid4().hex[:6].upper()}"
    new_report = WasteReport(report_id=report_id, **report.model_dump())
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

# --- ADMIN & ANALYTICS ENDPOINTS ---
@app.get("/api/statistics/public")
def public_stats(db: Session = Depends(get_db)):
    total = db.query(WasteReport).count()
    resolved = db.query(WasteReport).filter(WasteReport.status == "Resolved").count()
    active_wards = db.query(Ward).count()
    
    return {
        "total_reports": total,
        "resolved_reports": resolved,
        "active_wards": active_wards if active_wards > 0 else 15,
        "detection_count": total
    }

@app.get("/api/admin/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(WasteReport).count()
    resolved = db.query(WasteReport).filter(WasteReport.status == "Resolved").count()
    
    # Real database aggregation for Recharts
    types = db.query(WasteReport.waste_type, func.count(WasteReport.id)).group_by(WasteReport.waste_type).all()
    type_data = [{"name": t[0], "value": t[1]} for t in types]

    return {
        "overview": {
            "total_reports": total,
            "resolved": resolved,
            "pending": total - resolved,
            "resolution_rate": round((resolved/total)*100, 1) if total > 0 else 0
        },
        "waste_distribution": type_data
    }

@app.get("/api/hotspots")
def get_hotspots(db: Session = Depends(get_db)):
    # Mathematical Risk Score Calculation logic
    reports = db.query(WasteReport).filter(WasteReport.status != "Resolved").all()
    
    clusters = {}
    for r in reports:
        # Group by approximate area
        key = f"{round(r.latitude, 3)}_{round(r.longitude, 3)}"
        if key not in clusters:
            clusters[key] = {"lat": r.latitude, "lng": r.longitude, "count": 0, "severity_score": 0}
        
        clusters[key]["count"] += 1
        
        # Add weights based on severity
        weight = 1
        if r.severity == "Medium": weight = 2
        elif r.severity == "High": weight = 3
        elif r.severity == "Critical": weight = 5
        clusters[key]["severity_score"] += weight

    hotspots = []
    for key, data in clusters.items():
        # risk_score = report_frequency * 0.4 + severity_score * 0.6
        risk = min(100, (data["count"] * 10 * 0.4) + (data["severity_score"] * 10 * 0.6))
        
        sev_label = "Low"
        if risk > 30: sev_label = "Medium"
        if risk > 60: sev_label = "High"
        if risk > 80: sev_label = "Critical"
        
        hotspots.append({
            "latitude": data["lat"],
            "longitude": data["lng"],
            "report_count": data["count"],
            "risk_score": round(risk, 1),
            "severity": sev_label
        })
        
    return hotspots
