/**
 * Technical Analysis Service
 * Calculates RSI, MACD, support/resistance, and 52-week position
 * All calculations are done from Yahoo Finance historical data
 */

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
  position: number; // 0-100, where 0 is at 52W low, 100 is at 52W high
  signal: 'near_high' | 'near_low' | 'middle';
  description: string;
}

export type SignalStrength = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';

export interface TechnicalSignal {
  ticker: string;
  rsi: RSIData;
  macd: MACDData;
  fiftyTwoWeek: FiftyTwoWeekData;
  supportResistance: SupportResistanceData;
  overallSignal: SignalStrength;
  signalScore: number; // -100 to +100
  calculatedAt: string;
}

/**
 * Calculate RSI (Relative Strength Index)
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss
 */
export function calculateRSI(prices: number[], period: number = 14): RSIData {
  if (prices.length < period + 1) {
    return { value: 50, signal: 'neutral', description: 'Insufficient data' };
  }

  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains: number[] = [];
  const losses: number[] = [];

  changes.forEach((change) => {
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  });

  // Calculate initial averages
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Calculate smoothed averages for remaining periods
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  let signal: 'overbought' | 'neutral' | 'oversold';
  let description: string;

  if (rsi >= 70) {
    signal = 'overbought';
    description = 'RSI indicates overbought conditions - potential reversal';
  } else if (rsi <= 30) {
    signal = 'oversold';
    description = 'RSI indicates oversold conditions - potential bounce';
  } else {
    signal = 'neutral';
    description = 'RSI in neutral range';
  }

  return { value: Math.round(rsi * 100) / 100, signal, description };
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * MACD Line = 12-day EMA - 26-day EMA
 * Signal Line = 9-day EMA of MACD Line
 * Histogram = MACD Line - Signal Line
 */
export function calculateMACD(prices: number[]): MACDData {
  if (prices.length < 26) {
    return {
      macd: 0,
      signal: 0,
      histogram: 0,
      trend: 'neutral',
      description: 'Insufficient data',
    };
  }

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  const macdLine = ema12.map((val, i) => val - ema26[i]).slice(26 - 12);
  const signalLine = calculateEMA(macdLine, 9);

  const latestMACD = macdLine[macdLine.length - 1];
  const latestSignal = signalLine[signalLine.length - 1];
  const histogram = latestMACD - latestSignal;

  let trend: 'bullish' | 'bearish' | 'neutral';
  let description: string;

  if (histogram > 0 && latestMACD > 0) {
    trend = 'bullish';
    description = 'MACD above signal and zero line - strong bullish momentum';
  } else if (histogram > 0) {
    trend = 'bullish';
    description = 'MACD crossing above signal - bullish momentum building';
  } else if (histogram < 0 && latestMACD < 0) {
    trend = 'bearish';
    description = 'MACD below signal and zero line - strong bearish momentum';
  } else if (histogram < 0) {
    trend = 'bearish';
    description = 'MACD crossing below signal - bearish momentum building';
  } else {
    trend = 'neutral';
    description = 'MACD showing no clear direction';
  }

  return {
    macd: Math.round(latestMACD * 100) / 100,
    signal: Math.round(latestSignal * 100) / 100,
    histogram: Math.round(histogram * 100) / 100,
    trend,
    description,
  };
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];

  // First EMA is SMA
  const sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(sma);

  for (let i = period; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[ema.length - 1] * (1 - k));
  }

  return ema;
}

/**
 * Calculate Support and Resistance levels
 * Uses local minima/maxima from recent price history
 */
