import React, { useState, useRef, useEffect } from 'react';
import VoiceInterface from './components/VoiceInterface';
import AgentTrace from './components/AgentTrace';
import ConversationDisplay from './components/ConversationDisplay';

// API Configuration
let API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
if (API_URL && !API_URL.startsWith("http")) {
  API_URL = `https://${API_URL}`;
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentStatus, setAgentStatus] = useState("Ready to help.");

  // New States for UI Display
  const [userText, setUserText] = useState("");
  const [agentText, setAgentText] = useState("");
  const [traceLogs, setTraceLogs] = useState([]);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false; // Stop after one sentence/phrase
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Default, can be dynamic

      recognition.onstart = () => {
        setIsListening(true);
        setAgentStatus("Listening...");
        // Clear previous conversation on new interaction start? 
        // Or keep it? Users prefer keeping context usually.
        // Let's clear for cleaner demo feel or keep for chat feel.
        // For now, let's keep it but clear when *starting* a new one?
        // Actually, clearing creates a "session" feel.
        // setUserText(""); 
        // setAgentText("");
        console.log("Speech recognition started");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Transcript:", transcript);
        setUserText(transcript); // Show immediately
        handleSpeechResult(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'no-speech') {
          setAgentStatus("No speech detected. Try again.");
        } else {
          setAgentStatus("Error. Try again.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Don't reset status here if we are processing, handled in onresult
        console.log("Speech recognition ended");
      };

      recognitionRef.current = recognition;
    } else {
      setAgentStatus("Browser not supported.");
      console.error("Web Speech API not supported");
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      // Clear previous text for a fresh focus
      setUserText("");
      setAgentText("");
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Start error:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSpeechResult = async (text) => {
    setAgentStatus("Processing...");
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/process-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) throw new Error("API Failure");

      const data = await response.json();

      // Update UI with Agent Response
      setAgentText(data.agent_text);
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
      console.error("Error processing text:", error);
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
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-violet-900/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Modern Header */}
        <header className="py-6 px-8 flex items-center justify-between sticky top-0 z-50">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl border-b border-white/5"></div>

          <div className="relative flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">S</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SevaBot
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-mono uppercase tracking-wider">
                  Beta
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Next-Gen Government Interface</p>
            </div>
          </div>

          <div className="relative hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              System Online
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-between pt-8 pb-12 px-4">

          {/* Top Section: Conversation */}
          <section className="w-full flex-1 flex flex-col justify-end min-h-[40vh] mb-12">
            {!userText && !agentText ? (
              <div className="text-center text-slate-500 space-y-4 my-auto">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto rounded-full" />
                <p>Tap the microphone to start speaking</p>
              </div>
            ) : (
              <ConversationDisplay userText={userText} agentText={agentText} />
            )}
          </section>

          {/* Bottom Section: Controls */}
          <section className="w-full flex flex-col items-center space-y-8 sticky bottom-8">
            <VoiceInterface
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              onStartListening={startListening}
              onStopListening={stopListening}
              agentStatus={agentStatus}
            />

            {/* Trace Drawer (Collapsible-ish via scroll in future, for now standard) */}
            <div className="w-full max-w-2xl px-2">
              <details className="group">
                <summary className="list-none flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-500 hover:text-indigo-400 transition-colors py-2">
                  <span className="border-b border-transparent group-hover:border-indigo-400/50">View Agent Reasoning</span>
                </summary>
                <div className="mt-4">
                  <AgentTrace traceLogs={traceLogs} />
                </div>
              </details>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default App;