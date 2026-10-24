import React from 'react';
import { X, ShieldAlert, CheckCircle, Cpu, Zap, Key } from 'lucide-react';

export default function DocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-cyan-500/40 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d1322]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">PromptProof Methodology & Architecture</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-1">1. The Problem</h4>
            <p>
              LLM applications mix trusted system instructions with untrusted user input, reviews, and external documents in a single context window. A single injection can leak sensitive instructions, extract internal tokens, or execute unauthorized transactions.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-1">2. Deterministic Canary Harness</h4>
            <p>
              Rather than asking an LLM for its subjective opinion on safety, PromptProof injects a cryptographically unique secret (<code className="text-purple-300 font-mono">CANARY-XXXX</code>) and a two-part instruction marker (<code className="text-purple-300 font-mono">ZX + [1000-9999]</code>).
            </p>
            <p className="mt-1">
              The Judge inspects the model response for raw tokens, base64 strings, hex encodings, reversed text, spaced characters, and instruction obedience. Refusals containing echoed markers are flagged as ambiguous rather than false failures.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-1">3. The 4-Step Defensive Loop</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Test:</strong> Concurrently streams 30+ categorized direct and indirect injection vectors.</li>
              <li><strong>Harden:</strong> An LLM rewrites the prompt using instruction hierarchy, untrusted boundaries, and standardized refusal templates.</li>
              <li><strong>Re-test:</strong> Failed vectors are re-run against the hardened prompt to prove regression mitigation.</li>
              <li><strong>Benign Over-refusal Check:</strong> 5 routine business tasks are evaluated to guarantee security does not break real user queries.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-1">4. Headline: Indirect Prompt Injection</h4>
            <p>
              Real attacks arrive hidden inside data (customer reviews, support ticket attachments, web scrapes). PromptProof features a dedicated indirect injection suite and mutators for leetspeak, base64 wrapping, and story cloaking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
