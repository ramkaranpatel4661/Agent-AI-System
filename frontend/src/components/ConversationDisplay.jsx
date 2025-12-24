import React from 'react';
import { motion } from 'framer-motion';

const ConversationDisplay = ({ userText, agentText }) => {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 my-8 px-4">
            {/* User Message */}
            {userText && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                >
                    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-slate-100 rounded-2xl rounded-tr-sm px-6 py-4 max-w-[80%] shadow-lg">
                        <div className="text-xs text-slate-400 mb-1 font-medium tracking-wider">YOU</div>
                        <p className="text-lg leading-relaxed">{userText}</p>
                    </div>
                </motion.div>
            )}

            {/* Agent Response */}
            {agentText && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-start"
                >
                    <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900/80 backdrop-blur-md border border-indigo-500/30 text-white rounded-2xl rounded-tl-sm px-8 py-6 max-w-[90%] shadow-2xl relative overflow-hidden group">
                        {/* Subtle Glow Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron-400 via-white to-indian-green-400 opacity-80" />

                        <div className="text-xs text-indigo-300 mb-2 font-medium tracking-wider flex items-center gap-2">
                            SEVABOT
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>

                        <div className="prose prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed text-slate-100">
                            {/* Simple rendering for now, can add Markdown later */}
                            {agentText.split('\n').map((line, i) => (
                                <p key={i} className="mb-2">{line}</p>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ConversationDisplay;
