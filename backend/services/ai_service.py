import os
import google.generativeai as genai
import json
import base64
import asyncio
import mimetypes
import ipaddress
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from tenacity import retry, wait_exponential, stop_after_attempt
from pydantic import BaseModel, Field

PRIMARY_MODEL = 'models/gemini-2.5-pro'
FALLBACK_MODEL = 'models/gemini-2.5-flash'

# ── Configure Gemini once at module load (not per-request) ───────────────────
_API_KEY = os.getenv("GEMINI_API_KEY")
if _API_KEY:
    genai.configure(api_key=_API_KEY)


# ── SSRF Protection ───────────────────────────────────────────────────────────

def _is_safe_url(url: str) -> bool:
    """
    Returns True only if the URL points to a routable public IP/hostname.
    Blocks: localhost, loopback, private ranges, link-local, cloud metadata endpoints.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        hostname = parsed.hostname or ""
        if not hostname:
            return False

        # Block by hostname pattern
        blocked_hostnames = {"localhost", "metadata.google.internal"}
        if hostname.lower() in blocked_hostnames:
            return False

        # Resolve to IP and check ranges
        try:
            ip = ipaddress.ip_address(hostname)
        except ValueError:
            # It's a domain — do a quick check for obvious internal names
            lower = hostname.lower()
            if lower.endswith(".local") or lower.endswith(".internal"):
                return False
            return True  # Can't resolve here without a DNS call; allow for now

        # Block private / loopback / link-local / reserved ranges
        if (
            ip.is_loopback
            or ip.is_private
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            return False

        return True
    except Exception:
        return False


# ── RAG UTILITIES ─────────────────────────────────────────────────────────────

async def scrape_competitors(keyword: str) -> tuple[list[str], str]:
    """Autonomous Agent: searches web via DDGS and reads DOM of top 3 ranking sites.
    SSRF-protected: all URLs validated before fetching."""
    print(f"[RAG Agent] Querying active internet for: {keyword}")
    try:
        from ddgs import DDGS
        results = await asyncio.to_thread(lambda: list(DDGS().text(keyword, max_results=5)))
        urls = [r['href'] for r in results if r.get('href')] if results else []
    except Exception as e:
        print(f"[RAG Agent] Web Search API failure: {e}")
        return [], ""

    agg_text = ""
    valid_urls = []
    headers = {"User-Agent": "Mozilla/5.0 (compatible; VisionSEO-Bot/3.0)"}

    for url in urls:
        if not _is_safe_url(url):
            print(f"[RAG Agent] SSRF protection blocked URL: {url}")
            continue

        if len(valid_urls) >= 3:  # Cap at 3 sources
            break

        try:
            print(f"[RAG Agent] Crawling competitor URL: {url}")
            response = await asyncio.to_thread(
                requests.get, url, headers=headers, timeout=5, allow_redirects=True
            )
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                text_chunks = [p.get_text(strip=True) for p in soup.find_all(['p', 'h1', 'h2', 'h3'])]
                # Limit text per source to prevent prompt stuffing
                agg_text += f"\n--- Source: {url} ---\n" + "\n".join(text_chunks)[:2000]
                valid_urls.append(url)
        except requests.exceptions.Timeout:
            print(f"[RAG Agent] Timeout at {url}")
        except Exception as e:
            print(f"[RAG Agent] HTML DOM failure at {url}: {e}")

    return valid_urls, agg_text


# ── PYDANTIC SCHEMAS ──────────────────────────────────────────────────────────

class FastVisionResult(BaseModel):
    object: str = Field(description="Specific Object Name in under 6 words")

class DeepVisionResult(BaseModel):
    context: str = Field(description="Setting, color palette, and vibe")
    technical_features: list[str] = Field(description="List of 5 technical entities or materials")
    visual_style: str = Field(description="Core aesthetic signature")

class SEOInsightsResult(BaseModel):
    top_5_keywords: list[str] = Field(description="Top 5 trending SEO keyword clusters")
    h1_title: str = Field(description="Highly optimized H1 title")
    paa_questions: list[str] = Field(description="3 high-intent questions")

class BlogResult(BaseModel):
    blog_content: str = Field(description="The fully formatted HTML blog post")
    json_ld: str = Field(description="The raw JSON-LD schema string (Article type)")

class UnifiedResult(BaseModel):
    object: str
    context: str
    visual_style: str
    technical_features: list[str]
    seo_insights: SEOInsightsResult
    blog_content: str
    json_ld: str
    competitor_urls: list[str] = Field(description="List of top 3 URLs scanned by the agent")
    content_gaps: list[str] = Field(description="List of 3 actionable content gaps competitors missed")
    ctr_prediction_score: int = Field(description="Visual CTR Potential Score (0-100)")
    visual_editing_tips: list[str] = Field(description="3 precise visual editing tips to maximize CTR")
    youtube_shorts_script: str = Field(description="60-second YouTube Shorts Voiceover Script with visual cues")
    instagram_carousel: list[str] = Field(description="5-slide textual roadmap for an Instagram carousel")
    thumbnail_prompt: str = Field(description="Elite Midjourney v6 prompt for a viral thumbnail")


# ── ARCHITECTURAL EXECUTION ENGINE ────────────────────────────────────────────

async def execute_with_fallback(prompt_parts, response_schema=None, system_instruction=None):
    # Re-read API key each call in case it changes, but configure only if needed
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment variables.")

    gen_config_kwargs = {}
    if response_schema:
        gen_config_kwargs["response_mime_type"] = "application/json"
        gen_config_kwargs["response_schema"] = response_schema

    config = genai.types.GenerationConfig(**gen_config_kwargs) if gen_config_kwargs else None

    try:
        model = genai.GenerativeModel(model_name=PRIMARY_MODEL, system_instruction=system_instruction)
        response = await model.generate_content_async(prompt_parts, generation_config=config)
        return response
    except Exception as e:
        print(f"WARNING: Primary model ({PRIMARY_MODEL}) failed: {type(e).__name__}")
        print(f"Cascading to fallback model ({FALLBACK_MODEL})...")

        @retry(wait=wait_exponential(multiplier=1, min=2, max=10), stop=stop_after_attempt(4))
        async def _retry_fallback():
            model_fallback = genai.GenerativeModel(
                model_name=FALLBACK_MODEL, system_instruction=system_instruction
            )
            return await model_fallback.generate_content_async(prompt_parts, generation_config=config)

        return await _retry_fallback()


async def prepare_media(file_path: str):
    mime_type, _ = mimetypes.guess_type(file_path)
    mime_type = mime_type or "image/png"

    if mime_type.startswith("video/"):
        print(f"[Media Engine] Uploading Video to Gemini File API: {file_path}")
        uploaded_file = genai.upload_file(path=file_path, mime_type=mime_type)
        print(f"[Media Engine] File uploaded. State: {uploaded_file.state.name}")

        while uploaded_file.state.name == "PROCESSING":
            print("[Media Engine] Waiting for video processing...", flush=True)
            await asyncio.sleep(2.5)
            uploaded_file = genai.get_file(uploaded_file.name)

        if uploaded_file.state.name == "FAILED":
            raise ValueError("Video processing failed on Google Media API.")

        print("[Media Engine] Video Processing Complete.")
        return uploaded_file

    else:
        with open(file_path, "rb") as f:
            img_data = f.read()
        return {
            "mime_type": mime_type,
            "data": base64.b64encode(img_data).decode("utf-8")
        }


def cleanup_media(media_part):
    if hasattr(media_part, 'name'):
        try:
            genai.delete_file(media_part.name)
            print(f"[Media Engine] Purged remote File API asset: {media_part.name}")
        except Exception as e:
            print(f"[Media Engine] Failed to purge remote file: {e}")


# ── ASYNC SERVICE ENDPOINTS ───────────────────────────────────────────────────

async def analyze_image_fast(file_path: str) -> dict:
    prompt = "Examine this media and identify the SINGLE primary focal point, object, or subject. Output exactly what it is in under 6 words."
    media_part = await prepare_media(file_path)
    try:
        response = await execute_with_fallback([prompt, media_part], response_schema=FastVisionResult)
        return json.loads(response.text)
    except Exception as e:
        print(f"Fast Vision Exception: {type(e).__name__}")
        return {"object": "Unidentified Object"}
    finally:
        cleanup_media(media_part)


async def analyze_image_deep(file_path: str, tone: str = "Professional", audience: str = "General Public") -> dict:
    prompt = "Analyze this media in deep detail. Describe setting/vibe/action. List 5 specific technical features. Output visual style."
    media_part = await prepare_media(file_path)
    try:
        response = await execute_with_fallback([prompt, media_part], response_schema=DeepVisionResult)
        return json.loads(response.text)
    except Exception as e:
        print(f"Deep Vision Exception: {type(e).__name__}")
        return {"context": "Analysis failed.", "technical_features": [], "visual_style": "Unknown"}
    finally:
        cleanup_media(media_part)


async def generate_seo_from_vision(object_name: str) -> dict:
    prompt = f"""
    Act as an elite SEO Analyst and Ahrefs/Semrush terminal proxy.
    I have extracted the exact identity of a primary target object/action from a media asset: [{object_name}].
    Task: Search your real-world parameter database for the absolute best trending SEO keyword clusters and user intent metrics.
    """
    try:
        response = await execute_with_fallback(prompt, response_schema=SEOInsightsResult)
        return json.loads(response.text)
    except Exception as e:
        print(f"SEO Generation Exception: {type(e).__name__}")
        return {"top_5_keywords": [], "h1_title": "Error generating insights", "paa_questions": []}


async def generate_blog_from_data(vision_data: dict, seo_data: dict, tone: str, audience: str) -> dict:
    system_instruction = "You are an expert Content Strategist specializing in AEO (Answer Engine Optimization). Write easily indexable blog posts using correct HTML markup."
    prompt = f"""
    Write a comprehensive blog post based on this verified data.
    Media Context: {json.dumps(vision_data)}
    SEO Research: {json.dumps(seo_data)}
    Tone: {tone}
    Target Audience: {audience}

    Requirements: Semantic Triplets. Structured Headers (H2/H3). Internal Linking Placeholders. Expertise Pro-Tip.
    Context Gate: Verify SEO keywords semantically align with Media Context. IGNORE SEO if completely irrelevant.
    """
    try:
        response = await execute_with_fallback([prompt], response_schema=BlogResult, system_instruction=system_instruction)
        return json.loads(response.text)
    except Exception as e:
        print(f"Blog Generation Exception: {type(e).__name__}")
        return {"blog_content": "<p>Blog generation failed. Please try again.</p>", "json_ld": "{}"}


async def generate_vision_aeo_unified(file_path: str, tone: str = "Professional", audience: str = "General Public") -> dict:
    system_instruction = "You are an Enterprise-Grade AEO Strategy Engine. Analyze media against real-world scraped data and generate a complete, high-performance SEO and Content package as JSON."

    media_part = await prepare_media(file_path)

    try:
        # STEP 1: Fast Identify for RAG Search Query
        print("[RAG Agent] Initializing visual vector analysis...")
        fast_prompt = "Identify the single primary object or subject in this media. Output a clean 2-4 word search query. Output exactly what it is."
        fast_result = await execute_with_fallback([fast_prompt, media_part], response_schema=FastVisionResult)
        target_keyword = json.loads(fast_result.text).get("object", "technology")
        print(f"[RAG Agent] Target vector identified: {target_keyword}")

        # STEP 2: Agentic Web Scrape (SSRF-protected)
        competitor_urls, competitor_text = await scrape_competitors(target_keyword)

        # STEP 3: Unified Synthesis
        prompt = f"""
        Perform a full Omnichannel AEO & Viral Synthesis analyzing the visual input against live Competitor Data.
        Tone: {tone}, Audience: {audience}.

        1. Vision Identification: Identify core object/action, list 5 tech features, describe style.
        2. SEO Strategy: Generate keywords, H1, and 'People Also Ask' questions.
        3. Competitor Intelligence (RAG): Identify 3 'Content Gaps' competitors missed but this visual highlights.
        4. Viral Optimizer: Predict CTR Potential Score (0-100). Provide 3 visual editing tips.
        5. Omnichannel Factory: Generate YouTube Shorts script (60s), 5-slide Instagram Carousel, Midjourney thumbnail prompt.
        6. Blog Generation: 500-word HTML blog post. JSON-LD schema (Article or VideoObject).

        COMPETITOR WEB DATA:
        ```
        {competitor_text if competitor_text else "No competitor data available. Proceed without gap analysis."}
        ```
        """
        response = await execute_with_fallback([prompt, media_part], response_schema=UnifiedResult, system_instruction=system_instruction)
        final_dict = json.loads(response.text)

        # Force inject actual scanned URLs (prevents model hallucination of URLs)
        final_dict["competitor_urls"] = competitor_urls

        return final_dict

    except Exception as e:
        print(f"Unified Pipeline Exception: {type(e).__name__}: {e}")
        raise e
    finally:
        cleanup_media(media_part)
