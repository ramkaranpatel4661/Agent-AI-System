import os
import shutil
from dotenv import load_dotenv

# Load env vars FIRST, before importing modules that rely on them
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

class TextInput(BaseModel):
    text: str

from agent import ServiceAgent
from speech_services import transcribe_audio, synthesize_speech

print(f"[Main] GEMINI_API_KEY present: {'GEMINI_API_KEY' in os.environ}")
if 'GEMINI_API_KEY' in os.environ:
    print(f"[Main] Key length: {len(os.environ['GEMINI_API_KEY'])}")
else:
    print("[Main] WARNING: GEMINI_API_KEY NOT FOUND IN ENV")

app = FastAPI()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global agent
agent = ServiceAgent()

# -------------------- ERROR HANDLERS --------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback_str = traceback.format_exc()
    print("GLOBAL ERROR:", traceback_str)
    return JSONResponse(status_code=500, content={"error": str(exc)})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("VALIDATION ERROR:", exc)
    return JSONResponse(status_code=422, content={"error": "Validation Error"})

# -------------------- ROUTES --------------------

@app.get("/")
def read_root():
    return {"status": "Service Agent Online"}

@app.post("/reset")
def reset_memory():
    agent.memory.clear()
    return {"status": "Memory cleared"}

@app.post("/process-text")
async def process_text(input: TextInput):
    try:
        user_text = input.text
        print(f"[Main] Received Text: '{user_text}'")

        if not user_text or user_text.strip() == "":
             return {
                "user_text": "",
                "agent_text": "I didn't hear anything.",
                "agent_audio": "",
                "trace": ["Empty text received"]
            }

        # Agent reasoning
        agent_result = agent.run(user_text)
        agent_text = agent_result["response"]
        trace = agent_result["trace"]

        # TTS
        audio_base64 = synthesize_speech(agent_text)

        return {
            "user_text": user_text,
            "agent_text": agent_text,
            "agent_audio": audio_base64,
            "trace": trace
        }

    except Exception as e:
        print("PROCESS TEXT ERROR:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/process-voice")
async def process_voice(file: UploadFile = File(...)):
    try:
        # 1. Save audio
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(temp_filename)
        print(f"[Main] Audio saved: {temp_filename} ({file_size} bytes)")

        if file_size < 100:
            os.remove(temp_filename)
            return {
                "user_text": "",
                "agent_text": "I didn't hear anything. Please try again.",
                "agent_audio": "",
                "trace": ["Empty audio received"]
            }

        # 2. Transcribe
        print(f"[Main] Transcribing file: {temp_filename}...")
        user_text = transcribe_audio(temp_filename)
        print(f"[Main] Transcription Result: '{user_text}'")
        
        if not user_text or user_text.strip() == "" or "NO_SPEECH" in user_text:
             print("[Main] No valid speech detected in transcription.")
             os.remove(temp_filename)
             agent_txt = "I heard something, but I couldn't understand the words. Can you try again?"
             return {
                "user_text": "",
                "agent_text": agent_txt,
                "agent_audio": synthesize_speech(agent_txt), # Synthesize the error!
                "trace": ["Gemini detected no speech."]
            }
        
        if user_text.startswith("ERROR"):
            # Clean up
            os.remove(temp_filename)
            return JSONResponse(status_code=500, content={"error": "Transcription failed"})

        # 3. Agent reasoning
        agent_result = agent.run(user_text)
        agent_text = agent_result["response"]
        trace = agent_result["trace"]

        # 4. TTS
        audio_base64 = synthesize_speech(agent_text)

        os.remove(temp_filename)

        return {
            "user_text": user_text,
            "agent_text": agent_text,
            "agent_audio": audio_base64,
            "trace": trace
        }

    except Exception as e:
        print("PROCESS VOICE ERROR:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

# -------------------- RUN --------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)