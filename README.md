# Voice-Based Native Language Service Agent ("SevaBot")

A voice-first AI agent that helps Indian citizens identify and apply for government welfare schemes in their native language. 
Built using **React**, **FastAPI**, and **OpenAI (GPT-4o)**.

## Features
- 🗣️ **Voice-First**: Talk to the AI in Hindi/English, no typing needed.
- 🧠 **Agentic Reasoning**: The AI plans steps, searches databases, and verifies eligibility dynamically.
- 🛠️ **Tool Use**: Integrated with a mock Scheme Database and Eligibility Engine.
- 📝 **Transparency**: Shows the "Thought Trace" of the agent in real-time.

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- OpenAI API Key

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt

# Rename .env.example to .env and add your API Key
# OPENAI_API_KEY=sk-...
```
Run the server:
```bash
uvicorn main:app --reload
```
Server runs at: `http://localhost:8000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs at: `http://localhost:5173`

## Usage
1. Open the Frontend URL.
2. Click the **Microphone** button.
3. Speak in Hindi or English (e.g., "Mujhe kisan yojana ke baare mein batao" or "Tell me about farmer schemes").
4. The Agent will think (visible in the trace), search, and reply in voice.

## Project Structure
- **/backend**: FastAPI server + Agent Logic
- **/frontend**: React UI
- **/artifacts**: Design docs and plans.
