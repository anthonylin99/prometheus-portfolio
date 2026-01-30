'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * ThemeProvider - Stripe-inspired theme system
 *
 * Design Philosophy:
 * - Single dark theme optimized for financial data
 * - Stripe's purple as the primary accent
 * - Smooth transitions between accent colors
 */

export type AccentColor = 'stripe' | 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';

interface ThemeSettings {
  accent: AccentColor;
  showBitcoinRain: boolean;
}

interface ThemeContextType extends ThemeSettings {
  setAccent: (accent: AccentColor) => void;
  toggleBitcoinRain: () => void;
}

const defaultSettings: ThemeSettings = {
  accent: 'stripe', // Default to Stripe purple
  showBitcoinRain: true,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// Stripe-inspired accent colors
const accentColors: Record<AccentColor, { primary: string; secondary: string; glow: string }> = {
  stripe: { primary: '#A78BFA', secondary: '#C4B5FD', glow: 'rgba(167, 139, 250, 0.2)' },
  violet: { primary: '#8b5cf6', secondary: '#a855f7', glow: 'rgba(139, 92, 246, 0.2)' },
  blue: { primary: '#3b82f6', secondary: '#6366f1', glow: 'rgba(59, 130, 246, 0.2)' },
  emerald: { primary: '#10b981', secondary: '#34d399', glow: 'rgba(16, 185, 129, 0.2)' },
  amber: { primary: '#f59e0b', secondary: '#fbbf24', glow: 'rgba(245, 158, 11, 0.2)' },
  rose: { primary: '#ec4899', secondary: '#f472b6', glow: 'rgba(236, 72, 153, 0.2)' },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prometheus-theme');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration: convert old 'violet' default to 'stripe'
        const accent = parsed.accent === 'cyan' ? 'stripe' : (parsed.accent || defaultSettings.accent);
        setSettings({
          accent,
          showBitcoinRain: parsed.showBitcoinRain ?? defaultSettings.showBitcoinRain,
        });
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const colors = accentColors[settings.accent];

    // Always dark mode
    root.classList.remove('light');
    root.classList.add('dark');

    // Stripe-inspired theme colors
    root.style.setProperty('--bg-primary', '#0a0a0f');
    root.style.setProperty('--bg-secondary', '#0f0f16');
    root.style.setProperty('--bg-tertiary', '#15151f');
    root.style.setProperty('--bg-elevated', '#1a1a26');
    root.style.setProperty('--bg-card', 'rgba(20, 20, 30, 0.6)');
    root.style.setProperty('--bg-card-hover', 'rgba(30, 30, 45, 0.8)');

    // Text colors
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#a1a1aa');
    root.style.setProperty('--text-muted', '#71717a');
    root.style.setProperty('--text-subtle', '#52525b');

    // Borders
    root.style.setProperty('--border-primary', `rgba(${hexToRgb(colors.primary)}, 0.15)`);
    root.style.setProperty('--border-secondary', 'rgba(113, 113, 122, 0.15)');
    root.style.setProperty('--card-border', `rgba(${hexToRgb(colors.primary)}, 0.15)`);
    root.style.setProperty('--card-border-hover', `rgba(${hexToRgb(colors.primary)}, 0.35)`);

    // Accent colors - dynamic based on selection
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-secondary', colors.secondary);
    root.style.setProperty('--accent-glow', colors.glow);
    root.style.setProperty('--gradient-glow', `radial-gradient(ellipse at 50% 0%, ${colors.glow} 0%, transparent 60%)`);

    // Stripe gradient colors (always the same for consistency)
    root.style.setProperty('--stripe-purple', '#A78BFA');
    root.style.setProperty('--stripe-violet', '#C4B5FD');
    root.style.setProperty('--stripe-fuchsia', '#c026d3');
    root.style.setProperty('--stripe-pink', '#ec4899');
    root.style.setProperty('--stripe-coral', '#f97316');
    root.style.setProperty('--stripe-amber', '#fbbf24');

    // Save to localStorage
    localStorage.setItem('prometheus-theme', JSON.stringify(settings));
  }, [settings, mounted]);

  const setAccent = (accent: AccentColor) => setSettings((s) => ({ ...s, accent }));
  const toggleBitcoinRain = () => setSettings((s) => ({ ...s, showBitcoinRain: !s.showBitcoinRain }));

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        ...settings,
        setAccent,
        toggleBitcoinRain,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper to convert hex to RGB for rgba() usage
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '99, 91, 255'; // Default to Stripe purple
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
