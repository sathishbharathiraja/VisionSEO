import requests
import os

files = [f for f in os.listdir('.') if f.endswith('.png')]
if files:
    with open(files[0], 'rb') as f:
        res = requests.post('http://localhost:8000/analyze-image-fast', files={'file': f})
        print(res.status_code)
        print(res.text)
else:
    print("No png found")
