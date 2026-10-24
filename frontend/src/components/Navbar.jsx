import React from 'react';
import { Shield, Activity, History, BookOpen, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Navbar({ onOpenHistory, onOpenDocs, currentModel, provider }) {
  return (
    <header className="border-b border-white/[0.08] bg-[#070A10]/95 backdrop-blur-xl sticky top-0 z-40">
      {/* Top micro status bar */}
      <div className="border-b border-white/[0.04] bg-[#04060A]/80 px-4 py-1 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              PROMPTPROOF CORE v1.2
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">OWASP LLM TOP 10 ADVERSARIAL HARNESS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> CANARY ENGINE ARMED
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[10px]">VIBETHON CYBERSECURITY</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-[11px] bg-[#070A10] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-heading font-bold tracking-tight text-white">
                Prompt<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Proof</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 rounded-full">
                Audit Suite
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
              Deterministic Prompt Injection Defense & Regression Hardener
            </p>
          </div>
        </div>

        {/* Right tools & telemetry */}
        <div className="flex items-center gap-2.5">
          {/* Active Model Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0F18] border border-white/[0.08] text-xs">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Runtime:</span>
            <span className="font-mono text-cyan-300 font-semibold text-[11px]">{currentModel || 'llama3.2:latest'}</span>
            <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.2 rounded bg-white/[0.04]">
              {provider}
            </span>
          </div>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0E1420] hover:bg-[#141C2D] text-slate-200 border border-white/[0.08] hover:border-white/[0.15] transition active:scale-[0.98]"
            title="View Audit Run History"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>

          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/60 hover:to-blue-900/60 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 transition active:scale-[0.98]"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Architecture & Q&A</span>
          </button>
        </div>
      </div>
    </header>
  );
}
