// Color palette for multi-stock chart comparison
export const CHART_COLORS = [
  '#5C7CFA', // Primary blue
  '#FF6B6B', // Red
  '#51CF66', // Green
  '#FCC419', // Yellow
  '#845EF7', // Purple
  '#22B8CF', // Teal
  '#FF922B', // Orange
  '#F06595', // Pink
  '#20C997', // Cyan
  '#748FFC', // Light blue
];

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// Popular tickers for quick comparison
export const POPULAR_COMPARISONS = [
  { ticker: 'SPY', label: 'S&P 500' },
  { ticker: 'QQQ', label: 'Nasdaq' },
  { ticker: 'DIA', label: 'Dow Jones' },
  { ticker: 'IWM', label: 'Russell 2000' },
  { ticker: 'VTI', label: 'Total Market' },
];
