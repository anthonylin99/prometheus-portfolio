'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  if (status === 'authenticated') {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn('resend', {
        email: email.trim(),
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError(result.error || 'Failed to send magic link. Please try again.');
      } else {
        // Check if we're in dev mode (no RESEND_API_KEY configured)
        const isDevMode = !process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.NODE_ENV === 'development';
        
        if (isDevMode) {
          // Dev mode: auto-complete the magic link flow
          // Add a delay to ensure sendVerificationRequest has run
          setTimeout(() => {
            window.location.href = '/api/auth/dev-callback';
          }, 800);
          return;
        } else {
          setSent(true);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25">
              <Image
                src="/prometheus.png"
                alt="Prometheus"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Prometheus
              </h1>
              <span className="text-xs font-medium text-violet-400 tracking-widest">
                SOCIAL ETF
              </span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl">
          {sent ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="text-slate-400 text-sm">
                We sent a magic link to{' '}
                <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-slate-500 text-xs">
                Click the link in the email to sign in. It expires in 24 hours.
              </p>
              {(!process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.NODE_ENV === 'development') && (
                <p className="text-amber-400/80 text-xs mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  Dev mode: Auto-redirecting to magic link...
                </p>
              )}
              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors mt-4"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">
                  Sign in to your portfolio
                </h2>
                <p className="text-slate-400 text-sm">
                  Enter your email to receive a magic link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/25 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Magic Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                <p className="text-slate-500 text-xs">
                  No password needed. We&apos;ll email you a secure sign-in link.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Create your own ETF and compete with friends
        </p>
      </div>
    </div>
  );
}
