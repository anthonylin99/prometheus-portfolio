import {
  HoldingWithPrice,
  PortfolioSummary,
  CategoryData,
  getCategoryColor,
} from '@/types/portfolio';

export interface AggregatedPortfolio {
  holdings: HoldingWithPrice[];
  summary: PortfolioSummary;
  categories: CategoryData[];
  sources: string[];
}

/**
 * Aggregate multiple portfolios into a combined view.
 * Holdings with the same ticker are merged (shares combined).
 */
export function aggregatePortfolios(
  portfolios: Array<{
    holdings: HoldingWithPrice[];
    summary: PortfolioSummary;
    source: string;
  }>
): AggregatedPortfolio {
  if (portfolios.length === 0) {
    return {
      holdings: [],
      summary: {
        totalValue: 0,
        previousValue: 0,
        dayChange: 0,
        dayChangePercent: 0,
        holdingsCount: 0,
        categoriesCount: 0,
        lastUpdated: new Date().toISOString(),
      },
      categories: [],
      sources: [],
    };
  }

  if (portfolios.length === 1) {
    const p = portfolios[0];
    return {
      holdings: p.holdings,
      summary: p.summary,
      categories: buildCategories(p.holdings, p.summary.totalValue),
      sources: [p.source],
    };
  }

  // Merge holdings by ticker
  const holdingsMap = new Map<string, HoldingWithPrice>();

  for (const portfolio of portfolios) {
    for (const holding of portfolio.holdings) {
      const existing = holdingsMap.get(holding.ticker);
      if (existing) {
        // Merge: add shares and values
        const combinedShares = existing.shares + holding.shares;
        const combinedValue = existing.value + holding.value;

        holdingsMap.set(holding.ticker, {
          ...existing,
          shares: combinedShares,
          value: combinedValue,
          // Recalculate day change for combined position
          dayChange: existing.dayChange + holding.dayChange,
          // Keep the same price and percent (they're the same for same ticker)
          weight: 0, // Will be recalculated
        });
      } else {
        holdingsMap.set(holding.ticker, { ...holding, weight: 0 });
      }
    }
  }

  // Convert to array and calculate totals
  const holdings = Array.from(holdingsMap.values());
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const previousValue = holdings.reduce(
    (sum, h) => sum + (h.value - h.dayChange),
    0
  );
  const dayChange = totalValue - previousValue;
  const dayChangePercent = previousValue > 0 ? (dayChange / previousValue) * 100 : 0;

  // Recalculate weights
  for (const holding of holdings) {
    holding.weight = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
  }

  // Sort by value descending
  holdings.sort((a, b) => b.value - a.value);

  // Build categories
  const categories = buildCategories(holdings, totalValue);

  // Find the most recent lastUpdated
  const lastUpdated = portfolios.reduce((latest, p) => {
    const pDate = new Date(p.summary.lastUpdated);
    return pDate > new Date(latest) ? p.summary.lastUpdated : latest;
  }, portfolios[0].summary.lastUpdated);

  return {
    holdings,
    summary: {
      totalValue,
      previousValue,
      dayChange,
      dayChangePercent,
      holdingsCount: holdings.length,
      categoriesCount: categories.length,
      lastUpdated,
    },
    categories,
    sources: portfolios.map((p) => p.source),
  };
}

function buildCategories(
  holdings: HoldingWithPrice[],
  totalValue: number
): CategoryData[] {
  const categoryMap = new Map<string, CategoryData>();

  for (const holding of holdings) {
    const existing = categoryMap.get(holding.category);
    if (existing) {
      existing.value += holding.value;
      existing.holdings.push(holding);
    } else {
      categoryMap.set(holding.category, {
        name: holding.category,
        value: holding.value,
        percentage: 0,
        color: getCategoryColor(holding.category),
        holdings: [holding],
      });
    }
  }

  // Calculate percentages and sort
  const categories = Array.from(categoryMap.values());
  for (const cat of categories) {
    cat.percentage = totalValue > 0 ? (cat.value / totalValue) * 100 : 0;
  }
  categories.sort((a, b) => b.value - a.value);

  return categories;
}
