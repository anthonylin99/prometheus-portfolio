import { DEFAULT_CATEGORIES } from '@/types/portfolio';

/**
 * Keyword → category mapping (checked against industry string, case-insensitive).
 * Order matters: first match wins.
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
 * 1. Check industry keywords → thematic category
 * 2. If Yahoo sector already exists in existingCategories → reuse it
 * 3. If sector is generic, try to build a more descriptive name from industry
 * 4. Fall back to Yahoo sector directly (e.g. "Healthcare", "Energy")
 */
export function resolveCategory(
  sector: string | undefined,
  industry: string | undefined,
  existingCategories: string[] = []
): string {
  // 1. Check industry keyword matches
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

  // Also check DEFAULT_CATEGORIES
  if (sector && DEFAULT_CATEGORIES.includes(sector)) {
    return sector;
  }

  // 3. For generic sectors, try to derive from industry
  const genericSectors = ['Technology', 'Financial Services', 'Communication Services', 'Industrials'];
  if (sector && genericSectors.includes(sector) && industry) {
    // Create a more descriptive category from industry
    const descriptive = prettifyIndustry(industry);
    if (descriptive) return descriptive;
  }

  // 4. Fall back to Yahoo sector as-is
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
