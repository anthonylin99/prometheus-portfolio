'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getLogoUrl, cn } from '@/lib/utils';

interface CompanyLogoProps {
  ticker: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 48,
};

export function CompanyLogo({ ticker, size = 'md', className }: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getLogoUrl(ticker);

  if (hasError || !logoUrl) {
    return (
      <div 
        className={cn(
          "rounded-xl bg-gradient-to-br from-violet-500/80 to-indigo-600/80 flex items-center justify-center font-bold text-white shadow-lg",
          sizeClasses[size],
          className
        )}
      >
        {ticker.slice(0, 2)}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative rounded-xl overflow-hidden bg-white/10 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={logoUrl}
        alt={`${ticker} logo`}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="object-contain p-1"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}
