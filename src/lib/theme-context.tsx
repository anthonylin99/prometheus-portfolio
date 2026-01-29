'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AccentColor = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';

interface ThemeSettings {
  accent: AccentColor;
  showBitcoinRain: boolean;
}

interface ThemeContextType extends ThemeSettings {
  setAccent: (accent: AccentColor) => void;
  toggleBitcoinRain: () => void;
}

const defaultSettings: ThemeSettings = {
  accent: 'violet',
  showBitcoinRain: true,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// Lavender theme accent colors (Yankee Candle Lavender)
const accentColors: Record<AccentColor, { primary: string; secondary: string; glow: string }> = {
  violet: { primary: '#9b8ac4', secondary: '#7c6baa', glow: 'rgba(155, 138, 196, 0.15)' }, // Lavender (default)
  blue: { primary: '#a8c4d9', secondary: '#7c9bb8', glow: 'rgba(168, 196, 217, 0.15)' },
  emerald: { primary: '#7bc4a8', secondary: '#5aa888', glow: 'rgba(123, 196, 168, 0.15)' },
  amber: { primary: '#d9c4a8', secondary: '#c4a87c', glow: 'rgba(217, 196, 168, 0.15)' },
  rose: { primary: '#c4a8b8', secondary: '#a87c94', glow: 'rgba(196, 168, 184, 0.15)' },
  cyan: { primary: '#a8d9d9', secondary: '#7cb8b8', glow: 'rgba(168, 217, 217, 0.15)' },
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
        setSettings({ 
          accent: parsed.accent || defaultSettings.accent,
          showBitcoinRain: parsed.showBitcoinRain ?? defaultSettings.showBitcoinRain,
        });
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  // Apply theme to document - always dark mode
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const colors = accentColors[settings.accent];

    // Always dark mode
    root.classList.remove('light');
    root.classList.add('dark');

    // Yankee Candle Lavender theme colors - deeper purple tones
    root.style.setProperty('--bg-primary', '#0d0a14');
    root.style.setProperty('--bg-secondary', '#110e1a');
    root.style.setProperty('--bg-tertiary', '#16122a');
    root.style.setProperty('--bg-card', 'rgba(18, 14, 30, 0.7)');
    root.style.setProperty('--bg-card-hover', 'rgba(25, 20, 42, 0.85)');
    root.style.setProperty('--text-primary', '#f5f3fa');
    root.style.setProperty('--text-secondary', '#a8a0b8');
    root.style.setProperty('--text-muted', '#706880');
    root.style.setProperty('--border-primary', `rgba(155, 138, 196, 0.2)`);
    root.style.setProperty('--border-secondary', 'rgba(112, 104, 128, 0.2)');

    // Accent colors
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-secondary', colors.secondary);
    root.style.setProperty('--gradient-glow', `radial-gradient(ellipse at 50% 0%, ${colors.glow} 0%, transparent 60%)`);

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
