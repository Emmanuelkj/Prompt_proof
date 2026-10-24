import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Search, Filter, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

export default function AttackTable({ attackResults = [], isRunning }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Filter items
  const filtered = attackResults.filter((item) => {
    // Tab filter
    if (filter === 'failed' && item.verdict !== 'fail') return false;
    if (filter === 'passed' && item.verdict !== 'pass') return false;
    if (filter === 'ambiguous' && item.verdict !== 'ambiguous') return false;
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Passed</span>
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80 animate-pulse">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Failed</span>
          </span>
        );
      case 'ambiguous':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Ambiguous</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{verdict || 'Pending'}</span>
          </span>
        );
    }
  };

  const getSeverityBadge = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'critical') return <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/60">Critical</span>;
    if (s === 'high') return <span className="text-[10px] uppercase font-semibold text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-900/60">High</span>;
    if (s === 'medium') return <span className="text-[10px] uppercase font-medium text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/60">Medium</span>;
    return <span className="text-[10px] uppercase font-normal text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Low</span>;
  };

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Header & Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0d1322]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Live Attack Matrix & Deterministic Judge Stream
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({filtered.length} of {attackResults.length})
          </span>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search attacks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0a0d14] border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-44"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-lg bg-[#0a0d14] p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${filter === 'failed' ? 'bg-rose-950 text-rose-300' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Failed
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${filter === 'passed' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Passed
            </button>
            <button
              onClick={() => setFilter('indirect')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${filter === 'indirect' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Indirect
            </button>
            <button
              onClick={() => setFilter('generated')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${filter === 'generated' ? 'bg-purple-950 text-purple-300' : 'text-slate-400 hover:text-slate-200'}`}
            >
              AI Tailored
            </button>
          </div>
        </div>
      </div>

      {/* Attack List Table */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#0a0d14] text-slate-400 uppercase tracking-wider text-[10px] font-semibold sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 w-28">Verdict</th>
              <th className="py-2.5 px-3 w-20">ID</th>
              <th className="py-2.5 px-4">Attack Vector & Technique</th>
              <th className="py-2.5 px-3 w-24">Severity</th>
              <th className="py-2.5 px-4">Judge Deterministic Reason</th>
              <th className="py-2.5 px-4 hidden lg:table-cell">Target Model Response Preview</th>
              <th className="py-2.5 px-3 w-16 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  {isRunning ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Streaming real-time attack evaluations...</span>
                    </div>
                  ) : (
                    'No attack results match the current filter or search criteria.'
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
                      className={`cursor-pointer transition hover:bg-slate-800/40 ${
                        item.verdict === 'fail' ? 'bg-rose-950/10' : ''
                      } ${isExpanded ? 'bg-slate-800/60' : ''}`}
                    >
                      {/* Verdict */}
                      <td className="py-2.5 px-4">
                        {getStatusBadge(item.verdict)}
                      </td>

                      {/* ID */}
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-300">
                        {item.id}
                      </td>

                      {/* Name & Badges */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-100">{item.name}</span>
                          {isIndirect && (
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              Indirect
                            </span>
                          )}
                          {item.is_generated && (
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Tailored
                            </span>
                          )}
                          {item.is_mutation && (
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Mutation
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 capitalize block mt-0.5">
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
                        {isExpanded ? <ChevronUp className="w-4 h-4 mx-auto" /> : <ChevronDown className="w-4 h-4 mx-auto" />}
                      </td>
                    </tr>

                    {/* Detailed Expanded Row */}
                    {isExpanded && (
                      <tr className="bg-[#0d121e] border-t border-b border-slate-800">
                        <td colSpan={7} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Rendered Attack Input */}
                            <div className="bg-[#0a0d14] rounded-lg p-3 border border-slate-800">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                                  <Terminal className="w-3.5 h-3.5" />
                                  Rendered Attack Payload Sent to LLM:
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Target: {item.goal}
                                </span>
                              </div>
                              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-words bg-slate-950 p-2.5 rounded border border-slate-850 max-h-48 overflow-y-auto">
                                {item.rendered_input}
                              </pre>
                            </div>

                            {/* Raw Model Response (Plain Text Only) */}
                            <div className="bg-[#0a0d14] rounded-lg p-3 border border-slate-800">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
                                  Model Response (Plain Text):
                                </span>
                                <div className="flex items-center gap-2 text-[10px]">
                                  {item.canary_found && (
                                    <span className="text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
                                      Canary Leaked!
                                    </span>
                                  )}
                                  {item.marker_found && (
                                    <span className="text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
                                      Marker Executed!
                                    </span>
                                  )}
                                </div>
                              </div>
                              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-words bg-slate-950 p-2.5 rounded border border-slate-850 max-h-48 overflow-y-auto">
                                {item.response}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
