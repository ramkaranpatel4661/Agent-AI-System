import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInterface = ({ isListening, isProcessing, isSpeaking, onStartListening, onStopListening, agentStatus }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 w-full max-w-md mx-auto">
      {/* Status Text with Animated Validation */}
      <motion.div 
        layout
        className="text-center space-y-2 h-20"
      >
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Agent Status
        </h2>
        <AnimatePresence mode="wait">
          <motion.p 
            key={agentStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg text-slate-300 font-medium"
          >
            {agentStatus}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Main Action Button */}
      <div className="relative group">
        {/* Ripple Effects when listening/speaking */}
        {(isListening || isSpeaking) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className={`w-full h-full rounded-full ${isListening ? 'bg-red-500/30' : 'bg-blue-500/30'}`}
            />
            <motion.div 
              animate={{ scale: [1, 2, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              className={`absolute w-full h-full rounded-full ${isListening ? 'bg-red-500/20' : 'bg-blue-500/20'}`}
            />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? onStopListening : onStartListening}
          className={`
            relative z-10 flex items-center justify-center w-32 h-32 rounded-full 
            shadow-[0_0_40px_rgba(0,0,0,0.3)] border-4 transition-colors duration-300
            ${isListening 
              ? 'bg-red-600 border-red-400 text-white' 
              : isProcessing
                ? 'bg-amber-500 border-amber-300 text-white animate-pulse'
                : isSpeaking
                  ? 'bg-blue-600 border-blue-400 text-white' 
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
            }
          `}
        >
            {isProcessing ? (
                <Loader2 className="w-12 h-12 animate-spin" />
            ) : isSpeaking ? (
                <Volume2 className="w-12 h-12" />
            ) : isListening ? (
                <MicOff className="w-12 h-12" />
            ) : (
                <Mic className="w-12 h-12" />
            )}
        </motion.button>
      </div>

      <div className="text-xs text-slate-500 uppercase tracking-widest mt-8">
        {isListening ? "Tap to Stop" : "Tap to Speak"}
      </div>
    </div>
  );
};

export default VoiceInterface;
