'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortfolioViewing } from '@/lib/portfolio-context';

interface CircleMember {
  userId: string;
  name: string;
  etfTicker: string;
  etfName: string;
  avatarColor: string;
  isCurrentUser: boolean;
}

export function PortfolioSwitcher() {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { viewing, switchToUser, switchToSelf } = usePortfolioViewing();

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch('/api/circle/portfolios');
        if (!res.ok) {
          setMembers([]);
          return;
        }
        const data = await res.json();
        setMembers(data.members || []);
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render if no circle or only one member (yourself)
  if (loading || members.length <= 1) {
    return null;
  }

  const currentMember = members.find(m => m.isCurrentUser);
  const activeTicker = viewing ? viewing.etfTicker : currentMember?.etfTicker || '';
  const activeName = viewing ? viewing.name : currentMember?.name || '';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
          "bg-slate-800/60 border border-slate-700/40 hover:border-violet-500/40",
          viewing ? "text-violet-300" : "text-slate-300"
        )}
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: viewing
              ? viewing.avatarColor
              : currentMember?.avatarColor || '#8b5cf6',
          }}
        />
        <span className="font-mono">${activeTicker}</span>
        {viewing && (
          <span className="text-slate-500 text-xs">({activeName})</span>
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-slate-700/40">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Circle Members
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {members.map((member) => {
              const isActive = member.isCurrentUser
                ? !viewing
                : viewing?.userId === member.userId;

              return (
                <button
                  key={member.userId}
                  onClick={() => {
                    if (member.isCurrentUser) {
                      switchToSelf();
                    } else {
                      switchToUser({
                        userId: member.userId,
                        etfTicker: member.etfTicker,
                        etfName: member.etfName,
                        name: member.name,
                        avatarColor: member.avatarColor,
                      });
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700/40 transition-colors text-left",
                    isActive && "bg-violet-500/10"
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: member.avatarColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-mono font-semibold">
                        ${member.etfTicker}
                      </span>
                      {member.isCurrentUser && (
                        <span className="text-[10px] text-slate-500 font-medium">(You)</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs truncate">{member.etfName}</p>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
