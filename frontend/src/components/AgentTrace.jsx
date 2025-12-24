import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle, Search, AlertCircle, ArrowRight, Volume2 } from 'lucide-react';

const AgentTrace = ({ traceLogs }) => {
    if (!traceLogs || traceLogs.length === 0) return null;

    return (
        <div className="w-full bg-slate-900/90 rounded-lg border border-slate-700/50 shadow-inner overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500">
                    <Terminal className="w-3 h-3" />
                    Agent Reasoning Log
                </div>
                <div className="text-[10px] text-slate-600">
                    {traceLogs.length} steps
                </div>
            </div>

            <div className="max-h-[250px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="space-y-1">
                    {traceLogs.map((log, idx) => {
                        let Icon = ArrowRight;
                        let color = "text-slate-500";
                        let bg = "bg-transparent";

                        if (log.includes("Calling Tool")) {
                            Icon = Search;
                            color = "text-saffron-400";
                            bg = "bg-saffron-500/5";
                        } else if (log.includes("Tool Result")) {
                            Icon = CheckCircle;
                            color = "text-emerald-400";
                            bg = "bg-emerald-500/5";
                        } else if (log.includes("Final Answer")) {
                            Icon = Volume2;
                            color = "text-indigo-400";
                            bg = "bg-indigo-500/5";
                        } else if (log.includes("Error")) {
                            Icon = AlertCircle;
                            color = "text-red-400";
                            bg = "bg-red-500/10";
                        }

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`flex gap-2 text-xs font-mono p-1.5 rounded ${bg} border border-transparent hover:border-slate-800 transition-colors`}
                            >
                                <Icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${color}`} />
                                <span className="text-slate-300 break-words w-full leading-relaxed">
                                    {log}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AgentTrace;
