import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import Navbar from './components/Navbar';
import PromptInput from './components/PromptInput';
import StageProgress from './components/StageProgress';
import ScoreCard from './components/ScoreCard';
import AttackTable from './components/AttackTable';
import HardeningPanel from './components/HardeningPanel';
import BenignCheckPanel from './components/BenignCheckPanel';
import InteractivePlayground from './components/InteractivePlayground';
import HistoryModal from './components/HistoryModal';
import DocsModal from './components/DocsModal';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [samples, setSamples] = useState([]);
  const [modelsConfig, setModelsConfig] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('mock');
  const [selectedModel, setSelectedModel] = useState('simulation-engine-v1');
  const [apiKey, setApiKey] = useState('');
  const [scanScope, setScanScope] = useState('quick');
  const [deepScan, setDeepScan] = useState(false);
  const [generateAppAttacks, setGenerateAppAttacks] = useState(true);

  // Run execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [currentRunId, setCurrentRunId] = useState(null);
  const [currentStage, setCurrentStage] = useState('idle');
  const [stageMessage, setStageMessage] = useState('');

  // Results state
  const [attackResults, setAttackResults] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [hardenedData, setHardenedData] = useState(null);
  const [rerunResults, setRerunResults] = useState([]);
  const [benignChecks, setBenignChecks] = useState([]);
  const [beforeScore, setBeforeScore] = useState(0);
  const [afterScore, setAfterScore] = useState(0);
  const [flipsCount, setFlipsCount] = useState(0);
  const [totalFailures, setTotalFailures] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [showHistory, setShowHistory] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const eventSourceRef = useRef(null);

  // Load initial samples and available models
  useEffect(() => {
    fetch('/api/samples')
      .then((r) => r.json())
      .then((data) => {
        setSamples(data);
        if (data.length > 0 && !prompt) {
          // Pre-populate with weak refund bot for instant demonstration
          setPrompt(data[0].prompt);
        }
      })
      .catch((err) => console.error('Failed to load samples:', err));

    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        setModelsConfig(data);
        // Default to deterministic simulator for instant zero-latency demo
        setSelectedProvider('mock');
        setSelectedModel('simulation-engine-v1');
      })
      .catch((err) => console.error('Failed to load models:', err));
  }, []);

  const handleSelectSample = (sample) => {
    setPrompt(sample.prompt);
  };

  const handleStartRun = async () => {
    if (!prompt.trim() || isRunning) return;

    // Reset run state
    setIsRunning(true);
    setIsDone(false);
    setErrorMessage('');
    setAttackResults([]);
    setRerunResults([]);
    setBenignChecks([]);
    setHardenedData(null);
    setScoreData(null);
    setBeforeScore(0);
    setAfterScore(0);
    setFlipsCount(0);
    setTotalFailures(0);
    setCurrentStage('harness');
    setStageMessage('Initializing test harness & canary generator...');

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const resp = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          provider: selectedProvider,
          api_key: apiKey,
          scan_scope: scanScope,
          deep_scan: deepScan,
          generate_app_attacks: generateAppAttacks,
          auto_harden: true,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Failed to create run: ${resp.statusText}`);
      }

      const { run_id } = await resp.json();
      setCurrentRunId(run_id);

      // Connect to SSE stream
      const sse = new EventSource(`/api/runs/${run_id}/events`);
      eventSourceRef.current = sse;

      sse.addEventListener('run_started', (e) => {
        const data = JSON.parse(e.data);
        setCurrentStage('running_attacks');
        setStageMessage(`Harness ready. Streaming ${data.total_attacks} attacks...`);
      });

      sse.addEventListener('stage_update', (e) => {
        const data = JSON.parse(e.data);
        setCurrentStage(data.stage);
        setStageMessage(data.message);
      });

      sse.addEventListener('attack_result', (e) => {
        const result = JSON.parse(e.data);
        setAttackResults((prev) => [result, ...prev]);
      });

      sse.addEventListener('score_update', (e) => {
        const score = JSON.parse(e.data);
        setScoreData(score);
        setBeforeScore(score.overall_resistance);
      });

      sse.addEventListener('hardened_prompt', (e) => {
        const data = JSON.parse(e.data);
        setHardenedData(data);
      });

      sse.addEventListener('rerun_result', (e) => {
        const item = JSON.parse(e.data);
        setRerunResults((prev) => [...prev, item]);
      });

      sse.addEventListener('score_comparison', (e) => {
        const comp = JSON.parse(e.data);
        setBeforeScore(comp.before_resistance);
        setAfterScore(comp.after_resistance);
        setFlipsCount(comp.flips_count);
        setTotalFailures(comp.total_failures);
      });

      sse.addEventListener('benign_check_result', (e) => {
        const b = JSON.parse(e.data);
        setBenignChecks((prev) => [...prev, b]);
      });

      sse.addEventListener('done', (e) => {
        setIsRunning(false);
        setIsDone(true);
        setCurrentStage('done');
        setStageMessage('Full audit, hardening, and benign regression testing complete.');
        sse.close();
      });

      sse.addEventListener('cancelled', (e) => {
        setIsRunning(false);
        setStageMessage('Run stopped by user.');
        sse.close();
      });

      sse.addEventListener('error', (e) => {
        try {
          const errData = JSON.parse(e.data);
          setErrorMessage(errData.message || 'Error occurred during run.');
        } catch (_) {
          // Normal SSE termination
        }
      });

      sse.onerror = () => {
        setIsRunning(false);
        sse.close();
      };
    } catch (err) {
      setIsRunning(false);
      setErrorMessage(err.message);
    }
  };

  const handleStopRun = async () => {
    if (!currentRunId) return;
    try {
      await fetch(`/api/runs/${currentRunId}/stop`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsRunning(false);
    setStageMessage('Run cancelled by user.');
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans selection:bg-cyber-cyan/20 selection:text-cyber-cyan relative">
      {/* Background Micro-Grid & Radial Glow */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid-sm opacity-25 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[360px] bg-radial-glow pointer-events-none" />

      {/* Top Navbar */}
      <Navbar
        onOpenHistory={() => setShowHistory(true)}
        onOpenDocs={() => setShowDocs(true)}
        currentModel={selectedModel}
        provider={selectedProvider}
      />

      {/* Main Tactical Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Error Notification Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center justify-between shadow-lg shadow-rose-950/40"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyber-crimson shrink-0" />
                <span className="font-mono">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-rose-400 hover:text-white font-bold ml-4 p-1 rounded hover:bg-rose-900/50 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Prompt Input & Config Section */}
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          samples={samples}
          onSelectSample={handleSelectSample}
          onSubmit={handleStartRun}
          onStop={handleStopRun}
          isRunning={isRunning}
          modelsConfig={modelsConfig}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          scanScope={scanScope}
          setScanScope={setScanScope}
          apiKey={apiKey}
          setApiKey={setApiKey}
          deepScan={deepScan}
          setDeepScan={setDeepScan}
          generateAppAttacks={generateAppAttacks}
          setGenerateAppAttacks={setGenerateAppAttacks}
        />

        {/* 2. Pipeline Execution Stages */}
        {(isRunning || isDone || currentStage !== 'idle') && (
          <StageProgress
            currentStage={currentStage}
            stageMessage={stageMessage}
            isRunning={isRunning}
            isDone={isDone}
          />
        )}

        {/* 3. Resistance Score Card */}
        {scoreData && (
          <ScoreCard
            scoreData={scoreData}
            totalAttacksCount={attackResults.length}
          />
        )}

        {/* 4. Hardening & Regression Panel */}
        {hardenedData && (
          <HardeningPanel
            hardenedData={hardenedData}
            beforeScore={beforeScore}
            afterScore={afterScore}
            flipsCount={flipsCount}
            totalFailures={totalFailures}
            rerunResults={rerunResults}
            runId={currentRunId}
          />
        )}

        {/* 5. False-Positive / Benign Tasks Panel */}
        {benignChecks.length > 0 && (
          <BenignCheckPanel benignChecks={benignChecks} />
        )}

        {/* 6. Live Attack Matrix Table */}
        {(attackResults.length > 0 || isRunning) && (
          <AttackTable
            attackResults={attackResults}
            isRunning={isRunning}
          />
        )}

        {/* 7. Interactive Judge's Turn Playground */}
        <InteractivePlayground
          originalPrompt={prompt}
          hardenedPrompt={hardenedData?.hardened_prompt}
          model={selectedModel}
          provider={selectedProvider}
          apiKey={apiKey}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-obsidian-950 py-5 text-center text-xs text-slate-500 font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" />
            <span className="text-slate-400 font-medium">PromptProof Cybernetic Defense Instrument</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">Tier L2 Tactical Matrix</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Built for Vibethon • AI for Cybersecurity Track • Deterministic Verification
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadRun={(r) => {}}
      />
      <DocsModal
        isOpen={showDocs}
        onClose={() => setShowDocs(false)}
      />
    </div>
  );
}
