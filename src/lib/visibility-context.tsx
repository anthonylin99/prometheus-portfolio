'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// PIN for unlocking visibility - stored here for simplicity
const UNLOCK_PIN = '2119';

interface VisibilityContextType {
  isVisible: boolean;
  isPINModalOpen: boolean;
  openPINModal: () => void;
  closePINModal: () => void;
  unlockWithPIN: () => void;
  hideValues: () => void;
  maskValue: (value: string | number) => string;
  correctPIN: string;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

export function VisibilityProvider({ children }: { children: ReactNode }) {
  // Default to hidden — dollar amounts are masked until unlocked with PIN.
  const [isVisible, setIsVisible] = useState<boolean>(() => false);
  const [isPINModalOpen, setIsPINModalOpen] = useState(false);

  const openPINModal = useCallback(() => {
    setIsPINModalOpen(true);
  }, []);

  const closePINModal = useCallback(() => {
    setIsPINModalOpen(false);
  }, []);

  const unlockWithPIN = useCallback(() => {
    setIsVisible(true);
    setIsPINModalOpen(false);
  }, []);

  const hideValues = useCallback(() => {
    setIsVisible(false);
  }, []);

  const maskValue = useCallback((value: string | number): string => {
    if (isVisible) {
      return typeof value === 'number' ? value.toString() : value;
    }
    // Return masked value (dots or asterisks)
    const str = typeof value === 'number' ? value.toString() : value;
    // Keep currency symbol and format, replace numbers with bullets
    return str.replace(/[\d,.]+/g, '••••••');
  }, [isVisible]);

  return (
    <VisibilityContext.Provider value={{ 
      isVisible, 
      isPINModalOpen,
      openPINModal,
      closePINModal,
      unlockWithPIN,
      hideValues,
      maskValue,
      correctPIN: UNLOCK_PIN
    }}>
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility() {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
}
