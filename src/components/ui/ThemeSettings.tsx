'use client';

import { useState } from 'react';
import { useTheme, AccentColor } from '@/lib/theme-context';
import { Settings, X, Sparkles, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ThemeSettings - Premium theme customization modal
 *
 * Design Philosophy:
 * - Stripe-inspired accent color options
 * - Glassmorphism modal design
 * - Smooth animations and transitions
 */

const accentOptions: { id: AccentColor; name: string; color: string }[] = [
  { id: 'stripe', name: 'Stripe', color: '#A78BFA' },
  { id: 'violet', name: 'Violet', color: '#8b5cf6' },
  { id: 'blue', name: 'Blue', color: '#3b82f6' },
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'amber', name: 'Amber', color: '#f59e0b' },
  { id: 'rose', name: 'Rose', color: '#ec4899' },
];

export function ThemeSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { accent, showBitcoinRain, setAccent, toggleBitcoinRain } = useTheme();

  return (
    <>
      {/* Settings Button - Stripe-style */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-xl flex items-center justify-center text-[#a1a1aa] hover:text-white transition-all shadow-lg border border-[#A78BFA]/20 hover:border-[#A78BFA]/50 bg-[#0f0f16]/90 backdrop-blur-sm hover:scale-105"
        title="Theme Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="gradient-card relative w-full max-w-sm animate-scale-in">
            <div className="card-gradient-animated opacity-10" />

            <div className="relative z-10 p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-[#52525b] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#A78BFA]" />
                Theme Settings
              </h2>

              {/* Accent Color */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[#a1a1aa] mb-3 block">
                  Accent Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {accentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setAccent(option.id)}
                      className={cn(
                        'w-10 h-10 rounded-xl transition-all hover:scale-110',
                        accent === option.id &&
                          'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f] scale-110'
                      )}
                      style={{ backgroundColor: option.color }}
                      title={option.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#52525b] mt-2">
                  Selected: {accentOptions.find((o) => o.id === accent)?.name}
                </p>
              </div>

              {/* Bitcoin Rain Toggle */}
              <div className="mb-4">
                <label className="text-sm font-medium text-[#a1a1aa] mb-3 block">
                  Effects
                </label>
                <button
                  onClick={toggleBitcoinRain}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all',
                    showBitcoinRain
                      ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                      : 'bg-white/5 text-[#71717a] border border-white/10 hover:text-white hover:border-white/20'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Bitcoin Snow
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      showBitcoinRain
                        ? 'bg-[#f59e0b]/20'
                        : 'bg-white/10'
                    )}
                  >
                    {showBitcoinRain ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              <p className="text-xs text-[#52525b] text-center mt-6">
                Settings are saved locally in your browser
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
