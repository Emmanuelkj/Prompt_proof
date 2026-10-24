import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Terminal,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  Layers,
  FileCode2,
} from 'lucide-react';

export default function AttackTable({ attackResults = [], isRunning }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [copiedPayloadId, setCopiedPayloadId] = useState(null);
  const [copiedRespId, setCopiedRespId] = useState(null);

  // Compute counts for tab badges
  const failCount = attackResults.filter((a) => a.verdict === 'fail').length;
  const passCount = attackResults.filter((a) => a.verdict === 'pass').length;
  const indirectCount = attackResults.filter((a) => a.category === 'indirect_injection').length;
  const generatedCount = attackResults.filter((a) => a.is_generated).length;

  const handleCopy = (text, id, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'payload') {
      setCopiedPayloadId(id);
      setTimeout(() => setCopiedPayloadId(null), 1800);
    } else {
      setCopiedRespId(id);
      setTimeout(() => setCopiedRespId(null), 1800);
    }
  };

  // Filter items
  const filtered = attackResults.filter((item) => {
    // Tab filter
    if (filter === 'failed' && item.verdict !== 'fail') return false;
    if (filter === 'passed' && item.verdict !== 'pass') return false;
    if (filter === 'indirect' && item.category !== 'indirect_injection') return false;
    if (filter === 'generated' && !item.is_generated) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = item.id?.toLowerCase().includes(q);
      const matchName = item.name?.toLowerCase().includes(q);
      const matchReason = item.reason?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchReason && !matchCategory) return false;
    }
    return true;
  });

  const getStatusBadge = (verdict) => {
    switch (verdict) {
      case 'pass':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-cyber-emerald border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Passed</span>
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/80 text-cyber-crimson border border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Breached</span>
          </span>
        );
      case 'ambiguous':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/70 text-cyber-amber border border-amber-800/80">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Ambiguous</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-obsidian-800 text-slate-400 border border-white/10">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{verdict || 'Testing...'}</span>
          </span>
        );
    }
  };

  const getSeverityBadge = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'critical') {
      return (
        <span className="text-[10px] uppercase font-mono font-bold text-cyber-crimson bg-rose-950/70 px-2 py-0.5 rounded border border-rose-900/80">
          Critical
        </span>
      );
    }
    if (s === 'high') {
      return (
        <span className="text-[10px] uppercase font-mono font-semibold text-orange-400 bg-orange-950/70 px-2 py-0.5 rounded border border-orange-900/80">
          High
        </span>
      );
    }
    if (s === 'medium') {
      return (
        <span className="text-[10px] uppercase font-mono font-medium text-cyber-amber bg-amber-950/70 px-2 py-0.5 rounded border border-amber-900/80">
          Medium
        </span>
      );
    }
    return (
      <span className="text-[10px] uppercase font-mono text-slate-400 bg-obsidian-800 px-2 py-0.5 rounded border border-white/5">
        Low
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="tactical-card overflow-hidden shadow-2xl"
    >
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-obsidian-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyber-cyan">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-heading font-semibold text-slate-100">
                Live Attack Matrix & Deterministic Judge Stream
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                [{filtered.length}/{attackResults.length}]
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic verification using cryptographically injected canaries and instruction tokens.
            </p>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter vectors or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-obsidian-950 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-cyan w-48 transition font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex rounded-lg bg-obsidian-950 p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-obsidian-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({attackResults.length})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                filter === 'failed'
                  ? 'bg-rose-950 text-cyber-crimson font-semibold border border-rose-900/60'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Breaches {failCount > 0 && <span className="font-mono">({failCount})</span>}
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === 'passed'
                  ? 'bg-emerald-950 text-cyber-emerald font-semibold border border-emerald-900/60'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Passed ({passCount})
            </button>
            <button
              onClick={() => setFilter('indirect')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === 'indirect'
                  ? 'bg-cyan-950 text-cyber-cyan font-semibold border border-cyan-900/60'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              Indirect ({indirectCount})
            </button>
            <button
              onClick={() => setFilter('generated')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === 'generated'
                  ? 'bg-purple-950 text-cyber-purple font-semibold border border-purple-900/60'
                  : 'text-slate-400 hover:text-purple-400'
              }`}
            >
              Tailored ({generatedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-obsidian-950 text-slate-400 uppercase tracking-wider text-[10px] font-mono font-semibold sticky top-0 z-10 border-b border-white/10">
            <tr>
              <th className="py-2.5 px-4 w-32">Verdict</th>
              <th className="py-2.5 px-3 w-20">ID</th>
              <th className="py-2.5 px-4">Attack Vector & Technique</th>
              <th className="py-2.5 px-3 w-24">Severity</th>
              <th className="py-2.5 px-4">Deterministic Verdict Reason</th>
              <th className="py-2.5 px-4 hidden lg:table-cell">Model Response Snippet</th>
              <th className="py-2.5 px-3 w-16 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-slate-500">
                  {isRunning ? (
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-6 h-6 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono text-xs text-slate-400">
                        Streaming concurrent vector audits through target model...
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs">
                      No vector records match the current filter selection.
                    </span>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isExpanded = expandedRow === item.id;
                const isIndirect = item.category === 'indirect_injection';

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                      className={`cursor-pointer transition-colors ${
                        item.verdict === 'fail'
                          ? 'bg-rose-950/15 hover:bg-rose-950/25'
                          : 'hover:bg-white/[0.03]'
                      } ${isExpanded ? 'bg-white/[0.06] border-b border-cyber-cyan/20' : ''}`}
                    >
                      {/* Verdict */}
                      <td className="py-2.5 px-4">
                        {getStatusBadge(item.verdict)}
                      </td>

                      {/* ID */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                        {item.id}
                      </td>

                      {/* Name & Badges */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-100">{item.name}</span>
                          {isIndirect && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyber-cyan border border-cyan-800">
                              Indirect
                            </span>
                          )}
                          {item.is_generated && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-950 text-cyber-purple border border-purple-800 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Tailored
                            </span>
                          )}
                          {item.is_mutation && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-obsidian-800 text-slate-300 border border-white/10">
                              Mutation
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 capitalize block mt-0.5 font-mono">
                          {item.category.replace('_', ' ')} • Goal: {item.goal?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-2.5 px-3">
                        {getSeverityBadge(item.severity)}
                      </td>

                      {/* Reason */}
                      <td className="py-2.5 px-4 text-slate-300 font-mono text-[11px]">
                        {item.reason}
                      </td>

                      {/* Response snippet */}
                      <td className="py-2.5 px-4 hidden lg:table-cell text-slate-400 font-mono text-[11px] truncate max-w-xs">
                        {item.response ? item.response.substring(0, 70) + '...' : '—'}
                      </td>

                      {/* Expand Icon */}
                      <td className="py-2.5 px-3 text-center text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 mx-auto text-cyber-cyan" />
                        ) : (
                          <ChevronDown className="w-4 h-4 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Detailed Expanded Row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr className="bg-obsidian-950 border-t border-b border-white/10">
                          <td colSpan={7} className="p-4">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-3"
                            >
                              {/* Metadata Strip */}
                              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5 flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-slate-400">
                                    Vector: <strong className="text-white">{item.id} - {item.name}</strong>
                                  </span>
                                  <span className="font-mono text-slate-400">
                                    Category: <strong className="text-cyber-cyan">{item.category}</strong>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {item.canary_found && (
                                    <span className="text-[10px] font-mono font-bold text-cyber-crimson bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 flex items-center gap-1">
                                      <ShieldAlert className="w-3 h-3" /> Canary Leaked
                                    </span>
                                  )}
                                  {item.marker_found && (
                                    <span className="text-[10px] font-mono font-bold text-cyber-crimson bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 flex items-center gap-1">
                                      <ShieldAlert className="w-3 h-3" /> Marker Executed
                                    </span>
                                  )}
                                  {item.elapsed_ms && (
                                    <span className="text-[10px] font-mono text-slate-400 bg-obsidian-850 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-500" /> {item.elapsed_ms}ms
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Two Columns: Attack Payload vs Raw Target Response */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left: Attack Payload */}
                                <div className="bg-obsidian-900 rounded-lg p-3 border border-white/10">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono font-semibold text-cyber-cyan flex items-center gap-1.5">
                                      <Terminal className="w-3.5 h-3.5" />
                                      Rendered Attack Payload Sent to LLM:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(item.rendered_input, item.id, 'payload');
                                      }}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 border border-white/10 transition"
                                    >
                                      {copiedPayloadId === item.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-cyber-emerald" />
                                          <span className="text-cyber-emerald">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-slate-400" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-words bg-obsidian-950 p-3 rounded-md border border-white/5 max-h-56 overflow-y-auto leading-relaxed">
                                    {item.rendered_input}
                                  </pre>
                                </div>

                                {/* Right: Plain Text Response */}
                                <div className="bg-obsidian-900 rounded-lg p-3 border border-white/10">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono font-semibold text-cyber-purple flex items-center gap-1.5">
                                      <FileCode2 className="w-3.5 h-3.5" />
                                      Target LLM Response (Plain Text Only):
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(item.response || '', item.id, 'resp');
                                      }}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 border border-white/10 transition"
                                    >
                                      {copiedRespId === item.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-cyber-emerald" />
                                          <span className="text-cyber-emerald">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-slate-400" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-words bg-obsidian-950 p-3 rounded-md border border-white/5 max-h-56 overflow-y-auto leading-relaxed">
                                    {item.response || '(Empty response returned)'}
                                  </pre>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
