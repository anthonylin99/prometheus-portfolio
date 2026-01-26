import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { redis, isRedisAvailable } from '@/lib/redis';

const CACHE_KEY_PREFIX = 'holdings:';
const CACHE_KEY_SUFFIX = ':ai-analysis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker' }, { status: 400 });
  }
  const key = `${CACHE_KEY_PREFIX}${ticker.toUpperCase()}${CACHE_KEY_SUFFIX}`;
  if (isRedisAvailable() && redis) {
    try {
      const cached = await redis.get<string>(key);
      return NextResponse.json({ analysis: cached ?? null });
    } catch {
      return NextResponse.json({ analysis: null });
    }
  }
  return NextResponse.json({ analysis: null });
}

export async function POST(request: NextRequest) {
  let body: { ticker?: string; companyName?: string; userThesis?: string; priceTarget?: string; catalysts?: string; risks?: string; forceRegenerate?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  try {
    const { ticker, companyName, userThesis, priceTarget, catalysts, risks, forceRegenerate } = body;

    if (!ticker || !companyName) {
      return NextResponse.json({ error: 'Missing ticker or companyName' }, { status: 400 });
    }

    const key = `${CACHE_KEY_PREFIX}${ticker.toUpperCase()}${CACHE_KEY_SUFFIX}`;

    // Return cached if available and not forcing regenerate
    if (!forceRegenerate && isRedisAvailable() && redis) {
      try {
        const cached = await redis.get<string>(key);
        if (cached) return NextResponse.json({ analysis: cached });
      } catch {
        // continue to generate
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        {
          error:
            'ANTHROPIC_API_KEY is not set. Local: add to .env.local. Vercel: Project Settings → Environment Variables, add ANTHROPIC_API_KEY, then redeploy.',
        },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL_ID || 'claude-haiku-4-5-20251001';

    const extra =
      [userThesis, priceTarget, catalysts, risks].filter(Boolean).length > 0
        ? `\n\nAdditional context from the portfolio owner (you may use to inform your analysis):\n- Thesis: ${userThesis || '—'}\n- Price target: ${priceTarget || '—'}\n- Catalysts: ${catalysts || '—'}\n- Risks: ${risks || '—'}`
        : '';

    const message = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: `ROLE: Act as an elite equity research analyst at a top-tier investment fund. Analyze the company using fundamental and macroeconomic perspectives. Do NOT invent specific numbers unless from reasoning; if data isn't available, say so. Do not explain your process—deliver the analysis only.

Use the following structure. Use markdown, bullet points where appropriate. Be concise, professional, and insight-driven.

## 1. Fundamental Analysis
- Revenue growth, gross & net margin trends, free cash flow
- Valuation vs sector peers (P/E, EV/EBITDA, etc.)
- Insider ownership and recent insider trades

## 2. Thesis Validation
- 3 arguments supporting the thesis
- 2 counter-arguments or key risks
- **Verdict**: Bullish / Bearish / Neutral with justification

## 3. Sector & Macro View
- Short sector overview
- Relevant macroeconomic trends
- Company's competitive positioning

## 4. Catalyst Watch
- Upcoming events (earnings, product launches, regulation, etc.)
- **Short-term** and **long-term** catalysts

## 5. Investment Summary
- 5-bullet investment thesis summary
- **Recommendation**: Buy / Hold / Sell
- Confidence: High / Medium / Low
- Expected timeframe (e.g. 6–12 months)`,
      messages: [
        {
          role: 'user',
          content: `Stock Ticker / Company Name: ${ticker} / ${companyName}

Investment Thesis / Goal: What is fair value? Long-term drivers and tailwinds?${extra}

Deliver the full equity research report in the required structure.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
    }

    const analysis = content.text;

    if (isRedisAvailable() && redis) {
      try {
        await redis.set(key, analysis);
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('AI generate-thesis error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate analysis';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
