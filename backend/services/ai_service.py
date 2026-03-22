import os
import google.generativeai as genai
import json

def analyze_image_with_gemini(image_path: str, tone: str = "Professional", audience: str = "General Public"):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    genai.configure(api_key=api_key)
    
    # We will use gemini-2.5-flash as it is supported and stable
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an expert SEO specialist, content writer, and highly proficient in interpreting images.
    Analyze the provided image and generate a comprehensive SEO-optimized blog package.
    
    The target tone for this content is: {tone}.
    The target audience is: {audience}.
    
    Respond strictly with a JSON object that perfectly matches the following structured schema.
    CRITICAL INSTRUCTION: Ensure the JSON is valid and parsable. Do not include markdown code blocks around the JSON string.
    CRITICAL INSTRUCTION: When writing HTML in the "content" field, you MUST use single quotes for HTML attributes (e.g., <h2 class='title'>) to avoid breaking the JSON format with unescaped double quotes. Any required double quotes within the text MUST be properly escaped as \\\". 
    
    SCHEMA:
    {{
        "topic": "A 2-4 word primary topic based on the image.",
        "title": "A catchy, SEO-friendly H1 title (under 60 characters) written in a {tone} tone for {audience}.",
        "meta_description": "A compelling meta description (150-160 characters) summarizing the post and encouraging clicks.",
        "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
        "content": "A full 500-1000 word blog article formatted in pure HTML. Include <h2> and <h3> tags for structure, write in paragraphs, and emphasize important concepts. The content must heavily rely on the visual context, be written in a {tone} voice, and be specifically tailored for {audience}.",
        "social_snippets": {{
            "twitter": "A short, engaging tweet (under 280 characters) promoting the article with 3 relevant hashtags.",
            "linkedin": "A professional and engaging thought-leadership post for LinkedIn introducing the article, ending with a call to action and 3-5 hashtags."
        }},
        "visual_hooks": [
            "A bold, contrarian, or highly engaging 3-6 word text overlay for a social media graphic.",
            "An emotional or curiosity-driven 3-6 word text overlay.",
            "A data-driven or authoritative 3-6 word text overlay."
        ]
    }}
    """
    
    try:
        sample_file = genai.upload_file(path=image_path)
        
        response = model.generate_content(
            [prompt, sample_file],
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        # Find the first { and last } to extract just the JSON object
        json_str = response.text
        start_idx = json_str.find("{")
        end_idx = json_str.rfind("}")
        
        if start_idx != -1 and end_idx != -1:
            json_str = json_str[start_idx:end_idx+1]
            
        return json.loads(json_str)
        
    except Exception as e:
        print(f"Error in Gemini Vision Service: {e}")
        return {
            "topic": "Error Processing Image",
            "title": "Error Processing Image",
            "meta_description": str(e),
            "keywords": []
        }
