import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const CATEGORY_NAMES = {
  indirect_injection: 'Indirect Injection (Data Payload)',
  direct_override: 'Direct Override / Reset',
  canary_extraction: 'Canary Secret Extraction',
  prompt_extraction: 'System Prompt Extraction',
  jailbreak: 'Role-Play & Jailbreaks',
  format_abuse: 'Delimiter & Tag Abuse',
  authority_urgency: 'Authority & Urgency Social Eng',
  multi_step: 'Multi-Step / Crescendo Escalation',
  generated: 'AI-Tailored Vectors',
};

export default function ScoreCard({ scoreData, totalAttacksCount }) {
  const resistance = scoreData?.overall_resistance ?? 0;
  const passed = scoreData?.passed_count ?? 0;
  const failed = scoreData?.failed_count ?? 0;
  const ambiguous = scoreData?.ambiguous_count ?? 0;
  const total = scoreData?.total_attacks ?? 0;

  // Color grade based on resistance score
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 stroke-emerald-400 from-emerald-500/20';
    if (score >= 60) return 'text-amber-400 stroke-amber-400 from-amber-500/20';
    return 'text-rose-500 stroke-rose-500 from-rose-500/20';
  };

  const getBarColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (resistance / 100) * circumference;

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Animated Resistance Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center text-center p-4 rounded-xl bg-[#0a0d14]/60 border border-slate-800/80">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                className={`transition-all duration-700 ease-out ${getScoreColor(resistance)}`}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${getScoreColor(resistance).split(' ')[0]}`}>
                {resistance}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Resistance
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <p className="text-xs font-semibold text-slate-200">
              Deterministic Vulnerability Score
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              {failed === 0 && total > 0
                ? `No leak detected in ${total} attacks tested.`
                : `${failed} of ${total} injection attempts penetrated defenses.`}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              <Info className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Honest framing: A pass is not proof of absolute safety.</span>
            </div>
          </div>
        </div>

        {/* Aggregate Counters & Category Breakdown */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-[#0a0d14] border border-slate-800 rounded-lg p-2.5 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Tested</span>
              <span className="text-lg font-bold font-mono text-slate-100">{total}</span>
            </div>
            <div className="bg-[#0a0d14] border border-slate-800 rounded-lg p-2.5 text-center">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block flex items-center justify-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" /> Passes
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">{passed}</span>
            </div>
            <div className="bg-[#0a0d14] border border-slate-800 rounded-lg p-2.5 text-center">
              <span className="text-[10px] uppercase font-semibold text-rose-400 block flex items-center justify-center gap-1">
                <XCircle className="w-2.5 h-2.5" /> Fails
              </span>
              <span className="text-lg font-bold font-mono text-rose-400">{failed}</span>
            </div>
            <div className="bg-[#0a0d14] border border-slate-800 rounded-lg p-2.5 text-center">
              <span className="text-[10px] uppercase font-semibold text-amber-400 block flex items-center justify-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Ambiguous
              </span>
              <span className="text-lg font-bold font-mono text-amber-400">{ambiguous}</span>
            </div>
          </div>

          {/* Per-Category Bars */}
          <div className="space-y-2 bg-[#0a0d14]/40 border border-slate-800/80 rounded-lg p-3">
            <span className="text-xs font-semibold text-slate-300 block mb-1">
              Category Resistance Breakdown
            </span>
            {scoreData?.category_scores && Object.entries(scoreData.category_scores).map(([catKey, cat]) => {
              const label = CATEGORY_NAMES[catKey] || catKey.replace('_', ' ');
              const catScore = cat.resistance;
              const isHeadline = catKey === 'indirect_injection';

              return (
                <div key={catKey} className="text-xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-medium flex items-center gap-1.5 ${isHeadline ? 'text-cyan-300 font-semibold' : 'text-slate-300'}`}>
                      {label}
                      {isHeadline && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Headline
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-400">
                      {cat.passed}/{cat.total} passed ({catScore}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(catScore)}`}
                      style={{ width: `${catScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
