import React, { useState } from 'react';
import { Wrench, CheckCircle2, Copy, Check, Download, TrendingUp, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

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
    <div className="bg-[#111726] border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl">
      {/* Panel Banner */}
      <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/40 border-b border-cyan-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Automated AI Prompt Hardening & Proven Regression
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Verified
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Vulnerability-guided prompt rewrite with re-tested attack mitigation
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            {copied ? 'Copied Prompt' : 'Copy Hardened Prompt'}
          </button>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-900/30"
          >
            <Download className="w-3.5 h-3.5" />
            Download Audit Report (JSON)
          </button>
        </div>
      </div>

      {/* Comparison Metrics Header */}
      <div className="p-5 border-b border-slate-800 bg-[#0d1322]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Score before vs after */}
          <div className="p-3.5 rounded-lg bg-[#0a0d14] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                Resistance Score
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-rose-400">
                  {beforeScore}%
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  {afterScore}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 inline-flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{improvement}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Net Hardening Gain</span>
            </div>
          </div>

          {/* Vulnerability Flips */}
          <div className="p-3.5 rounded-lg bg-[#0a0d14] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                Vulnerability Flips
              </span>
              <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-1">
                {flipsCount} <span className="text-sm font-normal text-slate-400">of {totalFailures} fixed</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Applied Guardrail Patterns */}
          <div className="p-3.5 rounded-lg bg-[#0a0d14] border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-purple-300 block mb-1">
              Applied Defenses ({hardenedData.changes?.length || 0})
            </span>
            <ul className="text-xs text-slate-300 space-y-1">
              {hardenedData.changes?.slice(0, 3).map((change, idx) => (
                <li key={idx} className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{change}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('diff')}
          className={`pb-2.5 border-b-2 transition ${
            activeTab === 'diff' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Side-by-Side Prompt Diff
        </button>
        <button
          onClick={() => setActiveTab('hardened')}
          className={`pb-2.5 border-b-2 transition ${
            activeTab === 'hardened' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Full Hardened Prompt Text
        </button>
        <button
          onClick={() => setActiveTab('rerun')}
          className={`pb-2.5 border-b-2 transition ${
            activeTab === 'rerun' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Regression Re-test Results ({rerunResults.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5">
        {activeTab === 'diff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Prompt */}
            <div className="bg-[#0a0d14] rounded-lg p-3.5 border border-rose-950/60">
              <span className="text-xs font-semibold text-rose-400 block mb-2">
                Original System Prompt (Vulnerable):
              </span>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words bg-slate-950 p-3 rounded border border-slate-900 max-h-72 overflow-y-auto">
                {hardenedData.original_prompt}
              </pre>
            </div>

            {/* Hardened Prompt */}
            <div className="bg-[#0a0d14] rounded-lg p-3.5 border border-emerald-950/60">
              <span className="text-xs font-semibold text-emerald-400 block mb-2">
                Hardened System Prompt (Protected):
              </span>
              <pre className="text-xs font-mono text-emerald-200/90 whitespace-pre-wrap break-words bg-slate-950 p-3 rounded border border-slate-900 max-h-72 overflow-y-auto">
                {hardenedData.hardened_prompt}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'hardened' && (
          <div className="bg-[#0a0d14] rounded-lg p-4 border border-slate-800">
            <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-words bg-slate-950 p-4 rounded border border-slate-850">
              {hardenedData.hardened_prompt}
            </pre>
          </div>
        )}

        {activeTab === 'rerun' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {rerunResults.map((rerun) => (
              <div
                key={rerun.id}
                className="p-3 rounded-lg bg-[#0a0d14] border border-slate-800 flex items-center justify-between text-xs"
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
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-950 text-rose-400 border border-rose-800">
                    Was: {rerun.previous_verdict}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Now: {rerun.new_verdict}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
