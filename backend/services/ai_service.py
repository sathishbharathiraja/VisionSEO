import os
import google.generativeai as genai
import json

def analyze_image_with_gemini(image_path: str):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Mock Response if no API key is provided
        print("WARNING: GEMINI_API_KEY not found. Returning mock data.")
        return {
            "topic": "Healing Siddha Herbs (MOCK)",
            "title": "Top 10 Siddha Herbs for Natural Healing",
            "meta_description": "Discover the power of traditional Siddha medicine with these herbs.",
            "keywords": ["Siddha", "Healing Herbs", "Natural", "Ayurveda"]
        }

    genai.configure(api_key=api_key)
    
    # We will use gemini-2.5-flash as it is supported and stable
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = """
    You are an expert SEO specialist, content writer, and highly proficient in interpreting images.
    Analyze the uploaded image and generate a complete, SEO-optimized blog post based on its context.
    Return ONLY a JSON object with the following schema:
    {
        "topic": "Primary topic of the image",
        "title": "An optimized blog post title based on the image",
        "meta_description": "A compelling meta description (max 160 characters)",
        "keywords": ["keyword1", "keyword2", "keyword3", ...] (exactly 10 high-intent long-tail keywords),
        "content": "A full 500-1000 word SEO-optimized blog article formatted entirely in HTML. Use expressive <h2> and <h3> headers. Do NOT include an <h1> tag as the title will be used for that."
    }
    """
    
    try:
        sample_file = genai.upload_file(path=image_path, display_name="Uploaded Image")
        response = model.generate_content([sample_file, prompt])
        
        # Parse the JSON response
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3]
        elif text.startswith('```'):
            text = text[3:-3]
            
        result_json = json.loads(text.strip())
        return result_json
        
    except Exception as e:
        print(f"Error in Gemini Vision Service: {e}")
        return {
            "topic": "Error Processing Image",
            "title": "Error Processing Image",
            "meta_description": str(e),
            "keywords": []
        }
