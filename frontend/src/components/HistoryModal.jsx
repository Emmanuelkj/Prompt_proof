import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Download, ArrowRight, ShieldCheck, RefreshCw, Cpu, Calendar, Clock } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, onLoadRun }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRuns();
    }
  }, [isOpen]);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
          {/* Modal Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyber-cyan">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-semibold text-slate-100">
                  Audit History & Security Reports
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Persistent SQLite audit records with verifiable JSON exports
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchRuns}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition"
                title="Refresh History"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-2">
            {loading ? (
              <div className="py-14 text-center text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
                <span>Loading previous audit runs...</span>
              </div>
            ) : runs.length === 0 ? (
              <div className="py-14 text-center text-slate-500 font-mono text-xs">
                No previous audit runs found in storage. Execute your first audit above!
              </div>
            ) : (
              runs.map((r) => (
                <div
                  key={r.run_id}
                  className="p-3.5 rounded-lg bg-obsidian-900/80 border border-white/10 flex items-center justify-between text-xs hover:border-white/20 transition group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyber-cyan">{r.run_id}</span>
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-obsidian-800 text-slate-300 font-mono border border-white/5 flex items-center gap-1">
                        <Cpu className="w-2.5 h-2.5 text-slate-400" />
                        {r.model}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono pt-0.5">
                      <span className="text-slate-400">Resistance:</span>
                      <span className="font-bold text-cyber-crimson">{r.initial_resistance}%</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="font-bold text-cyber-emerald">{r.hardened_resistance}%</span>
                      {r.flips_count > 0 && (
                        <span className="text-[10px] text-cyber-cyan bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800">
                          {r.flips_count} fixes
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/runs/${r.run_id}/report`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-cyber-cyan border border-white/10 text-xs font-mono transition"
                      title="Download Audit JSON Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
