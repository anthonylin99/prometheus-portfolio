import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Holding, HoldingWithPrice, Category, CategoryData, getCategoryColor } from '@/types/portfolio';

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

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatPercentagePrecise(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
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

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function calculatePortfolioTotal(holdings: (Holding | HoldingWithPrice)[]): number {
  return holdings.reduce((sum, holding) => {
    if ('value' in holding && holding.value) {
      return sum + holding.value;
    }
    return sum;
  }, 0);
}

export function calculateCategoryData(holdings: HoldingWithPrice[]): CategoryData[] {
  const total = calculatePortfolioTotal(holdings);
  const categoryMap = new Map<Category, { value: number; holdings: HoldingWithPrice[] }>();

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
      color: getCategoryColor(name),
      holdings: data.holdings.sort((a, b) => b.value - a.value),
    }))
    .sort((a, b) => b.value - a.value);
}

export function getTopHoldings(holdings: HoldingWithPrice[], count: number = 5): HoldingWithPrice[] {
  return [...holdings].sort((a, b) => b.value - a.value).slice(0, count);
}

/**
 * Extract the bare domain from a URL string (strips www., protocol, path).
 */
export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    // If not a valid URL, try stripping common prefixes
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

/**
 * Get logo URL for a ticker. Uses a hardcoded domain map for known tickers,
 * then falls back to an optional domain parameter for dynamic resolution.
 */
/**
 * Comprehensive ticker → company domain mapping for logo resolution.
 * Covers portfolio holdings + all ~100 unique tickers across 18 collections.
 */
const TICKER_DOMAIN_MAP: Record<string, string> = {
  // ── Portfolio holdings ────────────────────────────────────
  ASTS: 'ast-science.com',
  IREN: 'irisenergy.co',
  HOOD: 'robinhood.com',
  GLXY: 'galaxy.com',
  MTPLF: 'metaplanet.jp',
  FIGR: 'figure.com',
  KRKNF: 'krakenrobotics.com',

  // ── Magnificent Seven ─────────────────────────────────────
  AAPL: 'apple.com',
  MSFT: 'microsoft.com',
  GOOGL: 'google.com',
  AMZN: 'amazon.com',
  NVDA: 'nvidia.com',
  META: 'meta.com',
  TSLA: 'tesla.com',

  // ── Dividend Aristocrats ──────────────────────────────────
  JNJ: 'jnj.com',
  PG: 'pg.com',
  KO: 'coca-cola.com',
  PEP: 'pepsico.com',
  MMM: '3m.com',
  ABT: 'abbott.com',
  WMT: 'walmart.com',
  MCD: 'mcdonalds.com',

  // ── Quality Compounders ───────────────────────────────────
  V: 'visa.com',
  MA: 'mastercard.com',
  COST: 'costco.com',
  UNH: 'unitedhealthgroup.com',
  ISRG: 'intuitive.com',
  TMO: 'thermofisher.com',
  ADBE: 'adobe.com',

  // ── AI Infrastructure / Semiconductors ────────────────────
  AMD: 'amd.com',
  AVGO: 'broadcom.com',
  MRVL: 'marvell.com',
  TSM: 'tsmc.com',
  ASML: 'asml.com',
  ANET: 'arista.com',
  SMCI: 'supermicro.com',

  // ── Cloud Hyperscalers / SaaS ─────────────────────────────
  CRM: 'salesforce.com',
  SNOW: 'snowflake.com',
  NET: 'cloudflare.com',
  DDOG: 'datadoghq.com',
  MDB: 'mongodb.com',

  // ── Picks & Shovels / Data Centers ────────────────────────
  DELL: 'dell.com',
  VRT: 'vertiv.com',
  EQIX: 'equinix.com',
  DLR: 'digitalrealty.com',
  AME: 'ametek.com',

  // ── Nuclear Renaissance ───────────────────────────────────
  CCJ: 'cameco.com',
  CEG: 'constellationenergy.com',
  VST: 'vistraenergy.com',
  SMR: 'nuscalepower.com',
  NNE: 'nanonuclearenergy.com',
  LEU: 'centrusenergy.com',
  UEC: 'uraniumenergy.com',

  // ── Energy Transition ─────────────────────────────────────
  FSLR: 'firstsolar.com',
  ENPH: 'enphase.com',
  NEE: 'nexteraenergy.com',
  AES: 'aes.com',
  BEP: 'brookfieldrenewable.com',
  PLUG: 'plugpower.com',

  // ── Commodities Supercycle ────────────────────────────────
  FCX: 'fcx.com',
  NEM: 'newmont.com',
  BHP: 'bhp.com',
  RIO: 'riotinto.com',
  VALE: 'vale.com',
  MP: 'mpmaterials.com',

  // ── Bitcoin Treasury / Crypto ─────────────────────────────
  MSTR: 'microstrategy.com',
  COIN: 'coinbase.com',
  MARA: 'mara.com',
  CLSK: 'cleanspark.com',
  RIOT: 'riotplatforms.com',

  // ── DeFi & Fintech ────────────────────────────────────────
  SQ: 'squareup.com',
  PYPL: 'paypal.com',
  AFRM: 'affirm.com',
  SOFI: 'sofi.com',
  NU: 'nubank.com.br',
  TOST: 'toasttab.com',
  BILL: 'bill.com',

  // ── Real Assets & REITs ───────────────────────────────────
  AMT: 'americantower.com',
  PLD: 'prologis.com',
  O: 'realtyincome.com',
  SPG: 'simon.com',
  CCI: 'crowncastle.com',
  VICI: 'vfreit.com',

  // ── Space Economy ─────────────────────────────────────────
  RKLB: 'rocketlabusa.com',
  BA: 'boeing.com',
  LMT: 'lockheedmartin.com',
  AXON: 'axon.com',
  PLTR: 'palantir.com',

  // ── Defense Dominance ─────────────────────────────────────
  RTX: 'rtx.com',
  NOC: 'northropgrumman.com',
  GD: 'gd.com',
  LHX: 'l3harris.com',
  HII: 'huntingtoningalls.com',
  KTOS: 'kratosdefense.com',

  // ── Longevity & Biotech ───────────────────────────────────
  ABBV: 'abbvie.com',
  REGN: 'regeneron.com',
  VRTX: 'vrtx.com',
  MRNA: 'modernatx.com',
  ILMN: 'illumina.com',
  CRSP: 'crisprtx.com',
  BEAM: 'beamtx.com',

  // ── Robotics & Automation ─────────────────────────────────
  ROK: 'rockwellautomation.com',
  ABB: 'abb.com',
  FANUY: 'fanuc.co.jp',
  TER: 'teradyne.com',
  IRBT: 'irobot.com',

  // ── Cybersecurity Shield ──────────────────────────────────
  CRWD: 'crowdstrike.com',
  PANW: 'paloaltonetworks.com',
  ZS: 'zscaler.com',
  FTNT: 'fortinet.com',
  S: 'sentinelone.com',
  CYBR: 'cyberark.com',
};

export function getLogoUrl(ticker: string, domain?: string): string {
  const resolved = TICKER_DOMAIN_MAP[ticker.toUpperCase()] || domain;
  if (resolved) {
    return `https://img.logo.dev/${resolved}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`;
  }
  return '';
}

/**
 * Generate a consistent color from a ticker string (fallback when no logo).
 */
export function getTickerColor(ticker: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e',
  ];
  const hash = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
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

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(dateString);
}
