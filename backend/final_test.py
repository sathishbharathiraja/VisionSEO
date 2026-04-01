import requests
import os

# Find the test image in the backend directory
files = [f for f in os.listdir('.') if f.endswith('.png')]
if not files:
    print("No PNG image found for testing.")
    exit()

test_image = files[0]
print(f"Testing with image: {test_image}")

url = "http://localhost:8000/analyze-image-unified"
payload = {
    'tone': 'Professional',
    'audience': 'General Public'
}

with open(test_image, 'rb') as f:
    files_payload = {'file': f}
    try:
        response = requests.post(url, data=payload, files=files_payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS! Data keys received:")
            print(data.keys())
            print(f"Object identified: {data.get('object')}")
            print(f"Blog content length: {len(data.get('blog_content', ''))} characters")
        else:
            print(f"FAILED: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")
