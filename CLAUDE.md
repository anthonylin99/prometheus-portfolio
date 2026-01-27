# Prometheus ETF / PathFinder ETF — Project Context (Cursor & Claude Code)

**This file is the canonical project context for both Cursor and Claude Code.** Anyone (human or AI) editing this repo should read this file and **[bible.md](./bible.md)** first.

Personal portfolio tracker for **Prometheus ETF ($ALIN)**. Next.js 16 (App Router), TypeScript, Tailwind CSS, Upstash Redis, Yahoo Finance, lightweight-charts, Anthropic Claude.

**Live:** https://prometheus-personal-portfolio.vercel.app/

**Philosophy & standards:** All code, refactors, and design decisions must align with **[bible.md](./bible.md)**. This applies in **Cursor**, **Claude Code**, and any other editor. Read bible.md first. Architecture over expediency, radical reliability, documentation as code, and the "Considerate Coworker" protocol apply to every change.

---

## Cross-editor sync (Cursor ↔ Claude Code)

This repo may be edited in **Cursor** or **Claude Code** (or elsewhere). The single source of truth is the **git remote** (`origin`). To see changes made in the other editor:

- **After editing in Claude Code:** In Cursor, run `git pull` (or use Source Control → Pull) so this workspace has the latest from `origin`.
- **After editing in Cursor:** Push from here; Claude Code will see updates after you pull there (or clone/fetch).

There is no automatic live sync between editors — both stay in sync by **push** from the editor you used and **pull** in the one you’re switching to. Run `git pull` when opening the repo in a different environment.

---

## Recent changes (this session)

### AI Generate-Thesis

- **"Failed to generate analysis"** fix:
  - Anthropic client is created only when `ANTHROPIC_API_KEY` is set (no init at module load with undefined key).
  - `request.json()` wrapped in try/catch; invalid JSON returns `400` with `Invalid JSON body`.
  - API `catch` returns `err.message` (e.g. invalid API key, rate limit, network) in `{ error }` so the UI can show the real reason instead of a generic message.
  - Clearer message when key is missing: for local `.env.local`, for Vercel: Project Settings → Environment Variables, add ANTHROPIC_API_KEY, then redeploy.
- **404 model not found:** Switched from deprecated `claude-3-5-haiku-20241022` to **`claude-haiku-4-5-20251001`**. Override with `ANTHROPIC_MODEL_ID` in `.env.local` if needed.
- **New investment research prompt:** Structured report: 1) Fundamental Analysis (revenue, margins, FCF, valuation, insider), 2) Thesis Validation (3 for, 2 against, Verdict), 3) Sector & Macro, 4) Catalyst Watch (short/long term), 5) Investment Summary (5 bullets, Buy/Hold/Sell, confidence, timeframe). User thesis/price target/catalysts/risks passed as optional context. `max_tokens: 2048`.

### Holdings price chart ($ vs %)

- **Default by mode:**
  - **No comparison:** default is **Price ($)** — candlesticks in dollars.
  - **With comparison (e.g. SPY):** default is **%** — both series as % from period start for apples-to-apples comparison.
- **Toggle:** `View: [ $ ] [ % ]` next to the range (1D, 5D, 1M, …). User can override the default.
- **Price mode:** primary = candlesticks in $; compare = line in $ on the **left** price scale.
- **% mode:** primary = candlesticks in %; compare = solid line in % on the same scale.
- Period label: in $ mode shows e.g. `1Y: $25.40 (+12.3%)`; in % mode `1Y: +12.3%`.

### 1D / 5D chart: scrollable history

- **1D and 5D** no longer fetch only 1 or 5 days (which produced 1–5 candles and nothing to scroll). The API now fetches **2 months** of daily data for 1D and 5D, so the chart has ~40 bars and you can scroll to earlier days.
- The **period %** in the header still matches the range: 1D = 1-day % (last vs previous close); 5D = 5-trading-day % (last vs 5 bars ago). Other ranges use full-period %.

---

## Phase 4 & 5 — What’s working

### Phase 4 (foundation)

- **Dashboard:** portfolio value, allocation donut, holdings bar, category breakdown, risk metrics, benchmark comparison (SPY, QQQ, ARKK, BITQ).
- **Holdings table:** sort, search, category filter (button grid), weight bars, day change, **vs S&P** (1M/3M/YTD/1Y) with green/red delta.
- **Holdings detail:** hero, stats (shares, value, weight, day change), earnings next date, news, StockTwits, quick links.
- **ETF page:** $ALIN thesis, benchmark chart, strategy.
- **Data:** `portfolio.json`, Yahoo Finance quotes + history, Upstash Redis for price cache and AI cache.
- **APIs:** prices, historical (ETF), benchmarks, historical/compare (OHLC), performance/vs-benchmark, news, earnings, volatility, social (StockTwits), AI generate-thesis.

