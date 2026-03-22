from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv
import google.generativeai as genai

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
async def analyze_image(
    file: UploadFile = File(...),
    tone: str = Form("Professional"),
    audience: str = Form("General Public")
):
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_filepath = os.path.join(os.getcwd(), temp_filename)
    
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Analyze using Gemini
        results = analyze_image_with_gemini(temp_filepath, tone, audience)
    finally:
        # Clean up temp file
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
            
    return results

from pydantic import BaseModel

class RewriteRequest(BaseModel):
    original_text: str
    action: str
    tone: str
    audience: str

@app.post("/rewrite-text")
async def rewrite_text(req: RewriteRequest):
    # This feature requires just text, so we can use a simpler Gemini call
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        You are a master editor. Rewrite the following text according to the requested action.
        Original Text: "{req.original_text}"
        Action to perform: {req.action} (e.g., 'expand', 'condense', 'make more professional', 'make viral')
        Target Tone: {req.tone}
        Target Audience: {req.audience}
        
        Return ONLY the rewritten text. Do not include quotes, markdown wrapping, or conversational filler. Keep HTML tags if they exist in the original.
        """
        
        response = model.generate_content(prompt)
        return {"status": "success", "rewritten_text": response.text.strip()}
    except Exception as e:
        print(f"Rewrite error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import Form
import json

@app.post("/publish-wordpress")
async def publish_wordpress(data: str = Form(...), file: UploadFile = File(None)):
    try:
        parsed_data = json.loads(data)
    except Exception as e:
        print(f"JSON Parse error: {e}, Data: {data}")
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
            print(f"WP Publish error: {result['message']}")
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    finally:
        if temp_filepath and os.path.exists(temp_filepath):
            os.remove(temp_filepath)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
