import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Holding, Category, CategoryData, categoryColors } from '@/types/portfolio';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
}

export function calculatePortfolioTotal(holdings: Holding[]): number {
  return holdings.reduce((sum, holding) => sum + holding.value, 0);
}

export function calculateCategoryData(holdings: Holding[]): CategoryData[] {
  const total = calculatePortfolioTotal(holdings);
  const categoryMap = new Map<Category, { value: number; holdings: Holding[] }>();

  holdings.forEach((holding) => {
    const existing = categoryMap.get(holding.category) || { value: 0, holdings: [] };
    existing.value += holding.value;
    existing.holdings.push(holding);
    categoryMap.set(holding.category, existing);
  });

  return Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      value: data.value,
      percentage: (data.value / total) * 100,
      color: categoryColors[name],
      holdings: data.holdings.sort((a, b) => b.value - a.value),
    }))
    .sort((a, b) => b.value - a.value);
}

export function getTopHoldings(holdings: Holding[], count: number = 5): Holding[] {
  return [...holdings].sort((a, b) => b.value - a.value).slice(0, count);
}

export function getLogoUrl(ticker: string): string {
  // Use Clearbit for common companies, fallback to placeholder
  const domainMap: Record<string, string> = {
    ASTS: 'ast-science.com',
    IREN: 'irisenergy.co',
    HOOD: 'robinhood.com',
    GLXY: 'galaxy.com',
    MTPLF: 'metaplanet.jp',
    AMZN: 'amazon.com',
    FIGR: 'figure.com',
    META: 'meta.com',
    NVDA: 'nvidia.com',
    COIN: 'coinbase.com',
    KRKNF: 'kraken.com',
  };

  const domain = domainMap[ticker];
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }
  return '';
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
