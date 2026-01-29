import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addUserHolding } from '@/lib/user-portfolio-service';
import { getAppUser } from '@/lib/user-service';
import { logActivity } from '@/lib/circle-service';
import { resolveCategory } from '@/lib/category-mapping';
import YahooFinance from 'yahoo-finance2';
import { getYahooTicker } from '@/lib/yahoo-finance';

const yahooFinance = new YahooFinance();

interface BatchAddRequest {
  tickers: string[];
  shares?: number; // Default shares per stock (default: 1)
}

interface TickerInfo {
  name: string;
  sector?: string;
  industry?: string;
}

async function getTickerInfo(ticker: string): Promise<TickerInfo> {
  try {
    const yahooTicker = getYahooTicker(ticker);
    const [quoteRes, summaryRes] = await Promise.all([
      yahooFinance.quote(yahooTicker),
      yahooFinance.quoteSummary(yahooTicker, {
        modules: ['summaryProfile'],
      }).catch(() => null),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = quoteRes as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prof = (summaryRes as any)?.summaryProfile;

    return {
      name: q?.longName || q?.shortName || ticker,
      sector: prof?.sector,
      industry: prof?.industry,
    };
  } catch {
    return { name: ticker };
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: BatchAddRequest = await request.json();
    const { tickers, shares = 1 } = body;

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: 'tickers array is required' },
        { status: 400 }
      );
    }

    // Normalize tickers
    const normalizedTickers = tickers.map((t) => t.toUpperCase().trim());

    const results: { ticker: string; success: boolean; error?: string }[] = [];

    for (const ticker of normalizedTickers) {
      try {
        const info = await getTickerInfo(ticker);
        const category = resolveCategory(info.sector, info.industry, []);

        await addUserHolding(session.user.id, {
          ticker,
          name: info.name,
          shares,
          category,
          description: info.industry || '',
          logoDomain: undefined,
          addedAt: new Date().toISOString(),
        });

        results.push({ ticker, success: true });
      } catch (err) {
        results.push({
          ticker,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Log activity if user is in a circle
    const user = await getAppUser(session.user.id);
    if (user?.circleId) {
      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        await logActivity(user.circleId, {
          userId: session.user.id,
          userName: user.name || user.email,
          etfTicker: user.etfTicker,
          type: 'HOLDING_ADDED',
          payload: {
            count: successCount,
            tickers: results.filter((r) => r.success).map((r) => r.ticker),
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      added: successCount,
      failed: failCount,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
