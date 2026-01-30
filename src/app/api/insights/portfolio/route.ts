import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPortfolio } from '@/lib/user-portfolio-service';
import { getHistoricalData, getQuoteForMetrics } from '@/lib/yahoo-finance';
import { generateTechnicalSignal } from '@/lib/technical-analysis';
import type {
  TechnicalSignal,
  Alert,
  Opportunity,
  PortfolioHealth,
  PortfolioInsights,
  AlertType,
  AlertPriority,
} from '@/types/insights';

function getHealthAssessment(score: number): { assessment: PortfolioHealth['assessment']; summary: string } {
  if (score >= 75) {
    return { assessment: 'excellent', summary: 'Portfolio showing strong technicals with good diversification' };
  }
  if (score >= 55) {
    return { assessment: 'good', summary: 'Portfolio in good shape with some areas to monitor' };
  }
  if (score >= 35) {
    return { assessment: 'fair', summary: 'Portfolio has some concerning signals - review recommended' };
  }
  return { assessment: 'needs_attention', summary: 'Multiple holdings showing warning signals - review positions' };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const portfolio = await getUserPortfolio(session.user.id);
    const tickers = portfolio.holdings.map(h => h.ticker);

    if (tickers.length === 0) {
      return NextResponse.json({
        insights: {
          signals: [],
          alerts: [],
          opportunities: [],
          health: {
            score: 0,
            breakdown: { diversification: 0, momentum: 0, riskBalance: 0 },
            assessment: 'needs_attention',
            summary: 'Add holdings to get portfolio insights',
          },
          calculatedAt: new Date().toISOString(),
        },
        holdingsCount: 0,
        signalsGenerated: 0,
      });
    }

    // Fetch data for all holdings (limit to 10 for performance)
    const holdingsToAnalyze = tickers.slice(0, 10);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Reduced from 6 months to 3 for performance

    // Helper: timeout wrapper for a promise
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), ms)
        ),
      ]);
    };

    // Concurrency limiter: process max 3 tickers at a time
    const CONCURRENCY_LIMIT = 3;
    const TIMEOUT_MS = 8000;
    const signalResults: (TechnicalSignal | null)[] = [];

    for (let i = 0; i < holdingsToAnalyze.length; i += CONCURRENCY_LIMIT) {
      const batch = holdingsToAnalyze.slice(i, i + CONCURRENCY_LIMIT);
      const batchPromises = batch.map(async (ticker): Promise<TechnicalSignal | null> => {
        try {
          const [historicalData, quoteData] = await withTimeout(
            Promise.all([
              getHistoricalData(ticker, startDate, endDate),
              getQuoteForMetrics(ticker),
            ]),
            TIMEOUT_MS
          );

          if (historicalData.length < 26) {
            return null;
          }

          // Null checks for Math.max/min on empty arrays
          const highs = historicalData.map(d => d.high);
          const lows = historicalData.map(d => d.low);
          const fiftyTwoWeekHigh = quoteData?.fiftyTwoWeekHigh || (highs.length > 0 ? Math.max(...highs) : 0);
          const fiftyTwoWeekLow = quoteData?.fiftyTwoWeekLow || (lows.length > 0 ? Math.min(...lows) : 0);

          return generateTechnicalSignal(
            ticker,
            historicalData.map(d => ({ high: d.high, low: d.low, close: d.close })),
            fiftyTwoWeekHigh,
            fiftyTwoWeekLow
          );
        } catch (err) {
          console.warn(`Failed to analyze ${ticker}:`, err);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      signalResults.push(...batchResults);
    }
    const signals: TechnicalSignal[] = signalResults.filter((s): s is TechnicalSignal => s !== null);

    // Generate alerts from signals
    const alerts: Alert[] = [];
    for (const signal of signals) {
      // RSI alerts
      if (signal.rsi.signal === 'oversold') {
        alerts.push({
          type: 'oversold' as AlertType,
          ticker: signal.ticker,
          message: `${signal.ticker} RSI at ${signal.rsi.value.toFixed(0)} - potential entry opportunity`,
          priority: 'medium' as AlertPriority,
          actionHint: 'Consider adding to position',
        });
      } else if (signal.rsi.signal === 'overbought') {
        alerts.push({
          type: 'overbought' as AlertType,
          ticker: signal.ticker,
          message: `${signal.ticker} RSI at ${signal.rsi.value.toFixed(0)} - extended, consider taking profits`,
          priority: 'medium' as AlertPriority,
          actionHint: 'Consider trimming position',
        });
      }

      // Support/Resistance alerts
      if (signal.supportResistance.nearLevel === 'resistance') {
        alerts.push({
          type: 'near_resistance' as AlertType,
          ticker: signal.ticker,
          message: `${signal.ticker} near resistance at $${signal.supportResistance.resistance.toFixed(2)}`,
          priority: 'low' as AlertPriority,
          actionHint: 'Watch for breakout or reversal',
        });
      } else if (signal.supportResistance.nearLevel === 'support') {
        alerts.push({
          type: 'near_support' as AlertType,
          ticker: signal.ticker,
          message: `${signal.ticker} testing support at $${signal.supportResistance.support.toFixed(2)}`,
          priority: 'medium' as AlertPriority,
          actionHint: 'Potential bounce opportunity',
        });
      }

      // 52-week alerts
      if (signal.fiftyTwoWeek.signal === 'near_high') {
        alerts.push({
          type: 'near_52w_high' as AlertType,
          ticker: signal.ticker,
          message: `${signal.ticker} trading near 52-week high`,
          priority: 'low' as AlertPriority,
        });
      } else if (signal.fiftyTwoWeek.signal === 'near_low') {
        alerts.push({
          type: 'near_52w_low' as AlertType,
          ticker: signal.ticker,
          message: `${signal.ticker} trading near 52-week low - potential value play`,
          priority: 'high' as AlertPriority,
          actionHint: 'Research fundamentals before adding',
        });
      }
    }

    // Sort alerts by priority
    const priorityOrder: Record<AlertPriority, number> = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Generate opportunities
    const opportunities: Opportunity[] = [];

    // Find dip buy opportunities (oversold with bullish MACD)
    const dipCandidates = signals.filter(
      s => s.rsi.signal === 'oversold' || s.fiftyTwoWeek.position < 30
    );
    if (dipCandidates.length > 0) {
      opportunities.push({
        type: 'dip_buy',
        tickers: dipCandidates.map(s => s.ticker),
        rationale: `${dipCandidates.length} holding(s) showing oversold conditions or near 52-week lows`,
        priority: 'medium',
      });
    }

    // Find take profit opportunities
    const extendedPositions = signals.filter(
      s => s.rsi.signal === 'overbought' && s.fiftyTwoWeek.position > 80
    );
    if (extendedPositions.length > 0) {
      opportunities.push({
        type: 'take_profit',
        tickers: extendedPositions.map(s => s.ticker),
        rationale: `${extendedPositions.length} holding(s) overbought and near 52-week highs`,
        priority: 'medium',
      });
    }

    // Calculate portfolio health
    const categories = new Set(portfolio.holdings.map(h => h.category));
    const diversification = Math.min(100, (categories.size / Math.max(5, portfolio.holdings.length)) * 100);

    const avgSignalScore = signals.length > 0
      ? signals.reduce((sum, s) => sum + s.signalScore, 0) / signals.length
      : 0;
    const momentum = Math.max(0, Math.min(100, 50 + avgSignalScore));

    const oversoldCount = signals.filter(s => s.rsi.signal === 'oversold').length;
    const overboughtCount = signals.filter(s => s.rsi.signal === 'overbought').length;
    const riskBalance = 100 - (Math.abs(oversoldCount - overboughtCount) / Math.max(1, signals.length)) * 50;

    const healthScore = Math.round((diversification * 0.3 + momentum * 0.4 + riskBalance * 0.3));

    const { assessment, summary } = getHealthAssessment(healthScore);

    const health: PortfolioHealth = {
      score: healthScore,
      breakdown: {
        diversification: Math.round(diversification),
        momentum: Math.round(momentum),
        riskBalance: Math.round(riskBalance),
      },
      assessment,
      summary,
    };

    const insights: PortfolioInsights = {
      signals,
      alerts: alerts.slice(0, 10), // Limit to top 10 alerts
      opportunities,
      health,
      calculatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      insights,
      holdingsCount: tickers.length,
      signalsGenerated: signals.length,
    });
  } catch (error) {
    console.error('Portfolio insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio insights' },
      { status: 500 }
    );
  }
}
