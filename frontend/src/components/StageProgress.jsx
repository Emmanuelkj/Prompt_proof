import React from 'react';
import { CheckCircle2, Loader2, Circle, ShieldAlert, Cpu, Wrench, RefreshCw, CheckCheck } from 'lucide-react';

const STAGES = [
  { id: 'harness', label: '1. Harness & Canary', icon: ShieldAlert, desc: 'Cryptographic token & marker appended' },
  { id: 'running_attacks', label: '2. Attack Matrix', icon: Cpu, desc: 'Testing direct, indirect & format abuse' },
  { id: 'hardening', label: '3. Guardrail Synthesis', icon: Wrench, desc: 'Boundary isolation & instruction hierarchy' },
  { id: 'rerunning', label: '4. Regression Re-Test', icon: RefreshCw, desc: 'Evaluating breach mitigation flips' },
  { id: 'benign_check', label: '5. Over-Refusal Check', icon: CheckCheck, desc: 'Zero false-positive refusal verification' },
];

export default function StageProgress({ currentStage, stageMessage, isRunning, isDone }) {
  const getStageIndex = (stageId) => {
    if (stageId === 'generating_attacks' || stageId === 'running_attacks') return 1;
    if (stageId === 'hardening') return 2;
    if (stageId === 'rerunning') return 3;
    if (stageId === 'benign_check') return 4;
    if (isDone) return 5;
    return 0;
  };

  const activeIdx = getStageIndex(currentStage);

  return (
    <div className="tactical-card p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          ) : isDone ? (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
          )}
          <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-slate-300">
            Pipeline Execution Telemetry
          </span>
        </div>
        {stageMessage && (
          <span className="text-xs font-mono text-cyan-300 bg-[#070A10] px-3 py-1 rounded-md border border-cyan-500/30 truncate max-w-xl">
            {stageMessage}
          </span>
        )}
      </div>

      {/* Progress Step Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1">
        {STAGES.map((s, idx) => {
          const isCompleted = isDone || activeIdx > idx;
          const isCurrent = isRunning && activeIdx === idx;
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-950/30 border-cyan-400/80 text-cyan-300 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/40'
                  : 'bg-[#070A10]/70 border-white/[0.06] text-slate-500'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-pulse"></div>
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-heading font-semibold tracking-wide truncate">{s.label}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                )}
              </div>
              <p className="text-[10px] font-sans text-slate-400 leading-tight">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
