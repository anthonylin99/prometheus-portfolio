'use client';

import { useActivityFeed } from '@/lib/hooks';
import { ActivityItem } from './ActivityItem';
import { Loader2, Activity } from 'lucide-react';

export function ActivityFeed() {
  const { events, loading } = useActivityFeed(30);

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-bold text-white">Activity</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">
          No activity yet. Changes will appear here.
        </p>
      ) : (
        <div className="divide-y divide-slate-800/50 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
