import { SignalStrength, TechnicalSignal } from '@/lib/technical-analysis';

export type { SignalStrength } from '@/lib/technical-analysis';

export type AlertPriority = 'high' | 'medium' | 'low';
export type AlertType =
  | 'near_resistance'
  | 'near_support'
  | 'oversold'
  | 'overbought'
  | 'bullish_momentum'
  | 'bearish_momentum'
  | 'near_52w_high'
  | 'near_52w_low'
  | 'earnings_upcoming';

export interface Alert {
  type: AlertType;
  ticker: string;
  message: string;
  priority: AlertPriority;
  actionHint?: string;
}

export type OpportunityType =
  | 'dip_buy'
  | 'take_profit'
  | 'rebalance'
  | 'momentum_entry';

export interface Opportunity {
  type: OpportunityType;
  tickers: string[];
  rationale: string;
  priority: AlertPriority;
}

export interface PortfolioHealthBreakdown {
  diversification: number;   // 0-100: category spread
  momentum: number;          // 0-100: average signal strength
  riskBalance: number;       // 0-100: not too overbought/oversold
}

export interface PortfolioHealth {
  score: number;             // 0-100 overall health score
  breakdown: PortfolioHealthBreakdown;
  assessment: 'excellent' | 'good' | 'fair' | 'needs_attention';
  summary: string;
}

export interface PortfolioInsights {
  signals: TechnicalSignal[];
  alerts: Alert[];
  opportunities: Opportunity[];
  health: PortfolioHealth;
  calculatedAt: string;
}

export interface InsightsResponse {
  insights: PortfolioInsights;
  holdingsCount: number;
  signalsGenerated: number;
}
