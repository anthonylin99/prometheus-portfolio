import { DEFAULT_CATEGORIES, GICS_SECTORS, THEMATIC_CATEGORIES } from '@/types/portfolio';

/**
 * Map Yahoo Finance sector names to GICS standard sectors.
 * Yahoo uses different naming conventions than Bloomberg GICS.
 */
const YAHOO_TO_GICS: Record<string, string> = {
  // Direct mappings (Yahoo → GICS)
  'Technology': 'Information Technology',
  'Financial Services': 'Financials',
  'Healthcare': 'Health Care',
  'Consumer Cyclical': 'Consumer Discretionary',
  'Consumer Defensive': 'Consumer Staples',
  'Basic Materials': 'Materials',
  // These match directly
  'Energy': 'Energy',
  'Industrials': 'Industrials',
  'Communication Services': 'Communication Services',
  'Utilities': 'Utilities',
  'Real Estate': 'Real Estate',
};

/**
 * Keyword → category mapping (checked against industry string, case-insensitive).
 * Order matters: first match wins. Thematic categories take priority.
 */
const INDUSTRY_KEYWORDS: [RegExp, string][] = [
  [/crypto|bitcoin|blockchain|digital.?currency|digital.?asset/i, 'Crypto Infrastructure'],
  [/satellite|space|aerospace/i, 'Space & Satellite'],
  [/defense|military|robotics/i, 'Defense Tech'],
  [/\bAI\b|semiconductor|GPU|chip|neural/i, 'AI Infrastructure'],
  [/fintech|payment|broker|exchange|trading/i, 'Fintech'],
  [/social.?media|internet.?content|cloud|software.?infra/i, 'Big Tech'],
  [/treasury|digital.?asset.?treasury/i, 'Digital Asset Treasury'],
];

/**
 * Resolve a category from Yahoo Finance sector + industry.
 *
 * Priority order:
 * 1. Check industry keywords → thematic category (crypto, space, defense, AI, etc.)
 * 2. If Yahoo sector already exists in existingCategories → reuse it
 * 3. Map Yahoo sector → GICS sector (never return "Other" for valid sectors)
 * 4. For Technology/Financial Services, try descriptive name from industry
 * 5. Fall back to GICS sector
 */
export function resolveCategory(
  sector: string | undefined,
  industry: string | undefined,
  existingCategories: string[] = []
): string {
  // 1. Check industry keyword matches → thematic category
  if (industry) {
    for (const [pattern, category] of INDUSTRY_KEYWORDS) {
      if (pattern.test(industry)) {
        return category;
      }
    }
  }

  // 2. Check if Yahoo sector matches an existing category
  if (sector && existingCategories.includes(sector)) {
    return sector;
  }

  // Also check if sector is already a thematic or GICS category
  if (sector && THEMATIC_CATEGORIES.includes(sector)) {
    return sector;
  }
  if (sector && GICS_SECTORS.includes(sector)) {
    return sector;
  }

  // 3. Map Yahoo sector → GICS sector
  if (sector && YAHOO_TO_GICS[sector]) {
    const gicsSector = YAHOO_TO_GICS[sector];

    // 4. For generic tech/financial sectors, try descriptive name from industry first
    const genericSectors = ['Technology', 'Financial Services', 'Communication Services'];
    if (genericSectors.includes(sector) && industry) {
      const descriptive = prettifyIndustry(industry);
      if (descriptive) return descriptive;
    }

    // Return the GICS sector
    return gicsSector;
  }

  // 5. Try to derive from industry if sector unknown
  if (industry) {
    const descriptive = prettifyIndustry(industry);
    if (descriptive) return descriptive;
  }

  // 6. Fall back to Yahoo sector as-is if it's a valid string
  if (sector) return sector;

  // Ultimate fallback
  return 'Other';
}

/**
 * Attempt to turn a Yahoo Finance industry string into a nicer category name.
 */
function prettifyIndustry(industry: string): string | null {
  const lower = industry.toLowerCase();

  if (lower.includes('software')) return 'Software';
  if (lower.includes('internet') && lower.includes('retail')) return 'E-Commerce';
  if (lower.includes('internet')) return 'Internet Services';
  if (lower.includes('semiconductor')) return 'Semiconductors';
  if (lower.includes('consumer electronics')) return 'Consumer Electronics';
  if (lower.includes('biotech')) return 'Biotech';
  if (lower.includes('bank')) return 'Banking';
  if (lower.includes('insurance')) return 'Insurance';
  if (lower.includes('real estate')) return 'Real Estate';
  if (lower.includes('entertainment')) return 'Entertainment';
  if (lower.includes('telecom')) return 'Telecom';
  if (lower.includes('auto')) return 'Auto & EV';
  if (lower.includes('oil') || lower.includes('gas') || lower.includes('energy')) return 'Energy';
  if (lower.includes('mining')) return 'Mining';
  if (lower.includes('pharma') || lower.includes('drug')) return 'Pharma';
  if (lower.includes('medical')) return 'Medical Devices';
  if (lower.includes('solar') || lower.includes('renewable')) return 'Clean Energy';

  return null;
}
