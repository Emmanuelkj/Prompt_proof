import React, { useState } from 'react';
import { Play, Square, Sparkles, Settings2, ShieldCheck, AlertTriangle, Key, Layers } from 'lucide-react';

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
  const [showConfig, setShowConfig] = useState(false);

  const activeProviderObj = modelsConfig?.providers?.find(p => p.id === selectedProvider) || modelsConfig?.providers?.[0];

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header and Sample Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            Target System Prompt Under Test
            <span className="text-xs font-normal text-slate-400">
              ({prompt.length} chars)
            </span>
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste your LLM app's system prompt or choose a pre-configured sample below:
          </p>
        </div>

        {/* 1-Click Sample Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Samples:</span>
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
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition ${
                  isWeak
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/50'
                    : isMedium
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
                } disabled:opacity-50`}
                title={s.description}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isRunning}
          rows={5}
          placeholder="Enter your system prompt here... (e.g. You are a customer support bot. Answer questions about refunds...)"
          className="w-full bg-[#0a0d14] border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition resize-y disabled:opacity-60"
        />
      </div>

      {/* Configuration bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap text-xs">
          {/* Engine Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Provider:</span>
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
              className="bg-[#0a0d14] border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            >
              {modelsConfig?.providers?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector */}
          {activeProviderObj?.models && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isRunning}
                className="bg-[#0a0d14] border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              >
                {activeProviderObj.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Scope:</span>
            <select
              value={scanScope}
              onChange={(e) => setScanScope(e.target.value)}
              disabled={isRunning}
              className="bg-[#0a0d14] border border-slate-700 text-cyan-300 font-medium rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            >
              <option value="quick">Quick Matrix (8 Attacks - Fast for Local Model)</option>
              <option value="standard">Standard (16 Attacks)</option>
              <option value="full">Full Audit (32 Attacks)</option>
            </select>
          </div>

          {/* Toggle deep scan */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={deepScan}
              onChange={(e) => setDeepScan(e.target.checked)}
              disabled={isRunning}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/30"
            />
            <span title="Applies base64, spaced, story wrapper, and leetspeak payload mutators">
              Deep Scan (Mutators)
            </span>
          </label>

          {/* Toggle AI app-specific attacks */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={generateAppAttacks}
              onChange={(e) => setGenerateAppAttacks(e.target.checked)}
              disabled={isRunning}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/30"
            />
            <span className="flex items-center gap-1" title="Attacker LLM analyzes prompt domain and crafts 4 custom injection vectors">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              AI Tailored Attacks
            </span>
          </label>

          {/* API Key toggle button for external keys */}
          {activeProviderObj?.requires_key && (
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? 'API Key Set' : 'Configure API Key'}</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-900/30"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop Test Run
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!prompt.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Attack Matrix & Harden
            </button>
          )}
        </div>
      </div>

      {/* API Key Modal / Drawer if required */}
      {showConfig && activeProviderObj?.requires_key && (
        <div className="mt-3 p-3 rounded-lg bg-[#0a0d14] border border-amber-900/40 flex items-center gap-3">
          <Key className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <input
              type="password"
              placeholder={`Enter your ${selectedProvider.toUpperCase()} API key...`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowConfig(false)}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
