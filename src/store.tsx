import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSession } from './auth';
import { monthKey, sumAmounts, type Entry, type Kind } from './format';
import { supabase } from './lib/supabase';

export type Category = { id: string; kind: Kind; name: string };
export type Method = { id: string; name: string };
export type Resort = { name: string; address: string | null; tin: string | null; contact: string | null; opening_balance: number };
export type EntryInput = { title: string; amount: number; categoryId: string; methodId: string; occurredAt: Date };

const SELECT = 'id, title, amount, occurred_at, category_id, payment_method_id, categories(name, kind), payment_methods(name)';

type Row = {
  id: string;
  title: string;
  amount: number | string;
  occurred_at: string;
  category_id: string;
  payment_method_id: string;
  categories: { name: string; kind: Kind } | null;
  payment_methods: { name: string } | null;
};

const toEntry = (r: Row): Entry => ({
  id: r.id,
  title: r.title,
  amount: Number(r.amount),
  kind: r.categories?.kind ?? 'out',
  categoryId: r.category_id,
  category: r.categories?.name ?? 'Unknown',
  methodId: r.payment_method_id,
  method: r.payment_methods?.name ?? 'Unknown',
  occurredAt: new Date(r.occurred_at),
});

const byNewest = (a: Entry, b: Entry) => b.occurredAt.getTime() - a.occurredAt.getTime();

type State = {
  status: 'loading' | 'error' | 'ready';
  error?: string;
  entries: Entry[];
  categories: Category[];
  methods: Method[];
  resort: Resort | null;
};
const empty: State = { status: 'loading', entries: [], categories: [], methods: [], resort: null };

type Ctx = State & {
  reload: () => void;
  refresh: () => Promise<void>;
  addEntry: (input: EntryInput) => Promise<void>;
  updateEntry: (id: string, input: EntryInput) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
};
const StoreCtx = createContext<Ctx | null>(null);

const toRow = (i: EntryInput) => ({
  title: i.title,
  amount: i.amount,
  category_id: i.categoryId,
  payment_method_id: i.methodId,
  occurred_at: i.occurredAt.toISOString(),
});

// Supabase caps each response (1,000 rows by default), so page until an empty page comes back.
// shortcut: loads every row into memory; move totals to a Postgres view if it reaches tens of thousands of rows
const PAGE = 1000;
async function fetchTransactions(): Promise<Row[]> {
  const rows: Row[] = [];
  for (;;) {
    const { data, error } = await supabase
      .from('transactions')
      .select(SELECT)
      .order('occurred_at', { ascending: false })
      .order('id')
      .range(rows.length, rows.length + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data.length) return rows;
    rows.push(...(data as unknown as Row[]));
  }
}

async function fetchAll(): Promise<State> {
  const [entries, cats, methods, resort] = await Promise.all([
    fetchTransactions(),
    supabase.from('categories').select('id, kind, name').order('sort'),
    supabase.from('payment_methods').select('id, name').order('sort'),
    supabase.from('resort').select('name, address, tin, contact, opening_balance').maybeSingle(),
  ]);
  const error = cats.error ?? methods.error ?? resort.error;
  if (error) throw new Error(error.message);
  return {
    status: 'ready',
    entries: entries.map(toEntry),
    categories: cats.data as Category[],
    methods: methods.data as Method[],
    resort: resort.data && { ...resort.data, opening_balance: Number(resort.data.opening_balance) },
  };
}

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const [state, setState] = useState<State>(empty);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: undefined }));
    try {
      setState(await fetchAll());
    } catch (e) {
      setState((s) => ({ ...s, status: 'error', error: (e as Error).message }));
    }
  }, []);

  // Load after sign-in; drop everything on sign-out so nothing lingers on a shared phone.
  const userId = session?.user.id;
  useEffect(() => {
    if (userId) reload();
    else setState(empty);
  }, [userId, reload]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      reload,
      // Keeps the current data on screen while fetching; the caller shows any error.
      refresh: async () => setState(await fetchAll()),
      addEntry: async (input) => {
        const { data, error } = await supabase.from('transactions').insert(toRow(input)).select(SELECT).single();
        if (error) throw new Error(error.message);
        const entry = toEntry(data as unknown as Row);
        setState((s) => ({ ...s, entries: [entry, ...s.entries].sort(byNewest) }));
      },
      updateEntry: async (id, input) => {
        const { data, error } = await supabase.from('transactions').update(toRow(input)).eq('id', id).select(SELECT).single();
        if (error) throw new Error(error.message);
        const entry = toEntry(data as unknown as Row);
        setState((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? entry : e)).sort(byNewest) }));
      },
      removeEntry: async (id) => {
        const { data, error } = await supabase.from('transactions').delete().eq('id', id).select('id');
        if (error) throw new Error(error.message);
        if (!data?.length) throw new Error('This entry was already deleted or could not be found.');
        setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
      },
    }),
    [state, reload],
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useTransactions() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useTransactions must be used inside TransactionsProvider');
  return useMemo(() => {
    const { entries, categories, resort } = ctx;
    const thisMonth = monthKey(new Date());
    const monthEntries = entries.filter((e) => monthKey(e.occurredAt) === thisMonth);
    const allIn = sumAmounts(entries.filter((e) => e.kind === 'in'));
    const allOut = sumAmounts(entries.filter((e) => e.kind === 'out'));
    return {
      ...ctx,
      balance: Math.round(((resort?.opening_balance ?? 0) + allIn - allOut) * 100) / 100,
      income: sumAmounts(monthEntries.filter((e) => e.kind === 'in')),
      expenses: categories
        .filter((c) => c.kind === 'out')
        .map((c) => ({ label: c.name, amount: sumAmounts(monthEntries.filter((e) => e.categoryId === c.id)) })),
    };
  }, [ctx]);
}
