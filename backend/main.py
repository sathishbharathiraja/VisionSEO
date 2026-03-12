from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables

app = FastAPI(title="VisionSEO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "VisionSEO API is running"}

import shutil
import uuid
from services.ai_service import analyze_image_with_gemini
from services.wp_service import publish_to_wordpress

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    # Save the file temporarily
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_filepath = os.path.join(os.getcwd(), temp_filename)
    
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Analyze using Gemini
        results = analyze_image_with_gemini(temp_filepath)
    finally:
        # Clean up temp file
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
            
    return results

from fastapi import Form
import json

@app.post("/publish-wordpress")
async def publish_wordpress(data: str = Form(...), file: UploadFile = File(None)):
    try:
        parsed_data = json.loads(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid JSON data format")

    temp_filepath = None
    if file:
        temp_filename = f"wp_{uuid.uuid4()}_{file.filename}"
        temp_filepath = os.path.join(os.getcwd(), temp_filename)
        with open(temp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    try:
        result = publish_to_wordpress(parsed_data, temp_filepath)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    finally:
        if temp_filepath and os.path.exists(temp_filepath):
            os.remove(temp_filepath)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
