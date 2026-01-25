'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, RefreshCw, AlertCircle, ChevronDown, ChevronUp, MessageSquarePlus, Send, X } from 'lucide-react';
import { userThesisData } from '@/data/user-thesis';
import { cn } from '@/lib/utils';

const BULLET_TRUNCATE = 110;
const COMPACT_BULLETS = 5;

interface AIAnalysisSectionProps {
  ticker: string;
  companyName: string;
}

function getSummary(analysis: string): { headline: string; bullets: string[] } {
  const headline =
    analysis.match(/\*\*Recommendation:\*\*\s*([^\n*]+)/i)?.[1]?.trim() ||
    analysis.match(/\*\*Verdict:\*\*\s*([^\n*]+)/i)?.[1]?.trim() ||
    '';

  const sec5 = analysis.match(
    /##\s*5[.)]\s*Investment\s*Summary[\s\S]*?(?=##\s*\d|$)/i
  )?.[0] || analysis.match(/##\s*Investment\s*Summary[\s\S]*?(?=##|$)/i)?.[0];

  const bullets: string[] = [];
  if (sec5) {
    const lines = sec5.split(/\n/);
    for (const line of lines) {
      const t = line.replace(/^[\s\-*•]+\s*/, '').trim();
      if (!t || /^##\s/i.test(line)) continue;
      if (/^[\-*•]\s/.test(line) || /^\d+\.\s/.test(line))
        bullets.push(t.replace(/\*\*Recommendation:\*\*\s*/i, '').replace(/\*\*Confidence:\*\*/i, '').replace(/\*\*Expected timeframe:\*\*\s*/i, ''));
      else if (/\*\*Recommendation:\*\*/i.test(line)) bullets.push('Recommendation: ' + (t || line).replace(/\*\*Recommendation:\*\*\s*/gi, '').trim());
      else if (/\*\*Confidence:\*\*/i.test(line)) bullets.push('Confidence: ' + (t || line).replace(/\*\*Confidence:\*\*\s*/gi, '').trim());
      else if (/\*\*Expected timeframe:\*\*/i.test(line)) bullets.push('Timeframe: ' + (t || line).replace(/\*\*Expected timeframe:\*\*\s*/gi, '').trim());
    }
  }

  if (bullets.length === 0) {
    const allBullets = analysis.match(/^[\-*•]\s+.+$/gm) || [];
    bullets.push(...allBullets.slice(0, 6).map((b) => b.replace(/^[\s\-*•]+\s*/, '').trim()));
  }

  return {
    headline: headline || (bullets[0]?.slice(0, 60) ? `${bullets[0].slice(0, 60)}${bullets[0].length > 60 ? '…' : ''}` : 'Summary'),
    bullets: bullets.length ? bullets : [analysis.slice(0, 400) + (analysis.length > 400 ? '…' : '')],
  };
}

const REFINE_CHIPS = [
  'Factor in recent news or events',
  'What are the main risks?',
  'Add more on margins and valuation',
];

export function AIAnalysisSection({ ticker, companyName }: AIAnalysisSectionProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingCache, setCheckingCache] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [refineSuccess, setRefineSuccess] = useState(false);

  const thesisData = userThesisData[ticker.toUpperCase()];

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/ai/generate-thesis?ticker=${encodeURIComponent(ticker)}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.analysis) setAnalysis(data.analysis);
          else setAnalysis(null);
        }
      } catch {
        if (!cancelled) setAnalysis(null);
      } finally {
        if (!cancelled) setCheckingCache(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ticker]);

  const handleGenerate = async (forceRegenerate: boolean) => {
    if (!thesisData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          companyName,
          userThesis: thesisData.thesis,
          priceTarget: thesisData.priceTarget,
          catalysts: thesisData.catalysts,
          risks: thesisData.risks,
          forceRegenerate,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setError(null);
        setExpanded(false);
      } else {
        const msg = data.error || (res.ok ? null : `Request failed (${res.status})`);
        setError(msg || 'Failed to generate analysis');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network or server error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refineInput.trim() || !analysis) return;
    setRefineLoading(true);
    setRefineError(null);
    setRefineSuccess(false);
    try {
      const res = await fetch('/api/ai/refine-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          companyName,
          existingAnalysis: analysis,
          userMessage: refineInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setRefineInput('');
        setRefineSuccess(true);
        setTimeout(() => setRefineSuccess(false), 2500);
      } else {
        setRefineError(data.error || 'Failed to refine');
      }
    } catch (e) {
      setRefineError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setRefineLoading(false);
    }
  };

  const summary = analysis ? getSummary(analysis) : { headline: '', bullets: [] };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Analysis</h2>
          <p className="text-sm text-slate-400">Claude-generated research • Expand or refine as needed</p>
        </div>
      </div>

      {checkingCache && !analysis && (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-dashed border-slate-700 text-center text-slate-500">
          Checking for cached analysis...
        </div>
      )}

      {!checkingCache && !analysis && !loading && (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-dashed border-slate-700">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800/50 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          <p className="text-slate-500 text-center mb-4">
            No AI analysis yet. Generate one to get an independent research report.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => handleGenerate(false)}
              disabled={!thesisData}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                thesisData ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              )}
            >
              <Sparkles className="w-4 h-4" />
              Generate AI Analysis
            </button>
          </div>
          {!thesisData && <p className="text-slate-600 text-sm text-center mt-2">Add thesis data for {ticker} to enable.</p>}
        </div>
      )}

      {loading && (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating analysis...</span>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800/50 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Actions: Show more/less, Regenerate, Refine */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Show less' : 'Read full report'}
            </button>
            <button
              onClick={() => handleGenerate(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={() => { setRefineOpen(!refineOpen); setRefineError(null); setRefineSuccess(false); }}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                refineOpen ? 'bg-cyan-900/40 text-cyan-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              <MessageSquarePlus className="w-4 h-4" />
              Refine with AI
            </button>
          </div>

          {/* Compact: bullet summary only (capped height, scannable) */}
          {!expanded && (
            <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 max-h-[220px] overflow-hidden">
              {summary.headline && (
                <p className="text-sm font-semibold text-cyan-300/90 mb-3">{summary.headline}</p>
              )}
              <ul className="space-y-1.5 text-sm text-slate-300">
                {summary.bullets.slice(0, COMPACT_BULLETS).map((b, i) => {
                  const t = b.length > BULLET_TRUNCATE ? `${b.slice(0, BULLET_TRUNCATE)}…` : b;
                  return (
                    <li key={i} className="flex gap-2">
                      <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
                      <span>{t}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Expanded: full report (scrollable, non‑intrusive) */}
          {expanded && (
            <div
              className={cn(
                'bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 max-h-[60vh] overflow-y-auto',
                'prose prose-invert prose-sm max-w-none',
                'prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300',
                'prose-table:text-slate-300 prose-th:border-slate-600 prose-td:border-slate-700'
              )}
            >
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}

          {/* Refine: optional chat-style panel to fine-tune analysis */}
          {refineOpen && (
            <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-medium text-slate-200">Refine with AI</span>
                <button
                  onClick={() => { setRefineOpen(false); setRefineError(null); setRefineSuccess(false); }}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-400">e.g. Factor in the new FDA approval; What are the risks of China exposure?; Add more on margins.</p>
                <div className="flex flex-wrap gap-2">
                  {REFINE_CHIPS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setRefineInput(label)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/80 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/80 border border-slate-700 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {refineError && <p className="text-sm text-red-400">{refineError}</p>}
                {refineSuccess && <p className="text-sm text-emerald-400">Analysis updated.</p>}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={refineInput}
                    onChange={(e) => setRefineInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                    placeholder="Ask a follow-up to refine the analysis…"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    disabled={refineLoading}
                  />
                  <button
                    onClick={handleRefine}
                    disabled={refineLoading || !refineInput.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 text-sm font-medium"
                  >
                    {refineLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
