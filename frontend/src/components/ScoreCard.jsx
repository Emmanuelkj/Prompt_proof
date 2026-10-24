import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, CheckCircle2, XCircle, Crosshair, Activity } from 'lucide-react';

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
  const total = scoreData?.total_attacks ?? totalAttacksCount ?? 0;

  // Visual grade based on resistance score
  const getScoreTheme = (score) => {
    if (score >= 85) {
      return {
        text: 'text-cyber-emerald',
        stroke: '#10B981',
        glow: 'shadow-glow-emerald',
        badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
        label: 'Hardened (Strong Resistance)',
      };
    }
    if (score >= 60) {
      return {
        text: 'text-cyber-amber',
        stroke: '#F59E0B',
        glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.25)]',
        badge: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
        label: 'Moderate Vulnerability',
      };
    }
    return {
      text: 'text-cyber-crimson',
      stroke: '#F43F5E',
      glow: 'shadow-glow-crimson',
      badge: 'bg-rose-950/80 text-rose-400 border-rose-800/80',
      label: 'Critical Vulnerability',
    };
  };

  const getBarColor = (score) => {
    if (score >= 85) return 'bg-cyber-emerald';
    if (score >= 60) return 'bg-cyber-amber';
    return 'bg-cyber-crimson';
  };

  const theme = getScoreTheme(resistance);

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (resistance / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="tactical-card tactical-card-highlight p-5 shadow-2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Cyber Resistance Radar Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center text-center p-5 rounded-xl bg-obsidian-900/90 border border-white/10 relative overflow-hidden">
          {/* Subtle radar sweep grid background */}
          <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-20 pointer-events-none" />

          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer decorative ticks ring */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                strokeDasharray="3 6"
                fill="transparent"
              />
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#161E30"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Active Resistance Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${theme.stroke})`,
                }}
              />
            </svg>

            {/* Inner Center Display */}
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-extrabold font-mono tracking-tighter ${theme.text}`}>
                {resistance}%
              </span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 mt-0.5">
                Resistance
              </span>
            </div>
          </div>

          <div className="mt-2 text-center relative z-10 w-full">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border mb-1.5 font-mono" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${resistance >= 85 ? 'bg-cyber-emerald' : resistance >= 60 ? 'bg-cyber-amber' : 'bg-cyber-crimson'} animate-pulse`} />
              <span className={theme.text}>{theme.label}</span>
            </div>

            <p className="text-[11px] text-slate-300">
              {failed === 0 && total > 0
                ? `Zero breaches detected across ${total} attack vectors.`
                : `${failed} of ${total} injection attacks penetrated defenses.`}
            </p>

            <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] text-slate-400 bg-obsidian-950/80 px-2.5 py-1 rounded-md border border-white/5 max-w-xs">
              <Info className="w-3 h-3 text-cyber-cyan shrink-0" />
              <span>Honest Metric: Deterministic canary & instruction-marker evaluation.</span>
            </div>
          </div>
        </div>

        {/* Right: Metrics Grid & Breakdown */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-4">
          {/* 4 Stat Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Total Tested */}
            <div className="bg-obsidian-900/80 border border-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-0.5">
                <Crosshair className="w-3 h-3 text-slate-400" />
                <span>Tested</span>
              </div>
              <span className="text-xl font-bold font-mono text-slate-100">{total}</span>
            </div>

            {/* Passes */}
            <div className="bg-obsidian-900/80 border border-emerald-950/70 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-mono tracking-wider text-cyber-emerald mb-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Passed</span>
              </div>
              <span className="text-xl font-bold font-mono text-cyber-emerald">{passed}</span>
            </div>

            {/* Fails */}
            <div className={`bg-obsidian-900/80 rounded-lg p-3 text-center border ${failed > 0 ? 'border-rose-950/90 shadow-glow-crimson/20' : 'border-white/10'}`}>
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-mono tracking-wider text-cyber-crimson mb-0.5">
                <XCircle className="w-3 h-3" />
                <span>Breaches</span>
              </div>
              <span className="text-xl font-bold font-mono text-cyber-crimson">{failed}</span>
            </div>

            {/* Ambiguous */}
            <div className="bg-obsidian-900/80 border border-amber-950/70 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-mono tracking-wider text-cyber-amber mb-0.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Ambiguous</span>
              </div>
              <span className="text-xl font-bold font-mono text-cyber-amber">{ambiguous}</span>
            </div>
          </div>

          {/* Per-Category Progress Breakdown */}
          <div className="bg-obsidian-900/60 border border-white/10 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="text-xs font-heading font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
                Vector Category Resistance Breakdown
              </span>
              <span className="text-[10px] font-mono text-slate-400">Pass Rate</span>
            </div>

            <div className="space-y-2 pt-0.5">
              {scoreData?.category_scores &&
                Object.entries(scoreData.category_scores).map(([catKey, cat]) => {
                  const label = CATEGORY_NAMES[catKey] || catKey.replace('_', ' ');
                  const catScore = cat.resistance;
                  const isHeadline = catKey === 'indirect_injection';

                  return (
                    <div key={catKey} className="text-xs group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium flex items-center gap-1.5 text-slate-300">
                          <span className={isHeadline ? 'text-cyber-cyan font-semibold' : ''}>
                            {label}
                          </span>
                          {isHeadline && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyber-cyan border border-cyan-800">
                              Headline
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-400">
                            {cat.passed}/{cat.total}
                          </span>
                          <span className={`font-semibold ${catScore >= 85 ? 'text-cyber-emerald' : catScore >= 60 ? 'text-cyber-amber' : 'text-cyber-crimson'}`}>
                            {catScore}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-obsidian-750 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(catScore)}`}
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
    </motion.div>
  );
}
