import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle, Search, AlertCircle, ArrowRight, Volume2 } from 'lucide-react';

const AgentTrace = ({ traceLogs }) => {
    if (!traceLogs || traceLogs.length === 0) return null;

    return (
        <div className="w-full bg-slate-950/80 rounded-xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-4 py-3 border-b border-slate-800 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                        <Terminal className="w-3 h-3 text-indigo-500" />
                        <span>System Logs</span>
                    </div>
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                    ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
                </div>
            </div>

            <div className="max-h-[200px] overflow-y-auto p-3 font-mono text-xs space-y-1">
                {traceLogs.map((log, idx) => {
                    let Icon = ArrowRight;
                    let color = "text-slate-400";
                    let border = "border-transparent";

                    if (log.includes("Calling Tool")) {
                        Icon = Search;
                        color = "text-amber-400";
                    } else if (log.includes("Tool Result")) {
                        Icon = CheckCircle;
                        color = "text-emerald-400";
                    } else if (log.includes("Final Answer")) {
                        Icon = Volume2;
                        color = "text-indigo-400";
                        border = "border-indigo-500/10 bg-indigo-500/5";
                    } else if (log.includes("Error")) {
                        Icon = AlertCircle;
                        color = "text-red-400";
                    }

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex gap-3 p-1.5 rounded-md ${border} hover:bg-white/5 transition-colors group`}
                        >
                            <span className="text-slate-700 pointer-events-none select-none">{idx + 1}</span>
                            <div className="flex-1 flex gap-2">
                                <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color}`} />
                                <span className={`text-slate-300 break-words leading-relaxed group-hover:text-slate-100 transition-colors ${log.includes("Final Answer") ? "text-indigo-100 font-semibold" : ""}`}>
                                    {log}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>
        </div>
    );
};

export default AgentTrace;
