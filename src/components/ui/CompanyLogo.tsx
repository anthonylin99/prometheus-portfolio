'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getLogoUrl, getTickerColor, cn } from '@/lib/utils';

interface CompanyLogoProps {
  ticker: string;
  domain?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'w-7 h-7 text-[9px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const imageSizes = {
  xs: 28,
  sm: 32,
  md: 40,
  lg: 48,
};

export function CompanyLogo({ ticker, domain, size = 'md', className }: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getLogoUrl(ticker, domain);

  if (hasError || !logoUrl) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white shadow-sm",
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: getTickerColor(ticker) }}
        title={ticker}
      >
        {ticker.slice(0, 2)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-white/10 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      title={ticker}
    >
      <Image
        src={logoUrl}
        alt={`${ticker} logo`}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="object-contain p-0.5"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}
