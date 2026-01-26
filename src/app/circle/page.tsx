'use client';

import { useState } from 'react';
import { useCircle, useAuth } from '@/lib/hooks';
import { Leaderboard } from '@/components/circle/Leaderboard';
import { ActivityFeed } from '@/components/circle/ActivityFeed';
import { InviteCard } from '@/components/circle/InviteCard';
import { Users, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CirclePage() {
  const { circle, loading } = useCircle();
  const { user } = useAuth();
  const [mode, setMode] = useState<'join' | 'create' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [circleName, setCircleName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/circle/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to join circle');
        return;
      }
      // Reload the page to show the circle
      window.location.reload();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!circleName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: circleName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create circle');
        return;
      }
      window.location.reload();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  // No circle — show join/create options
  if (!circle) {
    return (
      <div className="p-6 lg:p-8 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Circle</h1>
          <p className="text-slate-400 text-sm">
            Compete with friends on portfolio performance
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Join or Create a Circle
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Circles let you see how your portfolio performs against friends.
              Only percentages are shared — never dollar amounts.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setMode('join')}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                  mode === 'join'
                    ? 'bg-violet-500/10 border-violet-500/40'
                    : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    mode === 'join'
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  )}
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    Join with Invite Code
                  </p>
                  <p className="text-slate-400 text-xs">
                    Enter a code from a friend
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMode('create')}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                  mode === 'create'
                    ? 'bg-violet-500/10 border-violet-500/40'
                    : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    mode === 'create'
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  )}
                >
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    Create a New Circle
                  </p>
                  <p className="text-slate-400 text-xs">
                    Start your own group
                  </p>
                </div>
              </button>
            </div>

            {mode === 'join' && (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) =>
                    setInviteCode(e.target.value.toUpperCase().trim())
                  }
                  placeholder="Enter invite code"
                  maxLength={8}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-center uppercase tracking-widest font-mono"
                />
                <button
                  onClick={handleJoin}
                  disabled={submitting || !inviteCode.trim()}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Join Circle'
                  )}
                </button>
              </div>
            )}

            {mode === 'create' && (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  placeholder="Circle name"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                />
                <button
                  onClick={handleCreate}
                  disabled={submitting || !circleName.trim()}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Create Circle'
                  )}
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm mt-3">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Has circle — show leaderboard + activity
  const isOwner = circle.ownerId === user?.id;

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">{circle.name}</h1>
        <p className="text-slate-400 text-sm">
          {circle.members.length} member{circle.members.length !== 1 ? 's' : ''}{' '}
          · Performance shown as percentages only
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard - 2/3 width */}
        <div className="lg:col-span-2">
          <Leaderboard />
        </div>

        {/* Sidebar: Invite + Activity - 1/3 width */}
        <div className="space-y-6">
          {isOwner && (
            <InviteCard
              inviteCode={circle.inviteCode}
              circleName={circle.name}
            />
          )}
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
