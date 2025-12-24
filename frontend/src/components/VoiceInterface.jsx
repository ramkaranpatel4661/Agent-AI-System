import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInterface = ({ isListening, isProcessing, isSpeaking, onStartListening, onStopListening, agentStatus }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-12 w-full max-w-md mx-auto relative z-20">

      {/* Dynamic Status Indicator */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={agentStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/50 border border-white/10 backdrop-blur-md"
          >
            <div className={`w-2 h-2 rounded-full ${isListening ? "bg-red-400 animate-pulse" :
                isProcessing ? "bg-amber-400 animate-bounce" :
                  isSpeaking ? "bg-indigo-400 animate-pulse" :
                    "bg-emerald-400"
              }`} />
            <span className="text-xs font-medium tracking-wide text-slate-300">
              {agentStatus.toUpperCase()}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Orb Interface */}
      <div className="relative group perspective-1000">

        {/* Ambient Glow Fields */}
        <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-700 opacity-40
          ${isListening ? "bg-red-600 scale-150" :
            isProcessing ? "bg-amber-600 scale-125 animate-pulse" :
              isSpeaking ? "bg-indigo-600 scale-150" :
                "bg-blue-600/50 scale-100 group-hover:scale-110"}`}
        />

        {/* Orbital Rings */}
        <div className="absolute inset-[-20%] rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-[-40%] rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse] opacity-50" />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? onStopListening : onStartListening}
          className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center focus:outline-none"
        >
          {/* Core Orb Appearance */}
          <div className={`absolute inset-0 rounded-full transition-all duration-500 overflow-hidden
            ${isListening
              ? "bg-gradient-to-b from-red-500 to-rose-900 shadow-[inset_0_2px_20px_rgba(255,255,255,0.3)]"
              : isProcessing
                ? "bg-gradient-to-b from-amber-400 to-orange-700 shadow-[inset_0_2px_20px_rgba(255,255,255,0.4)]"
                : isSpeaking
                  ? "bg-gradient-to-b from-indigo-400 to-violet-800 shadow-[inset_0_2px_20px_rgba(255,255,255,0.3)]"
                  : "bg-gradient-to-b from-slate-700 to-slate-900 shadow-[inset_0_2px_15px_rgba(255,255,255,0.1)] group-hover:from-slate-600 group-hover:to-slate-800"
            }
          `}>
            {/* Liquid/Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            {/* Glossy Reflection */}
            <div className="absolute top-0 left-[20%] right-[20%] h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-full blur-[2px]" />
          </div>

          {/* Icon Layer */}
          <div className="relative z-20 text-white drop-shadow-lg">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin text-white/90" />
            ) : isSpeaking ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Volume2 className="w-10 h-10 text-white" />
              </motion.div>
            ) : isListening ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-slate-200 group-hover:text-white transition-colors" />
            )}
          </div>
        </motion.button>
      </div>

      {/* Audio Waveform for Speaking/Listening */}
      <div className="h-12 flex items-center gap-1">
        {(isListening || isSpeaking || isProcessing) ? (
          [...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isProcessing ? [10, 25, 10] : [8, 48, 8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
              className={`w-1.5 rounded-full ${isListening ? "bg-red-500" : isProcessing ? "bg-amber-500" : "bg-indigo-500"
                }`}
            />
          ))
        ) : (
          <div className="text-slate-600 text-xs font-mono tracking-widest opacity-50">READY FOR INPUT</div>
        )}
      </div>

    </div>
  );
};

export default VoiceInterface;
