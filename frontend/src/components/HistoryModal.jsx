import React, { useEffect, useState } from 'react';
import { X, History, Download, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Audit History & Saved Reports</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Loading run history...
            </div>
          ) : runs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No previous test runs found. Execute your first audit above!
            </div>
          ) : (
            runs.map((r) => (
              <div
                key={r.run_id}
                className="p-3 rounded-lg bg-[#0a0d14] border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{r.run_id}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{new Date(r.created_at).toLocaleString()}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-850 text-slate-300 font-mono">
                      {r.model}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-400">Resistance:</span>
                    <span className="font-mono font-semibold text-rose-400">{r.initial_resistance}%</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="font-mono font-semibold text-emerald-400">{r.hardened_resistance}%</span>
                    {r.flips_count > 0 && (
                      <span className="text-[10px] text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
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
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                    title="Download JSON Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