export function calculateSupportResistance(
  data: { high: number; low: number; close: number }[],
  lookback: number = 20
): SupportResistanceData {
  if (data.length < lookback) {
    const current = data[data.length - 1]?.close || 0;
    return {
      support: current * 0.95,
      resistance: current * 1.05,
      currentDistance: { toSupport: 5, toResistance: 5 },
      nearLevel: 'middle',
    };
  }

  const recentData = data.slice(-lookback);
  const lows = recentData.map((d) => d.low);
  const highs = recentData.map((d) => d.high);

  // Find support as the lowest low in recent period
  const support = Math.min(...lows);
  // Find resistance as the highest high in recent period
  const resistance = Math.max(...highs);

  const current = data[data.length - 1].close;
  const range = resistance - support;

  const toSupport = ((current - support) / current) * 100;
  const toResistance = ((resistance - current) / current) * 100;

  let nearLevel: 'support' | 'resistance' | 'middle';
  if (toSupport < 3) {
    nearLevel = 'support';
  } else if (toResistance < 3) {
    nearLevel = 'resistance';
  } else {
    nearLevel = 'middle';
  }

  return {
    support: Math.round(support * 100) / 100,
    resistance: Math.round(resistance * 100) / 100,
    currentDistance: {
      toSupport: Math.round(toSupport * 100) / 100,
      toResistance: Math.round(toResistance * 100) / 100,
    },
    nearLevel,
  };
}

/**
 * Calculate 52-week position
 */
export function calculate52WeekPosition(
  current: number,
  high52w: number,
  low52w: number
): FiftyTwoWeekData {
  if (high52w === low52w) {
    return {
      high: high52w,
      low: low52w,
      current,
      position: 50,
      signal: 'middle',
      description: 'No 52-week range data',
    };
  }

  const range = high52w - low52w;
  const position = ((current - low52w) / range) * 100;

  let signal: 'near_high' | 'near_low' | 'middle';
  let description: string;

  if (position >= 90) {
    signal = 'near_high';
    description = `Trading near 52-week high - ${Math.round(((high52w - current) / current) * 100)}% below high`;
  } else if (position <= 10) {
    signal = 'near_low';
    description = `Trading near 52-week low - ${Math.round(((current - low52w) / low52w) * 100)}% above low`;
  } else {
    signal = 'middle';
    description = `Trading in middle of 52-week range`;
  }

  return {
    high: high52w,
    low: low52w,
    current,
    position: Math.round(position * 100) / 100,
    signal,
    description,
  };
}

/**
 * Calculate overall signal strength from individual indicators
 */
export function calculateOverallSignal(
  rsi: RSIData,
  macd: MACDData,
  fiftyTwoWeek: FiftyTwoWeekData
): { signal: SignalStrength; score: number } {
  let score = 0;

  // RSI contribution (-30 to +30)
  if (rsi.signal === 'oversold') {
    score += 25; // Potential buy
  } else if (rsi.signal === 'overbought') {
    score -= 25; // Potential sell
  }

  // MACD contribution (-30 to +30)
  if (macd.trend === 'bullish') {
    score += 30;
  } else if (macd.trend === 'bearish') {
    score -= 30;
  }

  // 52-week position contribution (-20 to +20)
  if (fiftyTwoWeek.signal === 'near_low') {
    score += 15; // Value opportunity
  } else if (fiftyTwoWeek.signal === 'near_high') {
    score -= 10; // Extended, but momentum could continue
  }

  // Convert score to signal
  let signal: SignalStrength;
  if (score >= 40) {
    signal = 'strong_buy';
  } else if (score >= 15) {
    signal = 'buy';
  } else if (score <= -40) {
    signal = 'strong_sell';
  } else if (score <= -15) {
    signal = 'sell';
  } else {
    signal = 'hold';
  }

  return { signal, score };
}

/**
 * Generate complete technical analysis for a stock
 */
export function generateTechnicalSignal(
  ticker: string,
  historicalData: { high: number; low: number; close: number }[],
  fiftyTwoWeekHigh: number,
  fiftyTwoWeekLow: number
): TechnicalSignal {
  const closes = historicalData.map((d) => d.close);
  const currentPrice = closes[closes.length - 1];

  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const supportResistance = calculateSupportResistance(historicalData);
  const fiftyTwoWeek = calculate52WeekPosition(
    currentPrice,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow
  );

  const { signal, score } = calculateOverallSignal(rsi, macd, fiftyTwoWeek);

  return {
    ticker,
    rsi,
    macd,
    fiftyTwoWeek,
    supportResistance,
    overallSignal: signal,
    signalScore: score,
    calculatedAt: new Date().toISOString(),
  };
}
