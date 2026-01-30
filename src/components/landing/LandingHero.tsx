'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * LandingHero - Stripe-inspired hero section with flowing gradient orbs
 *
 * Design Philosophy:
 * - Flowing gradient orbs that stream from purple to pink to coral/orange
 * - Clean, premium typography with gradient text
 * - Subtle animations that bring the page to life
 * - Robinhood-style call to action
 */
export function LandingHero() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.15);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col pt-8">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative flex-1 flex items-center justify-center min-h-[800px] h-screen overflow-hidden"
      >
        {/* Stripe-style Flowing Gradient Background */}
        <div className="hero-gradient">
          {/* Primary Purple Orb - Top Right */}
          <div
            className="gradient-orb gradient-orb-1"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${scrollY + mousePosition.y * 0.5}px)`,
            }}
          />
          {/* Fuchsia/Pink Orb - Center Right */}
          <div
            className="gradient-orb gradient-orb-2"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${scrollY * 0.8 + mousePosition.y * 0.3}px)`,
            }}
          />
          {/* Coral/Orange Orb - Bottom Right */}
          <div
            className="gradient-orb gradient-orb-3"
            style={{
              transform: `translate(${mousePosition.x * 0.2}px, ${scrollY * 0.6 + mousePosition.y * 0.2}px)`,
            }}
          />

          {/* Stream to the right effect - subtle horizontal glow */}
          <div className="stream-right absolute inset-0 opacity-30" />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/95 via-[#0a0a0f]/80 to-transparent z-[1]" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <span className="text-sm font-medium text-[#a1a1aa]">
                AI-Powered Portfolio Intelligence
              </span>
            </div>

            {/* Main Heading with Gradient Text */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100">
              <span className="text-white">Portfolio tracking</span>
              <br />
              <span className="glow-text-stripe">built for the future.</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-[#a1a1aa] max-w-2xl leading-relaxed mb-10 animate-fade-in-up delay-200">
              The modern portfolio tracker bringing fire to your finances.
              AI analysis, real-time data, and insights that help you make better decisions.
            </p>

            {/* CTA Buttons - Stripe style */}
            <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-300">
              <Link
                href="/dashboard"
                className="btn-primary text-lg px-8 py-4"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/explore"
                className="btn-secondary text-lg px-8 py-4"
              >
                Explore Collections
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-white/10 animate-fade-in-up delay-400">
              <p className="text-sm text-[#71717a] mb-4">Trusted by investors tracking</p>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-white">$2M+</div>
                  <div className="text-sm text-[#71717a]">Portfolio Value</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-[#71717a]">Holdings Tracked</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-white">Real-time</div>
                  <div className="text-sm text-[#71717a]">Market Data</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-fade-in-up delay-500">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-[#71717a]">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-[#A78BFA]/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 rounded-full bg-[#A78BFA] animate-bounce" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
