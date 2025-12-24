import React from 'react';
import { motion } from 'framer-motion';

const ConversationDisplay = ({ userText, agentText }) => {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-12 my-8 px-4 relative z-10">
            {/* User Message */}
            {userText && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex justify-end group"
                >
                    <div className="relative max-w-[80%]">
                        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-100 rounded-2xl rounded-tr-sm px-6 py-4 shadow-xl">
                            <div className="text-[10px] text-slate-400 mb-2 font-mono uppercase tracking-widest text-right flex items-center justify-end gap-2">
                                You
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            </div>
                            <p className="text-xl font-light leading-relaxed text-slate-200">{userText}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Agent Response */}
            {agentText && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-start group"
                >
                    <div className="relative max-w-[90%]">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative bg-gradient-to-br from-indigo-950/90 to-slate-900/95 backdrop-blur-xl border border-indigo-500/30 text-white rounded-2xl rounded-tl-sm px-8 py-8 shadow-2xl overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]" />

                            <div className="text-xs text-indigo-300 mb-4 font-mono tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                                SEVABOT INTELLIGENCE
                            </div>

                            <div className="prose prose-invert prose-lg max-w-none">
                                {agentText.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2 leading-8 text-slate-100 font-light">{line}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ConversationDisplay;
