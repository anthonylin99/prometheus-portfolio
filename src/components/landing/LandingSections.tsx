'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  LineChart,
  PieChart,
} from 'lucide-react';

/**
 * LandingSections - Stripe-inspired bento grid with gradient cards
 *
 * Design Philosophy:
 * - Bento grid layout with varying card sizes
 * - Each card has subtle gradient backgrounds
 * - Smooth hover animations and micro-interactions
 * - Stripe's warm purple → pink → coral color flow
 */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4' | 'gradient-5';
  className?: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, gradient, className = '', delay = 0 }: FeatureCardProps) {
  return (
    <div
      className={`bento-card ${gradient} ${className} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Icon */}
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#a1a1aa] leading-relaxed">{description}</p>

      {/* Subtle arrow on hover */}
      <div className="mt-4 flex items-center gap-2 text-[#A78BFA] opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm font-medium">Learn more</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}

function LargeFeatureCard({
  title,
  description,
  visual,
  gradient,
  className = '',
  delay = 0,
}: {
  title: string;
  description: string;
  visual: React.ReactNode;
  gradient: 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4' | 'gradient-5';
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`bento-card ${gradient} ${className} animate-fade-in-up group`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col h-full">
        {/* Visual/Illustration area */}
        <div className="flex-1 mb-6 relative min-h-[200px] rounded-xl overflow-hidden bg-white/5">
          {visual}
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-[#a1a1aa] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function LandingSections() {
  return (
    <>
      {/* Features Bento Grid Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial" />

        <div className="relative max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <span className="text-sm font-medium text-[#a1a1aa]">Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Everything you need
            </h2>
            <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto">
              Powerful tools to track, analyze, and optimize your portfolio
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large Card - Real-Time Tracking */}
            <LargeFeatureCard
              title="Real-Time Portfolio Tracking"
              description="Monitor your holdings with live price updates. See your portfolio value change in real-time throughout the trading day."
              gradient="gradient-1"
              className="lg:col-span-2 lg:row-span-2"
              delay={0}
              visual={
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full p-6">
                    {/* Animated chart preview */}
                    <div className="absolute inset-6 flex items-end justify-around gap-2">
                      {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 68].map((height, i) => (
                        <div
                          key={i}
                          className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-[#A78BFA] to-[#c026d3] opacity-60"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${i * 100}ms`,
                          }}
                        />
                      ))}
                    </div>
                    {/* Overlay glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#A78BFA]/20 to-transparent" />
                  </div>
                </div>
              }
            />

            {/* AI Analysis Card */}
            <FeatureCard
              icon={<Target className="w-6 h-6 text-[#c026d3]" />}
              title="AI Analysis"
              description="Get AI-powered investment research and thesis validation with Claude"
              gradient="gradient-2"
              delay={100}
            />

            {/* Benchmark Comparison */}
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-[#10b981]" />}
              title="Benchmark Comparison"
              description="Compare your performance against SPY, QQQ, and major indices"
              gradient="gradient-3"
              delay={200}
            />

            {/* Social Portfolio */}
            <FeatureCard
              icon={<Users className="w-6 h-6 text-[#f97316]" />}
              title="Investment Circles"
              description="Share your ETF with friends and see how your circle performs"
              gradient="gradient-5"
              delay={300}
            />

            {/* Catalyst Tracking */}
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-[#3b82f6]" />}
              title="Catalyst Tracking"
              description="Never miss an earnings report, dividend, or market-moving event"
              gradient="gradient-4"
              delay={400}
            />

            {/* Risk Metrics - Large */}
            <LargeFeatureCard
              title="Risk Analytics"
              description="Understand your portfolio's risk profile with volatility metrics, drawdown analysis, and sector concentration insights."
              gradient="gradient-2"
              className="lg:col-span-2"
              delay={500}
              visual={
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  {/* Pie chart visualization */}
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(99, 91, 255, 0.3)"
                        strokeWidth="20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#gradient1)"
                        strokeWidth="20"
                        strokeDasharray="150 251.2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#gradient2)"
                        strokeWidth="20"
                        strokeDasharray="60 251.2"
                        strokeDashoffset="-150"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#A78BFA" />
                          <stop offset="100%" stopColor="#c026d3" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">72%</div>
                        <div className="text-xs text-[#a1a1aa]">Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* About Section with Stripe-style design */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Flowing gradient background */}
        <div className="absolute inset-0 stream-right opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f]" />

        <div className="relative max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 mb-6">
                <span className="text-sm font-medium text-[#a1a1aa]">About Prometheus</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                Bringing fire to
                <span className="glow-text-stripe"> retail investors</span>
              </h2>

              <p className="text-lg text-[#a1a1aa] mb-6 leading-relaxed">
                In Greek mythology, Prometheus defied the gods to steal fire from Mount Olympus
                and gift it to humanity—giving mortals the power that was once reserved only for the divine.
              </p>

              <p className="text-lg text-[#71717a] mb-8 leading-relaxed">
                Today, the financial markets remain a modern Olympus. Prometheus ETF brings that fire
                to retail investors—democratizing access to sophisticated portfolio tracking, AI-powered
                analysis, and transparent investment methodology.
              </p>

              <Link href="/dashboard" className="btn-primary">
                Start Tracking
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Visual - Premium card with logo */}
            <div className="relative">
              <div className="gradient-card p-8">
                {/* Animated gradient background */}
                <div className="card-gradient-animated opacity-20" />

                <div className="relative z-10">
                  {/* Logo */}
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-[#A78BFA] to-[#c026d3] p-[2px]">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0a0a0f]">
                      <Image
                        src="/prometheus.png"
                        alt="Prometheus ETF"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-3xl font-bold text-white">$2M+</div>
                      <div className="text-sm text-[#71717a]">Tracked</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-3xl font-bold text-white">24/7</div>
                      <div className="text-sm text-[#71717a]">Monitoring</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-3xl font-bold text-white">AI</div>
                      <div className="text-sm text-[#71717a]">Powered</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-3xl font-bold text-[#10b981]">+18%</div>
                      <div className="text-sm text-[#71717a]">YTD</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating decoration */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#A78BFA]/30 to-transparent blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#f97316]/30 to-transparent blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready to transform your
            <br />
            <span className="glow-text-stripe">portfolio tracking?</span>
          </h2>

          <p className="text-xl text-[#a1a1aa] mb-10 max-w-2xl mx-auto">
            Join thousands of investors using Prometheus to make smarter decisions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary text-lg px-10 py-5">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
