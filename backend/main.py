from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv() # Load environment variables

app = FastAPI(title="VisionSEO API")

# Use universally permissive CORS to prevent ghost errors during quota exhaustion
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    err_str = str(exc)
    status_code = 500
    
    # Identify Quota errors to provide better UX
    if "429" in err_str or "quota" in err_str.lower():
        status_code = 429
        
    print(f"GLOBAL ERROR: {err_str}")
    return JSONResponse(
        status_code=status_code,
        content={"status": "error", "message": err_str}
    )

@app.get("/")
def read_root():
    return {"status": "ok", "message": "VisionSEO API is running"}

import shutil
import uuid
from services.ai_service import analyze_image_fast, analyze_image_deep

@app.post("/analyze-image-fast")
async def analyze_image_fast_route(
    file: UploadFile = File(...)
):
    temp_filename = f"temp_fast_{uuid.uuid4()}_{file.filename}"
    temp_filepath = os.path.join(os.getcwd(), temp_filename)
    
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        results = await analyze_image_fast(temp_filepath)
    finally:
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
            
    return results

@app.post("/analyze-image-deep")
async def analyze_image_deep_route(
    file: UploadFile = File(...)
):
    temp_filename = f"temp_deep_{uuid.uuid4()}_{file.filename}"
    temp_filepath = os.path.join(os.getcwd(), temp_filename)
    
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        results = await analyze_image_deep(temp_filepath)
    finally:
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
            
    return results

from services.ai_service import generate_vision_aeo_unified

@app.post("/analyze-image-unified")
async def analyze_image_unified_route(
    file: UploadFile = File(...),
    tone: str = Form("Professional"),
    audience: str = Form("General Public")
):
    temp_filename = f"temp_unified_{uuid.uuid4()}_{file.filename}"
    temp_filepath = os.path.join(os.getcwd(), temp_filename)
    
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        results = await generate_vision_aeo_unified(temp_filepath, tone, audience)
    finally:
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
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        prompt = f"""
        You are a master editor. Rewrite the following text according to the requested action.
        Original Text: "{req.original_text}"
        Action to perform: {req.action} (e.g., 'expand', 'condense', 'make more professional', 'make viral')
        Target Tone: {req.tone}
        Target Audience: {req.audience}
        
        Return ONLY the rewritten text. Do not include quotes, markdown wrapping, or conversational filler. Keep HTML tags if they exist in the original.
        """
        
        response = await model.generate_content_async(prompt)
        return {"status": "success", "rewritten_text": response.text.strip()}
    except Exception as e:
        print(f"Rewrite error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from services.ai_service import generate_seo_from_vision, generate_blog_from_data
from typing import Optional, Dict, Any

class SEORequest(BaseModel):
    object_name: Optional[str] = "Unknown Object"

@app.post("/generate-seo-insights")
async def generate_seo(req: SEORequest):
    try:
        results = await generate_seo_from_vision(req.object_name)
        return results
    except Exception as e:
        print(f"SEO Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class BlogRequest(BaseModel):
    vision_data: Optional[Dict[str, Any]] = {}
    seo_data: Optional[Dict[str, Any]] = {}
    tone: Optional[str] = "Professional"
    audience: Optional[str] = "General Public"

@app.post("/generate-blog")
async def generate_blog(req: BlogRequest):
    try:
        results = await generate_blog_from_data(req.vision_data, req.seo_data, req.tone, req.audience)
        return results
    except Exception as e:
        print(f"Blog Generation error: {e}")
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
