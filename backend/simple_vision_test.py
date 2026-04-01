import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('models/gemini-2.5-pro')

try:
    response = model.generate_content("Hello")
    print(f"SUCCESS (2.5-pro): {response.text}")
except Exception as e:
    print(f"FAILED (2.5-pro): {e}")
