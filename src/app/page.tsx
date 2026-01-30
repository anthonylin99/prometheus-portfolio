'use client';

import { TickerTape } from '@/components/landing/TickerTape';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingSections } from '@/components/landing/LandingSections';

/**
 * HomePage - Stripe-inspired landing with flowing gradients
 *
 * Design Philosophy:
 * - Premium feel with flowing gradient orbs (purple → pink → coral)
 * - Clean typography and generous whitespace
 * - Subtle animations that bring the page to life
 * - Robinhood-style data presentation
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Stripe-style flowing gradient background */}
      <div className="stripe-gradient-bg" />

      {/* Content */}
      <div className="relative z-10">
        <TickerTape />
        <LandingNav />
        <LandingHero />
        <LandingSections />
      </div>
    </div>
  );
}
