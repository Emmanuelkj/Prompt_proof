import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle, Cpu, Zap, Key, Terminal, Lock, Layers } from 'lucide-react';

export default function DocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="tactical-card tactical-card-highlight max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyber-cyan">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-semibold text-slate-100">
                  PromptProof Architecture & Threat Model
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Deterministic Canaries, Canary Bounds & Proven Regression Defense
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
            <div className="bg-obsidian-900/80 p-3.5 rounded-lg border border-white/5 space-y-1">
              <h4 className="text-xs font-heading font-bold text-cyber-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> 1. The Core Threat: Context Window Collusion
              </h4>
              <p className="text-slate-300">
                LLM architectures lack hardware memory privilege rings. System instructions, untrusted user inputs, external documents, and customer reviews coexist in an undifferentiated token sequence. A single payload can hijack instructions, extract internal tokens, or execute unauthorized transactions.
              </p>
            </div>

            <div className="bg-obsidian-900/80 p-3.5 rounded-lg border border-white/5 space-y-1.5">
              <h4 className="text-xs font-heading font-bold text-cyber-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> 2. Deterministic Canary Harness
              </h4>
              <p className="text-slate-300">
                Unlike subjective LLM-as-a-judge evaluators that hallucinate safety scores, PromptProof dynamically instruments prompts with:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-slate-300">
                <li>
                  <strong className="text-cyber-purple">Canary Secret:</strong> A cryptographically unique UUID token (<code className="text-slate-200">CANARY-XXXX</code>) injected into the system prompt.
                </li>
                <li>
                  <strong className="text-cyber-cyan">Two-Part Instruction Marker:</strong> A prefix-suffix pair (<code className="text-slate-200">ZX + [1000-9999]</code>) that tests instruction obedience.
                </li>
              </ul>
              <p className="text-slate-400 text-[11px] font-mono pt-1">
                The Judge performs deterministic checks: raw tokens, base64 strings, hex encodings, reversed text, spaced characters, and word-boundary variations. Ambiguous refusals that echo the marker are accurately segregated from real breaches.
              </p>
            </div>

            <div className="bg-obsidian-900/80 p-3.5 rounded-lg border border-white/5 space-y-1.5">
              <h4 className="text-xs font-heading font-bold text-cyber-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> 3. The 4-Stage Defensive Engineering Loop
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2 rounded bg-obsidian-950 border border-white/5">
                  <span className="text-cyber-cyan font-bold block mb-0.5">Stage 1: Matrix Test</span>
                  Streams categorized direct and indirect vectors concurrently.
                </div>
                <div className="p-2 rounded bg-obsidian-950 border border-white/5">
                  <span className="text-cyber-purple font-bold block mb-0.5">Stage 2: Auto-Harden</span>
                  Synthesizes instruction hierarchy and strict XML encapsulation.
                </div>
                <div className="p-2 rounded bg-obsidian-950 border border-white/5">
                  <span className="text-cyber-emerald font-bold block mb-0.5">Stage 3: Re-Test</span>
                  Reruns failed vectors against the hardened prompt to prove regression mitigation.
                </div>
                <div className="p-2 rounded bg-obsidian-950 border border-white/5">
                  <span className="text-cyber-amber font-bold block mb-0.5">Stage 4: Benign Verification</span>
                  Tests 5 legitimate customer queries to guarantee zero over-refusal degradation.
                </div>
              </div>
            </div>

            <div className="bg-obsidian-900/80 p-3.5 rounded-lg border border-white/5 space-y-1">
              <h4 className="text-xs font-heading font-bold text-cyber-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> 4. Headline: Indirect Injection Defense
              </h4>
              <p className="text-slate-300">
                In real applications, attacks rarely appear in the direct user query; they lurk in uploaded resumes, scraped websites, support ticket attachments, or review strings. PromptProof treats indirect injection as a primary threat class, validating that data boundaries remain unbreached.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
