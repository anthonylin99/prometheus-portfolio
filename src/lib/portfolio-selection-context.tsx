'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type PortfolioSource = 'personal' | 'public' | 'combined';

interface PortfolioSelectionContextType {
  selectedSources: PortfolioSource[];
  toggleSource: (source: PortfolioSource) => void;
  setSelectedSources: (sources: PortfolioSource[]) => void;
  isSelected: (source: PortfolioSource) => boolean;
  isCombinedView: boolean;
}

const PortfolioSelectionContext = createContext<PortfolioSelectionContextType | null>(null);

export function PortfolioSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedSources, setSelectedSources] = useState<PortfolioSource[]>(['personal']);

  const toggleSource = useCallback((source: PortfolioSource) => {
    setSelectedSources((prev) => {
      if (source === 'combined') {
        // Combined is exclusive - select both personal and public
        return ['personal', 'public'];
      }

      if (prev.includes(source)) {
        // Don't allow deselecting if it's the only one
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== source);
      }

      return [...prev, source];
    });
  }, []);

  const isSelected = useCallback(
    (source: PortfolioSource) => {
      if (source === 'combined') {
        return selectedSources.includes('personal') && selectedSources.includes('public');
      }
      return selectedSources.includes(source);
    },
    [selectedSources]
  );

  const isCombinedView = selectedSources.includes('personal') && selectedSources.includes('public');

  return (
    <PortfolioSelectionContext.Provider
      value={{
        selectedSources,
        toggleSource,
        setSelectedSources,
        isSelected,
        isCombinedView,
      }}
    >
      {children}
    </PortfolioSelectionContext.Provider>
  );
}

export function usePortfolioSelection() {
  const context = useContext(PortfolioSelectionContext);
  if (!context) {
    throw new Error('usePortfolioSelection must be used within PortfolioSelectionProvider');
  }
  return context;
}
