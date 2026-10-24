import React from 'react';
import { Shield, ShieldAlert, Zap, History, ExternalLink, Terminal } from 'lucide-react';

export default function Navbar({ onOpenHistory, onOpenDocs, currentModel, provider }) {
  return (
    <header className="border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                Prompt<span className="text-cyan-400">Proof</span>
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
                v1.0
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 text-xs font-medium bg-purple-950/80 text-purple-300 border border-purple-800/60 rounded">
                Vibethon • AI Cybersecurity
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Deterministic LLM Prompt Injection Tester, Hardener & Regression Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Engine:</span>
            <span className="font-mono text-cyan-400 font-semibold">{currentModel || 'llama3.2:latest'}</span>
            <span className="text-slate-500">({provider})</span>
          </div>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="View previous test runs"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Run History</span>
          </button>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">How It Works</span>
          </button>
        </div>
      </div>
    </header>
  );
}
