import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInterface = ({ isListening, isProcessing, isSpeaking, onStartListening, onStopListening, agentStatus }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 w-full max-w-md mx-auto relative z-20">
      {/* Audio Visualizer */}
      <div className="h-12 flex items-center justify-center space-x-1.5">
        {(isListening || isSpeaking || isProcessing) ? (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isProcessing ? [20, 20, 20] : [10, 40, 10],
                  scaleY: isProcessing ? [1, 1.5, 1] : [1, 1, 1],
                  backgroundColor: isListening
                    ? ["#ef4444", "#f87171", "#ef4444"]
                    : isProcessing
                      ? ["#f59e0b", "#fbbf24", "#f59e0b"]
                      : ["#6366f1", "#818cf8", "#6366f1"]
                }}
                transition={{
                  duration: isProcessing ? 1 : 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-1.5 rounded-full"
              />
            ))}
          </>
        ) : (
          <div className="flex gap-1.5 opacity-30">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-2 bg-slate-400 rounded-full" />
            ))}
          </div>
        )}
      </div>

      {/* Main Action Button */}
      <div className="relative group">
        {/* Ripple Effects when listening/speaking */}
        {(isListening || isSpeaking) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className={`w-full h-full rounded-full ${isListening ? 'bg-red-500/20' : 'bg-indigo-500/20'}`}
            />
            <motion.div
              animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
              className={`absolute w-full h-full rounded-full ${isListening ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}
            />
          </div>
        )}

        {/* Ambient Glow for Processing */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full border border-saffron-500/50 border-t-transparent shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? onStopListening : onStartListening}
          className={`
            relative z-10 flex items-center justify-center w-24 h-24 rounded-full 
            shadow-[0_0_40px_rgba(0,0,0,0.3)] border-2 transition-all duration-300
            ${isListening
              ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 text-white shadow-red-900/50'
              : isProcessing
                ? 'bg-slate-900 border-saffron-500/50 text-saffron-500 shadow-saffron-900/20'
                : isSpeaking
                  ? 'bg-gradient-to-br from-indigo-500 to-blue-700 border-indigo-400 text-white shadow-indigo-900/50'
                  : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white shadow-xl'
            }
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isSpeaking ? (
            <Volume2 className="w-8 h-8" />
          ) : isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </motion.button>
      </div>

      {/* Status Text with Animated Validation */}
      <motion.div
        layout
        className="text-center h-8"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={agentStatus}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`text-sm font-medium tracking-wide ${isListening ? "text-red-400" :
                isProcessing ? "text-saffron-400" :
                  isSpeaking ? "text-indigo-400 animate-pulse" :
                    "text-slate-500"
              }`}
          >
            {agentStatus.toUpperCase()}
          </motion.p>
        </AnimatePresence>
      </motion.div>

    </div>
  );
};

export default VoiceInterface;
