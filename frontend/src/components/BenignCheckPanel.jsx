import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function BenignCheckPanel({ benignChecks = [] }) {
  if (!benignChecks || benignChecks.length === 0) {
    return null;
  }

  const allPassed = benignChecks.every((b) => b.hardened_passed);
  const passedCount = benignChecks.filter((b) => b.hardened_passed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="tactical-card p-5 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-cyber-emerald">
            <CheckCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-heading font-semibold text-slate-100">
                Utility & False-Positive Verification (Over-Refusal Check)
              </h3>
              {allPassed ? (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-cyber-emerald border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Zero Over-Refusals ({passedCount}/{benignChecks.length})
                </span>
              ) : (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-cyber-amber border border-amber-800">
                  Refusal Warnings ({passedCount}/{benignChecks.length})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluates legitimate customer tasks against the hardened prompt to prove defensive guardrails did not degrade primary utility.
            </p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {benignChecks.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-obsidian-900/90 border border-white/10 text-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-obsidian-800 border border-white/10 flex items-center justify-center text-[10px] font-mono text-cyber-cyan">
                  {idx + 1}
                </span>
                <span className="font-mono text-slate-300">"{item.task}"</span>
              </span>
              {item.hardened_passed ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyber-emerald bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Answered Normally
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyber-crimson bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Over-Refusal
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2 pt-2 border-t border-white/5">
              <div className="bg-obsidian-950 p-2.5 rounded-md border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  Original Bot Response:
                </span>
                <p className="text-slate-300 font-mono text-[11px] line-clamp-2 leading-relaxed">
                  {item.original_response}
                </p>
              </div>
              <div className="bg-obsidian-950 p-2.5 rounded-md border border-white/5">
                <span className="text-[10px] font-mono text-cyber-emerald block mb-1">
                  Hardened Bot Response:
                </span>
                <p className="text-emerald-200/90 font-mono text-[11px] line-clamp-2 leading-relaxed">
                  {item.hardened_response}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
