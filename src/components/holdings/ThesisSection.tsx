'use client';

import Image from 'next/image';
import { FileText, Target, Zap, AlertTriangle, BookOpen } from 'lucide-react';
import { userThesisData } from '@/data/user-thesis';

interface ThesisSectionProps {
  ticker: string;
}

export function ThesisSection({ ticker }: ThesisSectionProps) {
  const data = userThesisData[ticker.toUpperCase()];
  if (!data) return null;

  const items = [
    { icon: FileText, label: 'Investment Thesis', value: data.thesis },
    { icon: Target, label: 'Price Target', value: data.priceTarget },
    { icon: Zap, label: '2026 Catalysts', value: data.catalysts },
    { icon: AlertTriangle, label: 'Risk Factors', value: data.risks },
    { icon: BookOpen, label: 'Lessons Learned', value: data.lessons },
  ] as const;

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-violet-400/30 flex-shrink-0">
          <Image
            src="/profile.png"
            alt="Anthony"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Anthony&apos;s Thesis</h2>
          <p className="text-sm text-slate-400">Personal investment reasoning and analysis</p>
        </div>
      </div>
      <div className="space-y-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
