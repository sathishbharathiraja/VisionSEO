from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional, Dict, Any
from pydantic import BaseModel
import os
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

ALLOWED_ORIGINS = [
    "https://sathishbharathiraja.github.io",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
]

# ── Hard-coded CORS middleware (belt + suspenders approach) ───────────────────
# This runs on EVERY response — errors, 500s, preflight, everything.
# It guarantees CORS headers even if FastAPI's built-in CORSMiddleware fails.
class ForceCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")

        # Handle preflight in middleware so it never even reaches the router
        if request.method == "OPTIONS":
            response = Response(status_code=200)
            response.headers["Access-Control-Allow-Origin"] = origin or "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response

        try:
            response = await call_next(request)
        except Exception as exc:
            response = JSONResponse(
                status_code=500,
                content={"status": "error", "message": "An internal error occurred."}
            )

        # Inject CORS headers on EVERY response
        response.headers["Access-Control-Allow-Origin"] = origin or "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
        response.headers["Vary"] = "Origin"
        return response


# Register force-CORS middleware FIRST (outermost layer)
app.add_middleware(ForceCORSMiddleware)

# Also keep the standard CORS middleware as a backup layer
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    err_str = str(exc)
    status_code = 500
    origin = request.headers.get("origin", "*")

    if "429" in err_str or "quota" in err_str.lower():
        status_code = 429

    # Log full error server-side only
    print(f"GLOBAL ERROR [{request.url.path}]: {type(exc).__name__}: {err_str}")

    response = JSONResponse(
        status_code=status_code,
        content={
            "status": "error",
            "message": "API quota exceeded. Please wait and try again." if status_code == 429
                       else "An internal server error occurred. Please try again."
        }
    )
    # Manually add CORS headers to error responses too
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin"
    return response


# ── Upload validation helpers ─────────────────────────────────────────────────
def validate_upload(file: UploadFile) -> None:
    """Validate file MIME type. Raises HTTPException on failure."""
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{content_type}'. Allowed: images (JPEG, PNG, WEBP) and videos (MP4, MOV, WEBM)."
        )


async def save_upload_to_tempfile(file: UploadFile) -> str:
    """
    Saves uploaded file to a secure OS temp path.
    - Uses tempfile.mkstemp (no user-controlled path components)
    - Enforces MAX_UPLOAD_SIZE
    Returns the temp file path. Caller MUST delete it in a finally block.
    """
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


# ── Explicit preflight handler for all routes ─────────────────────────────────
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    """Catch-all OPTIONS handler so preflight never 404s."""
    origin = request.headers.get("origin", "*")
    response = Response(status_code=200)
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
    response.headers["Access-Control-Max-Age"] = "86400"
    return response


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

        Return ONLY the rewritten text. Do not include quotes, markdown wrapping, or filler. Keep HTML tags if present.
        """
        response = await model.generate_content_async(prompt)
        return {"status": "success", "rewritten_text": response.text.strip()}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Rewrite error: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="Text rewrite failed. Please try again.")


# ── SEO & Blog Generation ─────────────────────────────────────────────────────
class SEORequest(BaseModel):
    object_name: Optional[str] = "Unknown Object"


@app.post("/generate-seo-insights")
async def generate_seo(req: SEORequest):
    try:
        return await generate_seo_from_vision(req.object_name or "Unknown Object")
    except Exception as e:
        print(f"SEO Generation error: {type(e).__name__}")
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
        print(f"Blog Generation error: {type(e).__name__}")
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
