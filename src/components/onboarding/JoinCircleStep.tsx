'use client';

import { useState, useEffect } from 'react';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CircleAction = 'join' | 'skip' | null;

interface DefaultCircle {
  id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
}

interface JoinCircleStepProps {
  data: {
    action: CircleAction;
    inviteCode: string;
    circleName: string;
  };
  onChange: (data: {
    action: CircleAction;
    inviteCode: string;
    circleName: string;
  }) => void;
}

export function JoinCircleStep({ data, onChange }: JoinCircleStepProps) {
  const [defaultCircle, setDefaultCircle] = useState<DefaultCircle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDefault() {
      try {
        const res = await fetch('/api/circle/default');
        const json = await res.json();
        setDefaultCircle(json.circle || null);
      } catch {
        setDefaultCircle(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDefault();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-white mb-1">Join a Circle</h2>
          <p className="text-slate-400 text-sm">
            Circles let you compete with friends on portfolio performance
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1">Join a Circle</h2>
        <p className="text-slate-400 text-sm">
          Circles let you compete with friends on portfolio performance
        </p>
      </div>

      {defaultCircle ? (
        <div className="space-y-3">
          {/* Default circle card */}
          <button
            onClick={() =>
              onChange({
                ...data,
                action: 'join',
                inviteCode: defaultCircle.inviteCode,
              })
            }
            className={cn(
              'w-full flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 text-left',
              data.action === 'join'
                ? 'bg-violet-400/10 border-violet-400/40 ring-1 ring-violet-400/20'
                : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                data.action === 'join'
                  ? 'bg-violet-400 text-white'
                  : 'bg-slate-800 text-slate-400'
              )}
            >
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{defaultCircle.name}</p>
              <p className="text-slate-400 text-sm">
                {defaultCircle.memberCount} {defaultCircle.memberCount === 1 ? 'member' : 'members'}
              </p>
            </div>
            <ArrowRight className={cn(
              "w-5 h-5 transition-colors",
              data.action === 'join' ? 'text-violet-400' : 'text-slate-600'
            )} />
          </button>

          {/* Skip option */}
          <button
            onClick={() =>
              onChange({ ...data, action: 'skip', inviteCode: '' })
            }
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
              data.action === 'skip'
                ? 'bg-slate-700/30 border-slate-600/50 ring-1 ring-slate-500/20'
                : 'bg-slate-800/20 border-slate-700/20 hover:border-slate-600/40'
            )}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-300 font-medium text-sm">Skip for now</p>
              <p className="text-slate-500 text-xs">You can join a circle later</p>
            </div>
          </button>
        </div>
      ) : (
        /* No default circle — show manual join or skip */
        <div className="space-y-3">
          <button
            onClick={() => onChange({ ...data, action: 'join' })}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
              data.action === 'join'
                ? 'bg-violet-400/10 border-violet-400/40 ring-1 ring-violet-400/20'
                : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                data.action === 'join'
                  ? 'bg-violet-400 text-white'
                  : 'bg-slate-800 text-slate-400'
              )}
            >
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Join a Circle</p>
              <p className="text-slate-400 text-xs">Enter an invite code from a friend</p>
            </div>
          </button>

          <button
            onClick={() =>
              onChange({ ...data, action: 'skip', inviteCode: '' })
            }
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
              data.action === 'skip'
                ? 'bg-slate-700/30 border-slate-600/50 ring-1 ring-slate-500/20'
                : 'bg-slate-800/20 border-slate-700/20 hover:border-slate-600/40'
            )}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 text-slate-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-300 font-medium text-sm">Skip for now</p>
              <p className="text-slate-500 text-xs">You can join or create a circle later</p>
            </div>
          </button>

          {/* Manual invite code input */}
          {data.action === 'join' && (
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-slate-300">
                Invite Code
              </label>
              <input
                type="text"
                value={data.inviteCode}
                onChange={(e) =>
                  onChange({
                    ...data,
                    inviteCode: e.target.value.toUpperCase().trim(),
                  })
                }
                placeholder="e.g., A1B2C3D4"
                maxLength={8}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/25 transition-colors uppercase tracking-widest font-mono text-center text-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
