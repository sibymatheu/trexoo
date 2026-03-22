import { createContext, useContext, ReactNode } from 'react';
import { useLotteryProgram } from '../hooks/useLotteryProgram';

type LotteryContextValue = ReturnType<typeof useLotteryProgram>;

const LotteryContext = createContext<LotteryContextValue | null>(null);

export function LotteryProvider({ children }: { children: ReactNode }) {
  const value = useLotteryProgram();
  return (
    <LotteryContext.Provider value={value}>
      {children}
    </LotteryContext.Provider>
  );
}

export function useLottery(): LotteryContextValue {
  const ctx = useContext(LotteryContext);
  if (!ctx) throw new Error('useLottery must be used inside LotteryProvider');
  return ctx;
}
