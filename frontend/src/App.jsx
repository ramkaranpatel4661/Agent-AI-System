import React, { useState, useRef, useEffect } from 'react';
import VoiceInterface from './components/VoiceInterface';
import AgentTrace from './components/AgentTrace';

// API Configuration
const API_URL = "http://localhost:8000";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentStatus, setAgentStatus] = useState("Ready to help.");
  const [traceLogs, setTraceLogs] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      // VAD Setup
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log("Data Available:", event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        handleAudioStop();
        audioContext.close(); // Cleanup VAD
      };

      mediaRecorderRef.current.start();
      console.log("Recording started");
      setIsListening(true);
      setAgentStatus("Listening...");

      // Silence Detection Loop
      let silenceStart = Date.now();
      const silenceThreshold = 10;
      const silenceDuration = 1500; // 1.5s stop

      const checkSilence = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;

        if (average < silenceThreshold) {
          if (Date.now() - silenceStart > silenceDuration) {
            console.log("Auto-Stop: Silence detected.");
            stopListening();
            return;
          }
        } else {
          silenceStart = Date.now();
        }
        requestAnimationFrame(checkSilence);
      };
      checkSilence();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setAgentStatus("Microphone Error");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setAgentStatus("Processing...");
      setIsProcessing(true);
    }
  };

  const handleAudioStop = async () => {
    console.log("Handle Stop. Chunks:", audioChunksRef.current.length);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    console.log("Final Blob Size:", audioBlob.size);

    // Create form data
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      const response = await fetch(`${API_URL}/process-voice`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("API Failure");

      const data = await response.json();

      // Update Trace
      if (data.trace) setTraceLogs(data.trace);

      // Play Audio Response
      if (data.agent_audio) {
        setAgentStatus("Speaking...");
        setIsProcessing(false);
        setIsSpeaking(true);
        playAudio(data.agent_audio);
      } else {
        setAgentStatus("Done.");
        setIsProcessing(false);
      }

    } catch (error) {
      console.error("Error processing voice:", error);
      setAgentStatus("Error. Try again.");
      setIsProcessing(false);
    }
  };

  const playAudio = (base64Audio) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    audio.onended = () => {
      setIsSpeaking(false);
      setAgentStatus("Ready.");
    };
    audio.play().catch(e => {
      console.error("Playback error", e);
      setIsSpeaking(false);
      setAgentStatus("Playback Error");
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center pt-20 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 mb-2">
          SevaBot
        </h1>
        <p className="text-slate-400">Your Native Language Government Service Agent</p>
      </header>

      <main className="w-full flex-1 flex flex-col items-center">
        <VoiceInterface
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          onStartListening={startListening}
          onStopListening={stopListening}
          agentStatus={agentStatus}
        />

        <AgentTrace traceLogs={traceLogs} />
      </main>

      <footer className="py-8 text-slate-600 text-sm">
        Powered by Gemini • Agentic AI Demo
      </footer>
    </div>
  );
}

export default App;
