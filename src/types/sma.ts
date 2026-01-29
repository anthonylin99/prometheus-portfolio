// SMA types - safe for client-side import (no server dependencies)

export type SMAPeriod = 20 | 50 | 100 | 200;

export const SMA_PERIODS: SMAPeriod[] = [20, 50, 100, 200];

export interface SMAData {
  ticker: string;
  name?: string;
  currentPrice: number;
  sma: number;
  deviation: number; // percentage deviation from SMA (negative = below SMA)
}

export interface SMAResult {
  data: SMAData[];
  period: SMAPeriod;
  calculatedAt: string;
}
