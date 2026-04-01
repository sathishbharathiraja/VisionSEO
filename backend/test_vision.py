import sys
import os
from dotenv import load_dotenv

load_dotenv()

from services.ai_service import analyze_image_with_gemini

cwd = os.getcwd()
files = os.listdir(cwd)
png_files = [f for f in files if f.endswith('.png')]

if not png_files:
    print("No PNG file found")
    sys.exit(1)

test_file = png_files[0]
print(f"Testing with image: {test_file}")

result = analyze_image_with_gemini(test_file)
print(result)