### Phase 5 (AI + charts + polish)

- **Anthony’s thesis:** `src/data/user-thesis.ts` for HOOD, IREN, GLXY, MTPLF, NVDA, AMZN, META, FIGR, ASTS, COIN, KRKNF. Rendered in **ThesisSection** with profile photo.
- **AI analysis:** `POST /api/ai/generate-thesis` (Claude 3.5 Haiku), cached in Redis `holdings:{ticker}:ai-analysis`. **AIAnalysisSection**: Generate / Regenerate, error banner with API `error` text, ReactMarkdown.
- **Holdings price chart (TradingView-style):** candlesticks, `#131722` background, `#2B2B43` grid, green/red candles. **$/%** toggle; default $ when no compare, % when compare. Compare (e.g. SPY) solid line; in $ mode on left scale. Company logo in header; period % (or $+%) in header.
- **Favicon:** `layout` `icons: { icon: '/favicon.ico', apple: '/apple-icon.png' }`; `app/apple-icon.png` from `prometheus.png`.
- **Category filters:** button grid with fixed sizing (`min-w-[140px]`, `h-10`) on holdings page.

---

## What’s not / weak spots

- **AI:** Requires `ANTHROPIC_API_KEY`. Local: `.env.local`; Vercel: Project Settings → Environment Variables, then redeploy. If missing or invalid, the UI shows the API `error`. No streaming.
- **Redis:** If Upstash is not configured, AI and price caching fall back to no persistence; AI always calls Claude.
- **OTC / international:** `MTPLF`, `KRKNF` rely on Yahoo; some symbols can have gaps or delays.
- **Left price scale:** In $ mode with compare, the compare series uses `priceScaleId: 'left'`. If the left scale does not appear, `chart.priceScale('left').applyOptions({ visible: true })` may be needed when adding that series.
- **Lint:** Some `react-hooks/set-state-in-effect`, `react-hooks/static-components`, and other rules still fire in `LayoutWrapper`, `PINModal`, `HoldingsTable` (e.g. `queueMicrotask` for `setVsLoading`), and a few other files. `SortIcon` was moved out of render in `HoldingsTable`.

---

## What could be improved

1. **AI**
   - Streaming for generate-thesis.
   - Optional system-prompt or style override (e.g. more concise, different structure).
   - Retry/backoff for rate limits and transient Anthropic errors.

2. **Charts**
   - Volume on the holdings chart (separate pane or overlay).
   - In $+compare mode, optionally normalize compare to “first point = 100” for a visual index, while keeping the $/% toggle.

3. **Data & APIs**
   - Stale-while-revalidate or background refresh for compare and vs-benchmark.
   - Request coalescing or batching for vs-benchmark when many tickers change.
   - Stronger error handling and logging for Yahoo (e.g. 429, timeouts).

4. **UX**
   - Skeleton loaders for AI and chart.
   - Clear “Comparison” vs “Single” mode in the chart (e.g. pill or badge) so $/% default is obvious.

5. **Codebase**
   - Resolve remaining lint (set-state-in-effect, static-components) in `LayoutWrapper`, `PINModal`, `HoldingsTable`, etc.
   - Shared date-range helper for historical/compare, vs-benchmark, and benchmarks to avoid duplication.

6. **Thesis**
   - `user-thesis.ts` entries for any new tickers; fallback copy when a ticker has no thesis (e.g. “Thesis not yet added”).

---

## Env

```bash
# .env.local (local) or Vercel → Project Settings → Environment Variables (production)
ANTHROPIC_API_KEY=sk-ant-...      # Required for AI analysis
ANTHROPIC_MODEL_ID=               # Optional. Default: claude-haiku-4-5-20251001
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Important paths

| Area              | Path |
|-------------------|------|
| AI thesis API     | `src/app/api/ai/generate-thesis/route.ts` |
| Compare (OHLC)    | `src/app/api/historical/compare/route.ts` |
| Vs benchmark      | `src/app/api/performance/vs-benchmark/route.ts` |
| User thesis data  | `src/data/user-thesis.ts` |
| Holdings chart    | `src/components/charts/HoldingsPriceChart.tsx` |
| AI section        | `src/components/holdings/AIAnalysisSection.tsx` |
| Thesis section    | `src/components/holdings/ThesisSection.tsx` |
| Holdings table    | `src/components/tables/HoldingsTable.tsx` |
| ETF config        | `src/data/etf-config.ts` |
| Yahoo + Redis     | `src/lib/yahoo-finance.ts`, `src/lib/redis.ts` |
