import React from 'react';
import { CheckCircle2, Loader2, Circle, AlertCircle, ShieldAlert, Cpu, Wrench, RefreshCw, CheckCheck } from 'lucide-react';

const STAGES = [
  { id: 'harness', label: '1. Canary Harness', icon: ShieldAlert, desc: 'Fake secret token & marker injected' },
  { id: 'running_attacks', label: '2. Attack Matrix', icon: Cpu, desc: 'Direct, indirect & jailbreak vectors' },
  { id: 'hardening', label: '3. AI Hardening', icon: Wrench, desc: 'Boundary isolation & instruction hierarchy' },
  { id: 'rerunning', label: '4. Regression Re-test', icon: RefreshCw, desc: 'Validating failure flip rates' },
  { id: 'benign_check', label: '5. Benign Over-refusal', icon: CheckCheck, desc: 'Confirming zero false-positive refusals' },
];

export default function StageProgress({ currentStage, stageMessage, completedStages = [], isRunning, isDone }) {
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
    <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Circle className="w-4 h-4 text-slate-500" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Pipeline Execution Status
          </span>
        </div>
        {stageMessage && (
          <span className="text-xs font-mono text-cyan-300/90 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40 truncate max-w-lg">
            {stageMessage}
          </span>
        )}
      </div>

      {/* Progress Steps Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1">
        {STAGES.map((s, idx) => {
          const isCompleted = isDone || activeIdx > idx;
          const isCurrent = isRunning && activeIdx === idx;
          const isPending = !isDone && activeIdx < idx;
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                isCompleted
                  ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-950/30 border-cyan-500/80 text-cyan-300 ring-1 ring-cyan-500/50 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold truncate">{s.label}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
