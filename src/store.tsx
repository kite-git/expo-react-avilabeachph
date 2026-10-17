import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import * as seed from './data';
import type { Activity } from './data';

type NewEntry = Omit<Activity, 'id' | 'when'>;

// shortcut: in-memory only, resets on restart; replace with Supabase queries
const Ctx = createContext<{ added: Activity[]; addEntry: (e: NewEntry) => void } | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [added, setAdded] = useState<Activity[]>([]);
  const value = useMemo(
    () => ({
      added,
      addEntry: (e: NewEntry) =>
        setAdded((list) => [
          {
            ...e,
            id: String(Date.now()),
            when: 'Today, ' + new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }),
          },
          ...list,
        ]),
    }),
    [added],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Seed figures plus whatever was recorded this session.
export function useTransactions() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionsProvider');
  const { added, addEntry } = ctx;
  return useMemo(() => {
    const addedIn = added.filter((a) => a.amount > 0).reduce((s, a) => s + a.amount, 0);
    const addedOut = added.filter((a) => a.amount < 0).reduce((s, a) => s - a.amount, 0);
    const expenses = seed.expenses.map((e) => ({
      ...e,
      amount: e.amount + added.filter((a) => a.amount < 0 && a.category === e.label).reduce((s, a) => s - a.amount, 0),
    }));
    return {
      addEntry,
      added,
      activity: [...added, ...seed.activity],
      balance: seed.balance + addedIn - addedOut,
      income: seed.income + addedIn,
      expenses,
      addedIn,
      addedOut,
    };
  }, [added, addEntry]);
}
