import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Switch to the most stable alias which often has a separate 1500 quota
model = genai.GenerativeModel('models/gemini-1.5-flash-latest')

try:
    response = model.generate_content("Hello")
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {e}")
