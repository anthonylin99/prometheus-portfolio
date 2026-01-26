'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Rocket } from 'lucide-react';
import Image from 'next/image';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { NameETFStep } from '@/components/onboarding/NameETFStep';
import { AddHoldingsStep } from '@/components/onboarding/AddHoldingsStep';
import { JoinCircleStep } from '@/components/onboarding/JoinCircleStep';
import { Category } from '@/types/portfolio';

interface HoldingEntry {
  ticker: string;
  name: string;
  shares: number;
  costBasis?: number;
  category: Category;
  logoDomain?: string;
}

type CircleAction = 'join' | 'skip' | null;

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 data
  const [nameData, setNameData] = useState({
    displayName: '',
    etfTicker: '',
    etfName: '',
    avatarColor: '#8b5cf6',
  });

  // Step 2 data
  const [holdings, setHoldings] = useState<HoldingEntry[]>([]);

  // Step 3 data
  const [circleData, setCircleData] = useState<{
    action: CircleAction;
    inviteCode: string;
    circleName: string;
  }>({
    action: null,
    inviteCode: '',
    circleName: '',
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const canProceedStep1 =
    nameData.displayName.trim().length > 0 &&
    nameData.etfTicker.length >= 2 &&
    nameData.etfName.trim().length > 0;

  const canProceedStep2 = holdings.length >= 1;

  const handleFinish = async () => {
    if (!session?.user?.id) return;

    setSaving(true);
    setError(null);

    try {
      // 1. Create/update user profile
      const profileRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameData.displayName.trim(),
          etfTicker: nameData.etfTicker,
          etfName: nameData.etfName.trim(),
          avatarColor: nameData.avatarColor,
        }),
      });

      // If profile doesn't exist yet, we need to handle the 404 by creating
      if (profileRes.status === 404) {
        // Profile not found - the user-service will be called via the onboarding API
      }

      // 2. Save portfolio
      const portfolioHoldings = holdings.map((h) => ({
        ticker: h.ticker,
        name: h.name,
        shares: h.shares,
        costBasis: h.costBasis,
        category: h.category,
        description: '',
        logoDomain: h.logoDomain,
        addedAt: new Date().toISOString(),
      }));

      await fetch('/api/user/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings: portfolioHoldings }),
      });

      // 3. Handle circle
      if (circleData.action === 'join' && circleData.inviteCode) {
        const joinRes = await fetch('/api/circle/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode: circleData.inviteCode }),
        });
        const joinData = await joinRes.json();
        if (!joinRes.ok) {
          setError(joinData.error || 'Failed to join circle');
          setSaving(false);
          return;
        }
      }

      // 4. Mark user as onboarded
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarded: true } as Record<string, unknown>),
      });

      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25">
              <Image
                src="/prometheus.png"
                alt="Prometheus"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Set up your portfolio
            </h1>
          </div>
        </div>

        {/* Progress */}
        <StepIndicator
          currentStep={step}
          totalSteps={3}
          labels={['Name', 'Holdings', 'Circle']}
        />

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl">
          {step === 1 && (
            <NameETFStep data={nameData} onChange={setNameData} />
          )}
          {step === 2 && (
            <AddHoldingsStep holdings={holdings} onChange={setHoldings} />
          )}
          {step === 3 && (
            <JoinCircleStep data={circleData} onChange={setCircleData} />
          )}

          {error && (
            <p className="text-red-400 text-sm text-center mt-4">{error}</p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
            {step > 1 ? (
              <button
                onClick={() => {
                  setStep(step - 1);
                  setError(null);
                }}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => {
                  setStep(step + 1);
                  setError(null);
                }}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 text-sm"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/25 text-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Launch Portfolio
                    <Rocket className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
