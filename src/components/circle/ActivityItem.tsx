'use client';

import { getRelativeTime } from '@/lib/utils';
import { Plus, Minus, UserPlus, Briefcase } from 'lucide-react';

interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  etfTicker: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

interface ActivityItemProps {
  event: ActivityEvent;
}

function getIcon(type: string) {
  switch (type) {
    case 'HOLDING_ADDED':
      return <Plus className="w-3.5 h-3.5 text-emerald-400" />;
    case 'HOLDING_REMOVED':
      return <Minus className="w-3.5 h-3.5 text-red-400" />;
    case 'MEMBER_JOINED':
      return <UserPlus className="w-3.5 h-3.5 text-violet-400" />;
    case 'PORTFOLIO_CREATED':
      return <Briefcase className="w-3.5 h-3.5 text-cyan-400" />;
    default:
      return <Plus className="w-3.5 h-3.5 text-slate-400" />;
  }
}

function getDescription(event: ActivityEvent): string {
  const ticker = event.payload?.ticker as string | undefined;

  switch (event.type) {
    case 'HOLDING_ADDED':
      return `added ${ticker || 'a holding'} to their portfolio`;
    case 'HOLDING_REMOVED':
      return `removed ${ticker || 'a holding'} from their portfolio`;
    case 'MEMBER_JOINED':
      return 'joined the circle';
    case 'PORTFOLIO_CREATED':
      return 'created their portfolio';
    default:
      return 'made a change';
  }
}

export function ActivityItem({ event }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        {getIcon(event.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300">
          <span className="font-medium text-white">{event.userName}</span>{' '}
          {getDescription(event)}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {getRelativeTime(event.timestamp)}
        </p>
      </div>
    </div>
  );
}
