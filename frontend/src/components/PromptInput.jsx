import React, { useState } from 'react';
import { Play, Square, Sparkles, Key, AlertTriangle, ShieldCheck, Cpu, Terminal, Flame, Layers, RotateCcw } from 'lucide-react';

export default function PromptInput({
  prompt,
  setPrompt,
  samples,
  onSelectSample,
  onSubmit,
  onStop,
  isRunning,
  modelsConfig,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  scanScope,
  setScanScope,
  apiKey,
  setApiKey,
  deepScan,
  setDeepScan,
  generateAppAttacks,
  setGenerateAppAttacks,
}) {
  const [showKeyInput, setShowKeyInput] = useState(false);

  const activeProviderObj = modelsConfig?.providers?.find(p => p.id === selectedProvider) || modelsConfig?.providers?.[0];

  const handleClear = () => {
    if (samples?.length > 0) {
      onSelectSample(samples[0]);
    } else {
      setPrompt('');
    }
  };

  return (
    <div className="tactical-card p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative top hairline glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>

      {/* Header with Sample Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-heading font-semibold text-slate-100 uppercase tracking-wider">
            Target System Prompt Under Evaluation
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({prompt.length} chars)
          </span>
        </div>

        {/* Tactical 1-Click Samples */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Preset Target:</span>
          {samples?.map((s) => {
            const isWeak = s.level === 'weak';
            const isMedium = s.level === 'medium';
            const isStrong = s.level === 'strong';

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSample(s)}
                disabled={isRunning}
                className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium border transition active:scale-[0.98] ${
                  isWeak
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/50 hover:border-rose-700'
                    : isMedium
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50 hover:border-amber-700'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50 hover:border-emerald-700'
                } disabled:opacity-40`}
                title={s.description}
              >
                {isWeak && '🔴 '}
                {isMedium && '🟡 '}
                {isStrong && '🟢 '}
                {s.name}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleClear}
            disabled={isRunning}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-white/[0.06] hover:bg-white/[0.04] transition flex items-center gap-1"
            title="Reset prompt"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="relative rounded-lg overflow-hidden border border-white/[0.08] bg-[#070A10] focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isRunning}
          rows={5}
          placeholder="Paste or write the system prompt to red-team... (e.g. You are a refund bot for an e-commerce store...)"
          className="w-full bg-transparent p-3.5 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none resize-y leading-relaxed disabled:opacity-60"
        />

        {prompt.length > 800 && (
          <div className="border-t border-amber-900/40 bg-amber-950/20 px-3 py-1.5 text-[11px] text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Long prompt ({prompt.length} chars). On local CPU inference, concise prompts evaluate up to 4x faster.
            </span>
            <button
              type="button"
              onClick={() => onSelectSample(samples?.[0])}
              className="text-amber-400 hover:text-white underline font-semibold text-[10px]"
            >
              Reset to Weak Sample
            </button>
          </div>
        )}
      </div>

      {/* Configuration & Action Bar */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-wrap text-xs">
          {/* Scope Selector */}
          <div className="flex items-center gap-1.5 bg-[#070A10] p-1 rounded-lg border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase text-slate-400 px-2">Scope:</span>
            <div className="flex gap-1">
              {[
                { id: 'quick', label: 'Quick Matrix (8)', title: '1 attack per category - Fastest for local model & live demos' },
                { id: 'standard', label: 'Standard (16)', title: '2 attacks per category - Balanced' },
                { id: 'full', label: 'Full Audit (32+)', title: 'Comprehensive battery of all attacks' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScanScope(s.id)}
                  disabled={isRunning}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition ${
                    scanScope === s.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  title={s.title}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center gap-2 bg-[#070A10] px-2.5 py-1.5 rounded-lg border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase text-slate-400">Engine:</span>
            <select
              value={selectedProvider}
              onChange={(e) => {
                const prov = e.target.value;
                setSelectedProvider(prov);
                const provObj = modelsConfig?.providers?.find(p => p.id === prov);
                if (provObj?.models?.length > 0) {
                  setSelectedModel(provObj.models[0]);
                }
              }}
              disabled={isRunning}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            >
              {modelsConfig?.providers?.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0B0F18] text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector if applicable */}
          {activeProviderObj?.models && (
            <div className="flex items-center gap-1.5 bg-[#070A10] px-2.5 py-1.5 rounded-lg border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase text-slate-400">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isRunning}
                className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer"
              >
                {activeProviderObj.models.map((m) => (
                  <option key={m} value={m} className="bg-[#0B0F18] text-slate-200">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Deep Scan toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none text-[11px] font-mono">
            <input
              type="checkbox"
              checked={deepScan}
              onChange={(e) => setDeepScan(e.target.checked)}
              disabled={isRunning}
              className="rounded bg-[#070A10] border-white/[0.2] text-cyan-500 focus:ring-0"
            />
            <span title="Applies Base64, spaced, story wrapper, and leetspeak payload mutators">
              Deep Mutators
            </span>
          </label>

          {/* API Key button */}
          {activeProviderObj?.requires_key && (
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-950/30 border border-amber-900/50"
            >
              <Key className="w-3 h-3" />
              <span>{apiKey ? 'Key Set' : 'Set API Key'}</span>
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-heading font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-rose-950/60 active:scale-[0.98]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Abort Execution
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!prompt.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#04060A] font-heading font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Attack Matrix & Harden
            </button>
          )}
        </div>
      </div>

      {/* Key input drawer if required */}
      {showKeyInput && activeProviderObj?.requires_key && (
        <div className="mt-3 p-3 rounded-lg bg-[#070A10] border border-amber-900/40 flex items-center gap-3">
          <Key className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            type="password"
            placeholder={`Paste your ${selectedProvider.toUpperCase()} API key here...`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 bg-[#0B0F18] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={() => setShowKeyInput(false)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
