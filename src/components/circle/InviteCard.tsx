'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface InviteCardProps {
  inviteCode: string;
  circleName: string;
}

export function InviteCard({ inviteCode, circleName }: InviteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-bold text-white">Invite Friends</h2>
      </div>

      <p className="text-slate-400 text-sm mb-4">
        Share this code with friends to invite them to{' '}
        <span className="text-white font-medium">{circleName}</span>
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
          <span className="text-white font-mono font-bold tracking-[0.3em] text-lg">
            {inviteCode}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors flex items-center gap-2"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {copied && (
        <p className="text-emerald-400 text-xs text-center mt-2">
          Copied to clipboard!
        </p>
      )}
    </div>
  );
}
