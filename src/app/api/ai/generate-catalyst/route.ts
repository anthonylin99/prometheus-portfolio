import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { redis, isRedisAvailable } from '@/lib/redis';

const CACHE_KEY_PREFIX = 'holdings:';
const CACHE_KEY_SUFFIX = ':catalyst';
const CACHE_TTL_SEC = 6 * 60 * 60; // 6 hours; same catalyst text valid unless price reverses significantly

export interface CatalystResponse {
  catalystText: string;
  confidence: 'high' | 'medium' | 'low';
  generatedAt: string;
}

const DEFAULT_NO_NEWS = 'No recent news; price action appears technical';

function formatNewsForPrompt(news: { headline: string; source: string; publishedAt: string }[]): string {
  if (!news?.length) return '(No recent headlines provided)';
  return news
    .slice(0, 8)
    .map((n) => `- ${n.headline} (${n.source}, ${n.publishedAt})`)
    .join('\n');
}

export async function POST(request: NextRequest) {
  let body: {
    ticker?: string;
    priceChange?: number;
    volumeRatio?: number;
    recentNews?: { headline: string; source: string; publishedAt: string }[];
    forceRegenerate?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ticker, priceChange, volumeRatio, recentNews, forceRegenerate } = body;

  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker' }, { status: 400 });
  }

  const key = `${CACHE_KEY_PREFIX}${ticker.toUpperCase()}${CACHE_KEY_SUFFIX}`;

  // If no news in last 48h and movement > 5%, we still call Claude with a hint; if recentNews is empty, return default without calling.
  const hasNews = Array.isArray(recentNews) && recentNews.length > 0;
  if (!hasNews) {
    const out: CatalystResponse = {
      catalystText: DEFAULT_NO_NEWS,
      confidence: 'low',
      generatedAt: new Date().toISOString(),
    };
    // Optionally cache the default to avoid repeated work (short TTL)
    if (isRedisAvailable() && redis) {
      try {
        await redis.set(key, out, { ex: Math.min(CACHE_TTL_SEC, 60 * 60) });
      } catch (err) {
        console.warn(`[generate-catalyst] Redis SET (default) failed for ${key}:`, err);
      }
    }
    return NextResponse.json(out);
  }

  if (!forceRegenerate && isRedisAvailable() && redis) {
    try {
      const cached = await redis.get<CatalystResponse>(key);
      if (cached) return NextResponse.json(cached);
    } catch (err) {
      console.warn(`[generate-catalyst] Redis cache check failed for ${key}:`, err);
    }
  }

  if (forceRegenerate && isRedisAvailable() && redis) {
    try {
      await redis.del(key);
    } catch (err) {
      console.warn(`[generate-catalyst] Redis DEL failed for ${key}:`, err);
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

  const pct = priceChange != null ? priceChange : 0;
  const vol = volumeRatio != null ? volumeRatio : 1;
  const newsBlock = formatNewsForPrompt(recentNews ?? []);

  const userPrompt = `Given the following data for ${ticker}:

Price change: ${pct}%
Volume vs average: ${vol}x

Recent headlines:
${newsBlock}

In 10-15 words, state the most likely reason for this price movement. Be specific - cite the actual news item if relevant. If no clear catalyst, respond with "No significant news catalyst; movement appears technical or sector-driven."

Respond with ONLY the catalyst text, no preamble.`;

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 128,
      system: 'You respond only with the requested catalyst sentence. No quotes, no bullets, no explanation.',
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Failed to generate catalyst' }, { status: 500 });
    }

    let catalystText = content.text.trim();
    if (!catalystText) catalystText = DEFAULT_NO_NEWS;
    // Heuristic: if model echoed a long or structured answer, fallback
    if (catalystText.length > 200 || catalystText.includes('{')) {
      catalystText = DEFAULT_NO_NEWS;
    }

    const confidence: CatalystResponse['confidence'] =
      hasNews && Math.abs(pct) >= 3 && catalystText !== DEFAULT_NO_NEWS ? 'high' : hasNews ? 'medium' : 'low';

    const out: CatalystResponse = {
      catalystText,
      confidence,
      generatedAt: new Date().toISOString(),
    };

    if (isRedisAvailable() && redis) {
      try {
        await redis.set(key, out, { ex: CACHE_TTL_SEC });
      } catch (err) {
        console.warn(`[generate-catalyst] Redis SET failed for ${key}:`, err);
      }
    }

    return NextResponse.json(out);
  } catch (err) {
    console.error('AI generate-catalyst error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to generate catalyst';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
