import os
import requests
import uuid
import shutil
import mimetypes
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

load_dotenv()

# Real waste taxonomy mapping as requested
WASTE_TAXONOMY = {
    "cardboard": {"category": "Recyclable", "disposal_method": "Dry Waste / Recycling", "severity": "Low", "mapped_type": "Paper"},
    "glass": {"category": "Recyclable", "disposal_method": "Dry Waste / Recycling", "severity": "Medium", "mapped_type": "Glass"},
    "metal": {"category": "Recyclable", "disposal_method": "Dry Waste / Recycling", "severity": "Medium", "mapped_type": "Metal"},
    "paper": {"category": "Recyclable", "disposal_method": "Dry Waste / Recycling", "severity": "Low", "mapped_type": "Paper"},
    "plastic": {"category": "Recyclable", "disposal_method": "Dry Waste / Recycling", "severity": "High", "mapped_type": "Plastic"},
    "trash": {"category": "Mixed Waste", "disposal_method": "Landfill", "severity": "Critical", "mapped_type": "Mixed Waste"}
}

def save_upload(file: UploadFile) -> str:
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(422, "Invalid file type. Only JPG, PNG, WEBP are allowed.")
    
    ext = mimetypes.guess_extension(file.content_type)
    filename = f"{uuid.uuid4().hex}{ext}"
    os.makedirs("uploads", exist_ok=True)
    filepath = os.path.join("uploads", filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return filepath

def analyze_image_hf(filepath: str):
    model = os.getenv("AI_MODEL_NAME", "yangy50/garbage-classification")
    hf_key = os.getenv("HF_API_KEY")
    
    if not hf_key:
        return {"waste_type": "Unknown", "confidence": 0.0, "category": "Unknown", "severity": "Low", "model": "No API Key"}

    api_url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {"Authorization": f"Bearer {hf_key}"}
    
    try:
        with open(filepath, "rb") as f:
            data = f.read()
        response = requests.post(api_url, headers=headers, data=data)
        
        if response.status_code == 200:
            preds = response.json()
            if isinstance(preds, list) and len(preds) > 0:
                best = preds[0]
                label = best['label'].lower()
                tax = WASTE_TAXONOMY.get(label, {"category": "Unknown", "severity": "Medium", "mapped_type": "Unknown"})
                
                return {
                    "waste_type": tax["mapped_type"],
                    "confidence": round(best['score'], 2),
                    "category": tax["category"],
                    "severity": tax["severity"],
                    "model": model
                }
    except Exception as e:
        print(f"AI Model Error: {e}")
    
    return {"waste_type": "Unknown", "confidence": 0.0, "category": "Unknown", "severity": "Low", "model": model}
