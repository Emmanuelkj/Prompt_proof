import React from 'react';
import { CheckCheck, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export default function BenignCheckPanel({ benignChecks = [] }) {
  if (!benignChecks || benignChecks.length === 0) {
    return null;
  }

  const allPassed = benignChecks.every((b) => b.hardened_passed);

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              False-Positive & Over-Refusal Verification
              {allPassed ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Zero Over-Refusals
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Refusal Warnings
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates 5 routine legitimate customer queries against the hardened prompt to prove security did not break core utility.
            </p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {benignChecks.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-[#0a0d14] border border-slate-800 text-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-cyan-400">
                  {idx + 1}
                </span>
                "{item.task}"
              </span>
              {item.hardened_passed ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Answered Normally
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Over-Refusal
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-850">
              <div className="bg-slate-950 p-2 rounded border border-slate-850">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  Original Bot Response:
                </span>
                <p className="text-slate-300 font-mono text-[11px] line-clamp-2">
                  {item.original_response}
                </p>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-850">
                <span className="text-[10px] font-mono text-emerald-400 block mb-1">
                  Hardened Bot Response:
                </span>
                <p className="text-emerald-200/90 font-mono text-[11px] line-clamp-2">
                  {item.hardened_response}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
