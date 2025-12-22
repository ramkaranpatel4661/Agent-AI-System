import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle, Search, AlertCircle, ArrowRight, Volume2 } from 'lucide-react';

const AgentTrace = ({ traceLogs }) => {
    if (!traceLogs || traceLogs.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mt-8 mx-auto p-4 bg-slate-900/80 rounded-xl border border-slate-700 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700 text-slate-400 text-sm font-mono uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                Agent Reasoning Trace
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {traceLogs.map((log, idx) => {
                    let Icon = ArrowRight;
                    let color = "text-slate-400";

                    if (log.includes("Calling Tool")) {
                        Icon = Search;
                        color = "text-amber-400";
                    } else if (log.includes("Tool Result")) {
                        Icon = CheckCircle;
                        color = "text-emerald-400";
                    } else if (log.includes("Final Answer")) {
                        Icon = Volume2;
                        color = "text-blue-400";
                    } else if (log.includes("Error")) {
                        Icon = AlertCircle;
                        color = "text-red-400";
                    }

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-3 text-sm font-mono bg-black/20 p-2 rounded"
                        >
                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                            <span className="text-slate-300 break-words w-full">
                                {log}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AgentTrace;
