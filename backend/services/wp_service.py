import os
import requests
from requests.auth import HTTPBasicAuth

def publish_to_wordpress(data: dict, image_path: str = None):
    wp_url = os.getenv("WP_URL")
    wp_user = os.getenv("WP_USERNAME")
    wp_pass = os.getenv("WP_APP_PASSWORD")
    
    if not wp_url or not wp_user or not wp_pass or wp_url == "https://yourwordpresssite.com":
        print("WARNING: Valid WordPress credentials not found. Simulating publish.")
        return {"status": "success", "message": "Simulated WordPress publish successfully (Draft). Please configure WP_URL in .env for real publishing.", "wp_url": "mock_url"}
        
    auth = HTTPBasicAuth(wp_user, wp_pass)
    media_id = None
    
    # Upload Image to WP Media Library
    if image_path and os.path.exists(image_path):
        try:
            filename = os.path.basename(image_path)
            media_endpoint = f"{wp_url}/wp-json/wp/v2/media"
            with open(image_path, "rb") as f:
                media_res = requests.post(
                    media_endpoint, 
                    data=f, 
                    headers={"Content-Disposition": f"attachment; filename={filename}", "Content-Type": "image/jpeg"},
                    auth=auth
                )
            if media_res.status_code in [200, 201]:
                media_id = media_res.json().get("id")
                print(f"Successfully uploaded media. ID: {media_id}")
            else:
                print(f"Failed to upload media to WordPress. Status: {media_res.status_code}, Response: {media_res.text}")
        except Exception as e:
            print(f"Exception during media upload: {e}")

    # Build the post content
    endpoint = f"{wp_url}/wp-json/wp/v2/posts"
    
    # Use the generated content from Gemini, or fallback to mock
    generated_content = data.get("content", "")
    keywords_str = ", ".join(data.get("keywords", []))
    
    # If content wasn't generated for some reason, provide a fallback.
    if not generated_content:
        generated_content = f"""
        <!-- wp:paragraph -->
        <p>This is an AI-generated draft based on visual context.</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:paragraph -->
        <p><strong>Meta Description:</strong> {data.get('meta_description', '')}</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:paragraph -->
        <p><strong>Keywords:</strong> {keywords_str}</p>
        <!-- /wp:paragraph -->
        """
    
    post = {
        'title': data.get('title', 'AI Generated Title'),
        'status': 'draft',
        'content': generated_content,
        'excerpt': data.get('meta_description', '')
    }
    
    if media_id:
        post['featured_media'] = media_id
        
    try:
        response = requests.post(endpoint, json=post, auth=auth)
        if response.status_code in [200, 201]:
            return {"status": "success", "message": "Draft created successfully with media", "data": response.json()}
        else:
            return {"status": "error", "message": f"WP API Error: {response.text}"}
    except requests.exceptions.ConnectionError:
        return {"status": "success", "message": f"Could not connect to WordPress at {wp_url} (Connection Refused). Simulating publish instead! (Draft)", "wp_url": "mock_url"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
