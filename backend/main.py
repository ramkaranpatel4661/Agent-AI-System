import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

from agent import ServiceAgent
from speech_services import transcribe_audio, synthesize_speech
from dotenv import load_dotenv

load_dotenv()
print(f"[Main] GEMINI_API_KEY present: {'GEMINI_API_KEY' in os.environ}")
if 'GEMINI_API_KEY' in os.environ:
    print(f"[Main] Key length: {len(os.environ['GEMINI_API_KEY'])}")
else:
    print("[Main] WARNING: GEMINI_API_KEY NOT FOUND IN ENV")

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Agent Instance (Stateful for demo purposes)
agent = ServiceAgent()

@app.get("/")
def read_root():
    return {"status": "Service Agent Online"}

@app.post("/chat")
def chat_endpoint(message: str = Form(...)):
    """Text-only endpoint for debugging."""
    result = agent.run(message)
    return result

@app.post("/reset")
def reset_memory():
    agent.memory.clear()
    return {"status": "Memory cleared"}

@app.post("/process-voice")
async def process_voice(file: UploadFile = File(...)):
    """
    1. Save Audio
    2. Transcribe (STT)
    3. Agent Reason & Act (LLM + Tools)
    4. Synthesize Response (TTS)
    """
    try:
        # 1. Save temp file
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(temp_filename)
        print(f"[Main] Saved audio file: {temp_filename} ({file_size} bytes)")
        
        if file_size < 100: # Less than 100 bytes is definitely not valid audio
            print("[Main] Audio file too small/empty.")
            os.remove(temp_filename)
            # Return a dummy response to frontend so it doesn't crash
            return {
                "user_text": "",
                "agent_text": "I didn't hear anything. Please try again.",
                "agent_audio": "", # No audio
                "trace": ["Error: Microphone sent empty data."]
            }
            
        # 2. Transcribe
        user_text = transcribe_audio(temp_filename)
        
        if user_text.startswith("ERROR"):
            # Clean up
            os.remove(temp_filename)
            return JSONResponse(status_code=500, content={"error": "Transcription failed"})

        # 3. Agent Execution
        agent_result = agent.run(user_text)
        agent_text = agent_result["response"]
        trace = agent_result["trace"]
        
        # 4. Synthesize
        audio_base64 = synthesize_speech(agent_text)
        
        # Cleanup
        os.remove(temp_filename)
        
        return {
            "user_text": user_text,
            "agent_text": agent_text,
            "agent_audio": audio_base64,
            "trace": trace
        }

    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        
        # Write to file
        with open("error_log.txt", "w") as f:
            f.write(traceback_str)
            
        print(f"Error processing voice: {e}")
        return JSONResponse(status_code=500, content={"error": str(e), "details": traceback_str})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
