import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { redis, isRedisAvailable } from '@/lib/redis';

const CACHE_KEY_PREFIX = 'holdings:';
const CACHE_KEY_SUFFIX = ':ai-analysis';

export async function POST(request: NextRequest) {
  let body: { ticker?: string; companyName?: string; existingAnalysis?: string; userMessage?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  try {
    const { ticker, companyName, existingAnalysis, userMessage } = body;

    if (!ticker || !companyName || !existingAnalysis || !userMessage?.trim()) {
      return NextResponse.json(
        { error: 'Missing ticker, companyName, existingAnalysis, or userMessage' },
        { status: 400 }
      );
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

    const message = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: `You are an elite equity research analyst. The user has an existing research report and wants to refine it with a follow-up.

TASK: Integrate their feedback into the report. Output the COMPLETE revised report in the same markdown structure (## 1. Fundamental Analysis, ## 2. Thesis Validation, ## 3. Sector & Macro View, ## 4. Catalyst Watch, ## 5. Investment Summary). 
- If they ask to "factor in" something: add or adjust the relevant section.
- If they ask "what are the risks of X": expand the risks/thesis validation.
- If they ask for more detail on a topic: add a short subsection or bullets.
- Preserve sections they don't mention. Only output the revised markdown; no preamble.`,
      messages: [
        {
          role: 'user',
          content: `Follow-up: ${userMessage.trim()}

---

Current report for ${ticker} (${companyName}):

${existingAnalysis}

---

Deliver the full revised report.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Failed to refine analysis' }, { status: 500 });
    }

    const analysis = content.text;

    const key = `${CACHE_KEY_PREFIX}${ticker.toUpperCase()}${CACHE_KEY_SUFFIX}`;
    if (isRedisAvailable() && redis) {
      try {
        await redis.set(key, analysis);
      } catch (err) {
        console.warn(`[refine-thesis] Redis SET failed for ${key}:`, err);
      }
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('AI refine-thesis error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to refine analysis';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
