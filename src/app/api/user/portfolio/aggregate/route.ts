import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPortfolioWithPrices } from '@/lib/user-portfolio-service';
import { getPortfolioWithPrices } from '@/lib/portfolio-service';
import { aggregatePortfolios } from '@/lib/portfolio-aggregation-service';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sourcesParam = searchParams.get('sources') || 'personal';
  const sources = sourcesParam.split(',') as Array<'personal' | 'public'>;

  try {
    const portfolioPromises: Promise<{
      holdings: Parameters<typeof aggregatePortfolios>[0][0]['holdings'];
      summary: Parameters<typeof aggregatePortfolios>[0][0]['summary'];
      source: string;
    }>[] = [];

    if (sources.includes('personal')) {
      portfolioPromises.push(
        getUserPortfolioWithPrices(session.user.id).then((p) => ({
          holdings: p.holdings,
          summary: p.summary,
          source: 'personal',
        }))
      );
    }

    if (sources.includes('public')) {
      portfolioPromises.push(
        getPortfolioWithPrices().then((p) => ({
          holdings: p.holdings,
          summary: p.summary,
          source: 'public',
        }))
      );
    }

    const portfolios = await Promise.all(portfolioPromises);
    const aggregated = aggregatePortfolios(portfolios);

    return NextResponse.json(aggregated);
  } catch (error) {
    console.error('Portfolio aggregation error:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate portfolios' },
      { status: 500 }
    );
  }
}
