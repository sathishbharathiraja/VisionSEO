import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from services.ai_service import analyze_image_fast

async def test():
    pngs = [f for f in os.listdir('.') if f.endswith('.png')]
    if not pngs:
        print("No PNG found to test. Test bypassed.")
        return
    
    img = pngs[0]
    print(f"Testing architecture upgrade with image: {img}...")
    
    result = await analyze_image_fast(img)
    print(f"SUCCESS Pipeline Result: {result}")

if __name__ == "__main__":
    asyncio.run(test())
