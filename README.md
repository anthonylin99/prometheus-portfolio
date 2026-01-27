# PathFinder ETF

A professional, dark-themed personal portfolio tracking website showcasing your investment thesis. Built with Next.js 14, Tailwind CSS, and Recharts.

**Philosophy & standards (all contributors & AI):** Everyone editing this repo—including AI in **Cursor** and **Claude Code**—must follow **[bible.md](./bible.md)**. It defines long-term stewardship, architecture-over-expediency, radical reliability, and the "Considerate Coworker" protocol. Project context for both editors: **[CLAUDE.md](./CLAUDE.md)**.

![PathFinder ETF](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)

## Features

- **Dashboard**: Total portfolio value, interactive allocation donut chart, holdings bar chart, category breakdown
- **Holdings Page**: Sortable/filterable table with search, category filters, and visual allocation bars
- **ETF Overview**: Investment thesis, strategy explanation, category weightings, top 10 holdings
- **Dark Theme**: Beautiful purple/blue gradient aesthetic with glassmorphism cards
- **Responsive**: Mobile-first design with collapsible sidebar navigation
- **Animations**: Smooth fade-in effects, hover states, and chart animations

## Portfolio Summary

| Category | Value | Weight |
|----------|-------|--------|
| Crypto Infrastructure | $40,700 | 29.6% |
| Fintech | $34,700 | 25.3% |
| Space & Satellite | $28,000 | 20.4% |
| AI Infrastructure | $12,100 | 8.8% |
| Digital Asset Treasury | $11,200 | 8.2% |
| Big Tech | $10,600 | 7.7% |
| **Total** | **$137,300** | **100%** |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Outfit, JetBrains Mono

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

**Local development** — create `.env.local`:

- `ANTHROPIC_API_KEY` — Required for AI Analysis (Claude). Get a key at [console.anthropic.com](https://console.anthropic.com).
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — For Redis (caching, AI analysis cache).

**Vercel (live site)** — add the same variables in **Project Settings → Environment Variables**, then redeploy. The app does not use `.env.local` in production.

## Deploy to Vercel

### Environment variables (required for AI on the live site)

For **AI Analysis** to work on the deployed site, add these in Vercel:

1. Open [vercel.com](https://vercel.com) → your project → **Settings** → **Environment Variables**
2. Add:
   - `ANTHROPIC_API_KEY` — your Claude API key from [console.anthropic.com](https://console.anthropic.com)
   - (Optional) `ANTHROPIC_MODEL_ID` — e.g. `claude-haiku-4-5-20251001`
   - (Optional) `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — for AI and price caching
3. **Redeploy** (Deployments → … → Redeploy) so the new env vars are applied.

Without `ANTHROPIC_API_KEY` on Vercel, “Generate AI Analysis” will show an error; `.env.local` is only used when running locally and is not deployed.

### Option 1: Vercel CLI

```bash
# Login to Vercel
npx vercel login

# Deploy to production
npx vercel --prod
```

### Option 2: GitHub Integration

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will auto-detect Next.js and deploy

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Dashboard
│   ├── holdings/page.tsx # Holdings table
│   ├── etf/page.tsx      # ETF overview
│   └── layout.tsx        # Root layout
├── components/
│   ├── charts/           # Donut, bar charts
│   ├── cards/            # Stat, category, holding cards
│   ├── layout/           # Sidebar, header
│   ├── tables/           # Holdings table
│   └── ui/               # Logo, badges
├── data/
│   └── portfolio.json    # Portfolio data
├── lib/
│   └── utils.ts          # Utilities
└── types/
    └── portfolio.ts      # TypeScript types
```

## Customization

### Update Holdings

Edit `src/data/portfolio.json` to update your portfolio:

```json
{
  "holdings": [
    {
      "ticker": "ASTS",
      "name": "AST SpaceMobile",
      "value": 28000,
      "category": "Space & Satellite",
      "description": "Space-based cellular broadband network"
    }
  ]
}
```

### Categories

Available categories (defined in `src/types/portfolio.ts`):
- Space & Satellite
- Crypto Infrastructure
- Fintech
- AI Infrastructure
- Digital Asset Treasury
- Big Tech

### Colors

Category colors can be customized in `src/types/portfolio.ts`:

```typescript
export const categoryColors = {
  'Space & Satellite': '#f472b6',
  'Crypto Infrastructure': '#22d3ee',
  // ...
};
```

## License

Personal project - not intended for distribution.
