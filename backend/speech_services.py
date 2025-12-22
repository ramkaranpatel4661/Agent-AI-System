import os
import base64
import time

# MOCK IMPLEMENTATION (No API Key Required)

def transcribe_audio(file_path: str, language: str = "hi") -> str:
    """
    Simulates transcription. 
    In a real demo, we can't easily parse audio without an API, 
    so we will pretend the user said a specific phrase for the demo scenario.
    """
    print(f"[Mock Speech] Transcribing {file_path}...")
    time.sleep(1.5) # Simulate processing time
    
    # Cycle inputs or just pick a standard demo one
    # For the video, the user will say "Tell me about farmer schemes"
    return "Mujhe kisan yojana ke baare mein batao" 

def synthesize_speech(text: str) -> str:
    """
    Simulates TTS. Returns empty string or dummy data.
    """
    print(f"[Mock Speech] Synthesizing: {text[:50]}...")
    time.sleep(1)
    
    # We cannot generate real audio without an API/Local model.
    # For the demo, we will just return empty to signal "done" 
    # or the frontend will just show the text.
    return ""  

