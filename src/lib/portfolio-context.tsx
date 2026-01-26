'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ViewingUser {
  userId: string;
  etfTicker: string;
  etfName: string;
  name: string;
  avatarColor: string;
  isOwnPortfolio: boolean;
}

interface PortfolioViewingContextValue {
  viewing: ViewingUser | null;
  switchToUser: (user: Omit<ViewingUser, 'isOwnPortfolio'> & { isOwnPortfolio?: boolean }) => void;
  switchToSelf: () => void;
  isViewingOther: boolean;
}

const PortfolioViewingContext = createContext<PortfolioViewingContextValue>({
  viewing: null,
  switchToUser: () => {},
  switchToSelf: () => {},
  isViewingOther: false,
});

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [viewing, setViewing] = useState<ViewingUser | null>(null);

  const switchToUser = useCallback(
    (user: Omit<ViewingUser, 'isOwnPortfolio'> & { isOwnPortfolio?: boolean }) => {
      if (user.isOwnPortfolio) {
        setViewing(null);
        return;
      }
      setViewing({
        userId: user.userId,
        etfTicker: user.etfTicker,
        etfName: user.etfName,
        name: user.name,
        avatarColor: user.avatarColor,
        isOwnPortfolio: false,
      });
    },
    []
  );

  const switchToSelf = useCallback(() => {
    setViewing(null);
  }, []);

  return (
    <PortfolioViewingContext.Provider
      value={{
        viewing,
        switchToUser,
        switchToSelf,
        isViewingOther: viewing !== null && !viewing.isOwnPortfolio,
      }}
    >
      {children}
    </PortfolioViewingContext.Provider>
  );
}

export function usePortfolioViewing() {
  return useContext(PortfolioViewingContext);
}
