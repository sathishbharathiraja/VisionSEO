import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Switch to 2.0-flash which might have a separate quota bucket
model = genai.GenerativeModel('models/gemini-2.0-flash')

try:
    response = model.generate_content("Hello")
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {e}")
