import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [selectedModel, setSelectedModel] = useState('llama3.2:latest');
  const [apiKey, setApiKey] = useState('');
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
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenHistory={() => setShowHistory(true)}
        onOpenDocs={() => setShowDocs(true)}
        currentModel={selectedModel}
        provider={selectedProvider}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-white font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

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
      <footer className="border-t border-slate-900 bg-[#0d121e] py-4 text-center text-xs text-slate-500">
        <p>
          PromptProof • Built for Vibethon (ENCIDE, Mar Athanasius College of Engineering) • Track: AI for Cybersecurity
        </p>
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
