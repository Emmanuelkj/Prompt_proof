import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  CheckCircle2,
  Copy,
  Check,
  Download,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Layers,
  FileCheck2,
  FileDiff,
  Shield,
  Lock,
} from 'lucide-react';

export default function HardeningPanel({
  hardenedData,
  beforeScore,
  afterScore,
  flipsCount,
  totalFailures,
  rerunResults = [],
  runId,
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' | 'hardened' | 'rerun'

  if (!hardenedData?.hardened_prompt) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(hardenedData.hardened_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    if (runId) {
      window.open(`/api/runs/${runId}/report`, '_blank');
    }
  };

  const improvement = Math.round((afterScore - beforeScore) * 10) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="tactical-card tactical-card-highlight overflow-hidden shadow-2xl border-cyber-cyan/30"
    >
      {/* Panel Banner */}
      <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-obsidian-900 to-purple-950/40 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyber-cyan">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-heading font-bold text-white tracking-wide">
                Automated Defensive Prompt Hardening
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-cyber-emerald border border-emerald-800/80 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Regression Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Vulnerability-guided defense synthesizer with verified regression mitigation re-testing.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 text-xs font-semibold border border-white/10 transition shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyber-emerald" />
                <span className="text-cyber-emerald">Prompt Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Copy Hardened Prompt</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian-950 text-xs font-bold transition shadow-md shadow-cyan-900/40 active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit Report (JSON)</span>
          </button>
        </div>
      </div>

      {/* Comparison Metrics Header */}
      <div className="p-4 border-b border-white/10 bg-obsidian-900/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Score before vs after */}
          <div className="p-3.5 rounded-lg bg-obsidian-950/80 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Resistance Rating
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-extrabold font-mono text-cyber-crimson">
                  {beforeScore}%
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="text-2xl font-extrabold font-mono text-cyber-emerald">
                  {afterScore}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyber-emerald bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{improvement}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">Net Security Gain</span>
            </div>
          </div>

          {/* Vulnerability Flips */}
          <div className="p-3.5 rounded-lg bg-obsidian-950/80 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Vulnerability Mitigations
              </span>
              <div className="text-2xl font-extrabold font-mono text-cyber-cyan mt-1">
                {flipsCount}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">
                  of {totalFailures} fixed
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyber-cyan">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Applied Guardrail Patterns */}
          <div className="p-3.5 rounded-lg bg-obsidian-950/80 border border-white/10">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyber-purple block mb-1">
              Applied Defenses ({hardenedData.changes?.length || 0})
            </span>
            <ul className="text-xs text-slate-300 space-y-1">
              {hardenedData.changes?.slice(0, 3).map((change, idx) => (
                <li key={idx} className="flex items-center gap-1.5 truncate text-[11px] font-mono">
                  <CheckCircle2 className="w-3 h-3 text-cyber-cyan shrink-0" />
                  <span className="truncate">{change}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="px-5 pt-3 border-b border-white/10 flex items-center gap-4 text-xs font-heading font-semibold bg-obsidian-900/40">
        <button
          type="button"
          onClick={() => setActiveTab('diff')}
          className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'diff'
              ? 'border-cyber-cyan text-cyber-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileDiff className="w-3.5 h-3.5" />
          Side-by-Side Prompt Diff
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hardened')}
          className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'hardened'
              ? 'border-cyber-cyan text-cyber-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          Full Hardened Prompt Text
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rerun')}
          className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'rerun'
              ? 'border-cyber-cyan text-cyber-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Regression Re-test Results ({rerunResults.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4">
        {activeTab === 'diff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Prompt */}
            <div className="bg-obsidian-900/90 rounded-lg p-3.5 border border-rose-950/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-cyber-crimson flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyber-crimson" />
                  Original System Prompt (Vulnerable):
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {hardenedData.original_prompt?.length || 0} chars
                </span>
              </div>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words bg-obsidian-950 p-3 rounded-md border border-white/5 max-h-72 overflow-y-auto leading-relaxed">
                {hardenedData.original_prompt}
              </pre>
            </div>

            {/* Hardened Prompt */}
            <div className="bg-obsidian-900/90 rounded-lg p-3.5 border border-emerald-950/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-cyber-emerald flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyber-emerald" />
                  Hardened System Prompt (Protected):
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {hardenedData.hardened_prompt?.length || 0} chars
                </span>
              </div>
              <pre className="text-xs font-mono text-emerald-200/90 whitespace-pre-wrap break-words bg-obsidian-950 p-3 rounded-md border border-emerald-950/30 max-h-72 overflow-y-auto leading-relaxed">
                {hardenedData.hardened_prompt}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'hardened' && (
          <div className="bg-obsidian-900/90 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-cyber-cyan">
                Production-Ready Hardened System Prompt
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 border border-white/10 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-cyber-emerald" /> : <Copy className="w-3.5 h-3.5 text-cyber-cyan" />}
                <span>{copied ? 'Copied' : 'Copy Full Text'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-words bg-obsidian-950 p-4 rounded-md border border-white/5 max-h-96 overflow-y-auto leading-relaxed">
              {hardenedData.hardened_prompt}
            </pre>
          </div>
        )}

        {activeTab === 'rerun' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {rerunResults.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                No regression re-test items available.
              </div>
            ) : (
              rerunResults.map((rerun) => (
                <div
                  key={rerun.id}
                  className="p-3 rounded-lg bg-obsidian-900 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">{rerun.id}</span>
                      <span className="text-slate-300 font-medium">{rerun.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                      {rerun.new_reason}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-950/80 text-cyber-crimson border border-rose-800">
                      Was: {rerun.previous_verdict}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950/80 text-cyber-emerald border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-cyber-emerald" />
                      Now: {rerun.new_verdict}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
