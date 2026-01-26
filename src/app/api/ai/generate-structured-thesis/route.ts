import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { redis, isRedisAvailable } from '@/lib/redis';

const CACHE_KEY_PREFIX = 'holdings:';
const CACHE_KEY_SUFFIX = ':structured-thesis';
const CACHE_TTL_SEC = 24 * 60 * 60; // 24 hours

export interface StructuredThesisResponse {
  thesis: {
    bullCase: string[];
    bearCase: string[];
    valuation: string[];
    catalysts: string[];
  };
  oneLinerSummary: string;
  generatedAt: string;
}

function parseStructuredThesis(raw: string): StructuredThesisResponse | null {
  const trimmed = raw.trim();
  // Allow wrapped in ```json ... ``` or raw JSON
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, trimmed];
  const jsonStr = (jsonMatch[1] ?? jsonMatch[0] ?? trimmed).trim();
  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!parsed || typeof parsed !== 'object' || !('thesis' in parsed)) return null;
    const t = (parsed as { thesis?: unknown }).thesis;
    if (!t || typeof t !== 'object') return null;
    const thesis = t as Record<string, unknown>;
    const bullCase = Array.isArray(thesis.bullCase) ? thesis.bullCase.filter((x): x is string => typeof x === 'string') : [];
    const bearCase = Array.isArray(thesis.bearCase) ? thesis.bearCase.filter((x): x is string => typeof x === 'string') : [];
    const valuation = Array.isArray(thesis.valuation) ? thesis.valuation.filter((x): x is string => typeof x === 'string') : [];
    const catalysts = Array.isArray(thesis.catalysts) ? thesis.catalysts.filter((x): x is string => typeof x === 'string') : [];
    const o = parsed as Record<string, unknown>;
    const oneLinerSummary = typeof o?.oneLinerSummary === 'string' ? o.oneLinerSummary : '';
    return {
      thesis: { bullCase, bearCase, valuation, catalysts },
      oneLinerSummary,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker' }, { status: 400 });
  }
  const key = `${CACHE_KEY_PREFIX}${ticker.toUpperCase()}${CACHE_KEY_SUFFIX}`;
  if (isRedisAvailable() && redis) {
    try {
      const cached = await redis.get<StructuredThesisResponse>(key);
      return NextResponse.json(cached ? { ...cached } : { thesis: null, oneLinerSummary: null, generatedAt: null });
    } catch {
      return NextResponse.json({ thesis: null, oneLinerSummary: null, generatedAt: null });
    }
  }
  return NextResponse.json({ thesis: null, oneLinerSummary: null, generatedAt: null });
}

export async function POST(request: NextRequest) {
  let body: {
    ticker?: string;
    companyName?: string;
    currentPrice?: number;
    marketCap?: string;
    dayChange?: number;
    yearToDateChange?: number;
    forceRegenerate?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ticker, companyName, currentPrice, marketCap, dayChange, yearToDateChange, forceRegenerate } = body;

  if (!ticker || !companyName) {
    return NextResponse.json({ error: 'Missing ticker or companyName' }, { status: 400 });
  }

  const key = `${CACHE_KEY_PREFIX}${ticker.toUpperCase()}${CACHE_KEY_SUFFIX}`;

  if (!forceRegenerate && isRedisAvailable() && redis) {
    try {
      const cached = await redis.get<StructuredThesisResponse>(key);
      if (cached) return NextResponse.json(cached);
    } catch {
      // continue to generate
    }
  }

  if (forceRegenerate && isRedisAvailable() && redis) {
    try {
      await redis.del(key);
    } catch {
      // non-fatal
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
  const model = process.env.ANTHROPIC_STRUCTURED_MODEL_ID || process.env.ANTHROPIC_MODEL_ID || 'claude-haiku-4-5-20251001';

  const price = currentPrice != null ? `$${currentPrice}` : 'N/A';
  const cap = marketCap ?? 'N/A';
  const day = dayChange != null ? `${dayChange}%` : 'N/A';
  const ytd = yearToDateChange != null ? `${yearToDateChange}%` : 'N/A';

  const userPrompt = `Analyze ${ticker} (${companyName}) for a retail investor's portfolio tracker.

Current price: ${price}
Market cap: ${cap}
Day change: ${day}
YTD: ${ytd}

Return a JSON object with this exact structure:
{
  "thesis": {
    "bullCase": [3 specific reasons to be bullish],
    "bearCase": [3 specific risks or bear arguments],
    "valuation": [2 points on current valuation - cheap/expensive relative to what],
    "catalysts": [3 upcoming events or catalysts with approximate dates if known]
  },
  "oneLinerSummary": "One sentence summarizing the current investment case"
}

Be specific. Use actual numbers, dates, and company-specific details. No generic statements like 'strong management team' without specifics.`;

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: `You are a senior equity research analyst. Provide concise, actionable analysis. Each bullet point should be 1-2 sentences max. Be specific with numbers and dates when possible. Avoid generic statements.

Respond with ONLY a valid JSON object. No markdown, no code fences, no commentary.`,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Failed to generate structured thesis' }, { status: 500 });
    }

    const parsed = parseStructuredThesis(content.text);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Malformed JSON in model response; could not parse thesis' },
        { status: 500 }
      );
    }

    if (isRedisAvailable() && redis) {
      try {
        await redis.set(key, parsed, { ex: CACHE_TTL_SEC });
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('AI generate-structured-thesis error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to generate structured thesis';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
