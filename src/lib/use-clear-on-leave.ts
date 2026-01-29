'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook to clear sensitive state when navigating away from a component.
 * This prevents browser back/forward button from exposing cached data.
 *
 * @param clearFn - Function to call when component unmounts or route changes
 */
export function useClearOnLeave(clearFn: () => void) {
  useEffect(() => {
    // Replace current history state to prevent back button from showing stale data
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        { ...window.history.state, cleared: true },
        '',
        window.location.href
      );
    }

    // Clear on unmount
    return () => {
      clearFn();
    };
  }, [clearFn]);
}

/**
 * Hook to clear portfolio/sensitive data from history state.
 * Use this on pages that display sensitive financial information.
 */
export function useClearSensitiveData() {
  const clearData = useCallback(() => {
    // Push a "clean" state that doesn't reveal cached data on back navigation
    if (typeof window !== 'undefined' && window.history.state) {
      const cleanState = { ...window.history.state };
      // Remove any cached portfolio data from history state
      delete cleanState.portfolioData;
      delete cleanState.holdings;
      delete cleanState.summary;
      delete cleanState.totalValue;
      window.history.replaceState(cleanState, '', window.location.href);
    }
  }, []);

  useEffect(() => {
    // Clear on mount and unmount
    clearData();
    return clearData;
  }, [clearData]);
}
