export type Category =
  | 'Space & Satellite'
  | 'Crypto Infrastructure'
  | 'Fintech'
  | 'AI Infrastructure'
  | 'Digital Asset Treasury'
  | 'Big Tech';

export interface Holding {
  ticker: string;
  name: string;
  value: number;
  category: Category;
  description: string;
  shares?: number;
  costBasis?: number;
  currentPrice?: number;
}

export interface CategoryData {
  name: Category;
  value: number;
  percentage: number;
  color: string;
  holdings: Holding[];
}

export interface PortfolioSummary {
  totalValue: number;
  holdingsCount: number;
  categoriesCount: number;
  topHolding: Holding;
  lastUpdated: string;
}

export const categoryColors: Record<Category, string> = {
  'Space & Satellite': '#f472b6',
  'Crypto Infrastructure': '#22d3ee',
  'Fintech': '#a78bfa',
  'AI Infrastructure': '#34d399',
  'Digital Asset Treasury': '#fbbf24',
  'Big Tech': '#60a5fa',
};

export const categoryGradients: Record<Category, string> = {
  'Space & Satellite': 'from-pink-500 to-rose-400',
  'Crypto Infrastructure': 'from-cyan-400 to-teal-500',
  'Fintech': 'from-violet-400 to-purple-500',
  'AI Infrastructure': 'from-emerald-400 to-green-500',
  'Digital Asset Treasury': 'from-amber-400 to-yellow-500',
  'Big Tech': 'from-blue-400 to-indigo-500',
};
