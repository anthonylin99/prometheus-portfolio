// Types for technical analysis - defined here to avoid client/server import issues
// These must match the types in @/lib/technical-analysis

export type SignalStrength = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';

export interface RSIData {
  value: number;
  signal: 'overbought' | 'neutral' | 'oversold';
  description: string;
}

export interface MACDData {
  macd: number;
  signal: number;
  histogram: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface SupportResistanceData {
  support: number;
  resistance: number;
  currentDistance: {
    toSupport: number;
    toResistance: number;
  };
  nearLevel: 'support' | 'resistance' | 'middle';
}

export interface FiftyTwoWeekData {
  high: number;
  low: number;
  current: number;
  position: number;
  signal: 'near_high' | 'near_low' | 'middle';
  description: string;
}

export interface TechnicalSignal {
  ticker: string;
  rsi: RSIData;
  macd: MACDData;
  fiftyTwoWeek: FiftyTwoWeekData;
  supportResistance: SupportResistanceData;
  overallSignal: SignalStrength;
  signalScore: number;
  calculatedAt: string;
}

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
