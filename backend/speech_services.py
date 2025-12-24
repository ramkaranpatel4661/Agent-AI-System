import os
import google.generativeai as genai
from gtts import gTTS
import base64
from io import BytesIO

# Initialize Gemini (API Key assumed to be loaded in main.py or from environment)
# We will lazily configure it in the function or assume global config if called after main initialization.
# For safety, let's grab it here too.
if "GEMINI_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def transcribe_audio(file_path: str, language: str = None) -> str:
    """
    Transcribes audio using Gemini 1.5 Flash.
    """
    print(f"[Speech] Transcribing {file_path} using Gemini...")
    try:
        # Upload the file to Gemini
        # valid mime types: audio/wav, audio/mp3, audio/aiff, audio/aac, audio/ogg, audio/flac
        
        # Explicit mime type helps Gemini process webm correctly
        myfile = genai.upload_file(file_path, mime_type="audio/webm")
        print(f"[Speech] File uploaded: {myfile.name} (URI: {myfile.uri})")
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Configure Safety
        from google.generativeai.types import HarmCategory, HarmBlockThreshold
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        import time
        from google.api_core import exceptions
        
        max_retries = 5
        for attempt in range(max_retries):
            try:
                # Prompt for transcription
                response = model.generate_content([
                    "Listen to this audio and provide a verbatim transcription of what was said. "
                    "If it is in Hindi or another Indian language, transcribe it in the original script (or Romanized if mixed), "
                    "but primarily I need the text content. "
                    "If the audio is silent, unclear, or contains no speech, return strictly the text: 'NO_SPEECH'",
                    myfile
                ], safety_settings=safety_settings)
                
                text = response.text.strip()
                print(f"[Speech] Transcription Result: {text}")
                return text

            except exceptions.ResourceExhausted:
                wait_time = (attempt + 1) * 5
                print(f"[Speech] Rate limit hit. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            except Exception as e: 
                print(f"[Speech] Transcription blocked or empty. Candidates: {e}")
                return " " 
        
        return " " # Failed after retries
        
    except Exception as e:
        print(f"[Speech] Error in transcription: {e}")
        return f"ERROR: {str(e)}"

def synthesize_speech(text: str) -> str:
    """
    Synthesizes speech using gTTS (Free). Returns base64 string of the MP3.
    """
    print(f"[Speech] Synthesizing with gTTS: {text[:50]}...")
    try:
        # Dynamic Language Detection
        # Check for Devanagari characters (Hindi script)
        def contains_hindi(text):
            return any('\u0900' <= char <= '\u097f' for char in text)

        if contains_hindi(text):
            lang = 'hi'
            tld = 'co.in' # Standard
        else:
            lang = 'en'
            tld = 'co.in' # Indian English Accent

        print(f"[Speech] Detecting Language: {lang} (TLD: {tld})")
        
        tts = gTTS(text=text, lang=lang, tld=tld, slow=False)
        
        # Save to memory buffer
        buffer = BytesIO()
        tts.write_to_fp(buffer)
        buffer.seek(0)
        
        # Encode to base64
        audio_content = buffer.read()
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        return audio_base64
        
    except Exception as e:
        print(f"[Speech] Error in synthesis: {e}")
        return ""