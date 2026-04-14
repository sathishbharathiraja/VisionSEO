from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any
from pydantic import BaseModel
import os
import shutil
import tempfile
import uuid
import json
from dotenv import load_dotenv
import google.generativeai as genai

from services.ai_service import analyze_image_fast, analyze_image_deep
from services.ai_service import generate_vision_aeo_unified
from services.ai_service import generate_seo_from_vision, generate_blog_from_data
from services.wp_service import publish_to_wordpress

load_dotenv()

app = FastAPI(title="VisionSEO API", version="3.0.0")

# ── Constants ─────────────────────────────────────────────────────────────────
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB hard limit

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "video/webm",
}

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    err_str = str(exc)
    status_code = 500

    if "429" in err_str or "quota" in err_str.lower():
        status_code = 429
        # Safe quota message — no internals exposed
        return JSONResponse(
            status_code=429,
            content={"status": "error", "message": "API quota exceeded. Please wait and try again."}
        )

    # Log full error server-side only; never send to client
    print(f"GLOBAL ERROR [{request.url.path}]: {err_str}")
    return JSONResponse(
        status_code=status_code,
        content={"status": "error", "message": "An internal server error occurred. Please try again."}
    )


def validate_upload(file: UploadFile) -> None:
    """Validate file MIME type and size. Raises HTTPException on failure."""
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{content_type}'. Allowed: images (JPEG, PNG, WEBP) and videos (MP4, MOV, WEBM)."
        )


async def save_upload_to_tempfile(file: UploadFile) -> str:
    """
    Saves the uploaded file to a secure OS temp file.
    - Uses tempfile.mkstemp (no user-controlled path components)
    - Enforces MAX_UPLOAD_SIZE
    Returns the temp file path. Caller MUST delete it in a finally block.
    """
    # Determine a safe extension from the MIME type (never from user input)
    mime_to_ext = {
        "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
        "image/gif": ".gif", "video/mp4": ".mp4", "video/quicktime": ".mov",
        "video/webm": ".webm",
    }
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    ext = mime_to_ext.get(content_type, ".bin")

    fd, temp_path = tempfile.mkstemp(suffix=ext, prefix="vseo_")
    bytes_written = 0
    try:
        with os.fdopen(fd, "wb") as tmp:
            chunk_size = 1024 * 64  # 64 KB chunks
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                bytes_written += len(chunk)
                if bytes_written > MAX_UPLOAD_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum allowed size is {MAX_UPLOAD_SIZE // (1024*1024)} MB."
                    )
                tmp.write(chunk)
    except HTTPException:
        # Clean up the partial temp file before re-raising
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.") from e

    return temp_path


# ── Health / Root ─────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "ok", "message": "VisionSEO API is running", "version": "3.0.0"}

@app.get("/health")
def health_check():
    """Render uses this to verify the service is alive."""
    return {"status": "healthy", "service": "visionseo-backend"}


# ── Image Analysis Routes ─────────────────────────────────────────────────────
@app.post("/analyze-image-fast")
async def analyze_image_fast_route(file: UploadFile = File(...)):
    validate_upload(file)
    temp_path = await save_upload_to_tempfile(file)
    try:
        return await analyze_image_fast(temp_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/analyze-image-deep")
async def analyze_image_deep_route(file: UploadFile = File(...)):
    validate_upload(file)
    temp_path = await save_upload_to_tempfile(file)
    try:
        return await analyze_image_deep(temp_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/analyze-image-unified")
async def analyze_image_unified_route(
    file: UploadFile = File(...),
    tone: str = Form("Professional"),
    audience: str = Form("General Public")
):
    validate_upload(file)
    # Sanitize tone / audience to prevent prompt injection via form fields
    ALLOWED_TONES = {
        "Professional", "Casual & Conversational", "Humorous & Witty",
        "Persuasive & Sales-Driven", "Authoritative & Academic"
    }
    ALLOWED_AUDIENCES = {
        "General Public", "Industry Professionals", "Beginners & Novices",
        "C-Suite Executives", "Tech-Savvy Gamers / Developers"
    }
    safe_tone = tone if tone in ALLOWED_TONES else "Professional"
    safe_audience = audience if audience in ALLOWED_AUDIENCES else "General Public"

    temp_path = await save_upload_to_tempfile(file)
    try:
        return await generate_vision_aeo_unified(temp_path, safe_tone, safe_audience)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ── Text Rewriter ─────────────────────────────────────────────────────────────
class RewriteRequest(BaseModel):
    original_text: str
    action: str
    tone: str
    audience: str

@app.post("/rewrite-text")
async def rewrite_text(req: RewriteRequest):
    # Guard against overly large rewrite requests
    if len(req.original_text) > 10000:
        raise HTTPException(status_code=400, detail="Text too long. Maximum 10,000 characters.")

    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Service configuration error.")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        prompt = f"""
        You are a master editor. Rewrite the following text according to the requested action.
        Original Text: "{req.original_text}"
        Action to perform: {req.action}
        Target Tone: {req.tone}
        Target Audience: {req.audience}

        Return ONLY the rewritten text. Do not include quotes, markdown wrapping, or conversational filler. Keep HTML tags if they exist in the original.
        """

        response = await model.generate_content_async(prompt)
        return {"status": "success", "rewritten_text": response.text.strip()}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Rewrite error: {e}")
        raise HTTPException(status_code=500, detail="Text rewrite failed. Please try again.")


# ── SEO & Blog Generation ─────────────────────────────────────────────────────
class SEORequest(BaseModel):
    object_name: Optional[str] = "Unknown Object"

@app.post("/generate-seo-insights")
async def generate_seo(req: SEORequest):
    try:
        return await generate_seo_from_vision(req.object_name or "Unknown Object")
    except Exception as e:
        print(f"SEO Generation error: {e}")
        raise HTTPException(status_code=500, detail="SEO generation failed. Please try again.")


class BlogRequest(BaseModel):
    vision_data: Optional[Dict[str, Any]] = {}
    seo_data: Optional[Dict[str, Any]] = {}
    tone: Optional[str] = "Professional"
    audience: Optional[str] = "General Public"

@app.post("/generate-blog")
async def generate_blog(req: BlogRequest):
    try:
        return await generate_blog_from_data(req.vision_data, req.seo_data, req.tone, req.audience)
    except Exception as e:
        print(f"Blog Generation error: {e}")
        raise HTTPException(status_code=500, detail="Blog generation failed. Please try again.")


# ── WordPress Publisher ───────────────────────────────────────────────────────
@app.post("/publish-wordpress")
async def publish_wordpress_route(data: str = Form(...), file: UploadFile = File(None)):
    try:
        parsed_data = json.loads(data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON data format.")

    temp_path = None
    if file and file.filename:
        validate_upload(file)
        temp_path = await save_upload_to_tempfile(file)

    try:
        result = publish_to_wordpress(parsed_data, temp_path)
        if result["status"] == "error":
            print(f"WP Publish error: {result['message']}")
            raise HTTPException(status_code=400, detail="WordPress publish failed. Check your credentials.")
        return result
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
