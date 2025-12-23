import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

if "GEMINI_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    print(f"Key found: {os.environ['GEMINI_API_KEY'][:10]}...")
    
    print("Listing available models...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error listing models: {e}")
else:
    print("GEMINI_API_KEY not found in env")
