// Pure helpers (no React Native imports) so `node src/format.check.mts` can run them.

export type Kind = 'in' | 'out';
export type Entry = {
  id: string;
  title: string;
  amount: number; // always positive; `kind` gives the direction
  kind: Kind;
  categoryId: string;
  category: string;
  methodId: string;
  method: string;
  occurredAt: Date;
};

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function formatWhen(date: Date, now = new Date()): string {
  if (sameDay(date, now)) {
    return 'Today, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
}

// Sums in centavos so 0.1 + 0.2 style float drift never shows up in totals.
export const sumAmounts = (entries: { amount: number }[]) =>
  entries.reduce((cents, e) => cents + Math.round(e.amount * 100), 0) / 100;

export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export type MonthTotals = { key: string; label: string; year: number; income: number; expenses: number };

// Calendar months, oldest first, ending with the month of `now`.
export function groupByMonth(entries: Entry[], monthsBack: number, now = new Date()): MonthTotals[] {
  return Array.from({ length: monthsBack }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
    const key = monthKey(d);
    const inMonth = entries.filter((e) => monthKey(e.occurredAt) === key);
    return {
      key,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      income: sumAmounts(inMonth.filter((e) => e.kind === 'in')),
      expenses: sumAmounts(inMonth.filter((e) => e.kind === 'out')),
    };
  });
}

const isoDate = (d: Date) => `${monthKey(d)}-${String(d.getDate()).padStart(2, '0')}`;

function csvField(value: string): string {
  // Leading = + - @ would run as a formula in Excel or Sheets.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function buildCsv(entries: Entry[]): string {
  const header = ['Date', 'Description', 'Type', 'Category', 'Payment method', 'Amount'];
  const rows = entries.map((e) => [
    isoDate(e.occurredAt),
    e.title,
    e.kind === 'in' ? 'Cash in' : 'Expense',
    e.category,
    e.method,
    e.amount.toFixed(2),
  ]);
  // BOM so Excel reads the file as UTF-8 (₱ and ñ in descriptions).
  return '\uFEFF' + [header, ...rows].map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';
}

// Descriptions are typed by people; escape them before they go into the PDF's HTML.
export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// `day`'s calendar date at `time`'s clock time; lets a backdated entry keep a real time of day.
export const onDay = (day: Date, time: Date) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());

export type DayGroup = { key: string; title: string; net: number; data: Entry[] };

// Groups newest-first entries into calendar days, keeping their order.
export function groupByDay(entries: Entry[], now = new Date()): DayGroup[] {
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const groups: DayGroup[] = [];
  for (const e of entries) {
    const key = isoDate(e.occurredAt);
    let g = groups[groups.length - 1];
    if (g?.key !== key) {
      const d = e.occurredAt;
      const title = sameDay(d, now)
        ? 'Today'
        : sameDay(d, yesterday)
          ? 'Yesterday'
          : d.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              ...(d.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
            });
      g = { key, title, net: 0, data: [] };
      groups.push(g);
    }
    g.data.push(e);
  }
  for (const g of groups) g.net = sumAmounts(g.data.map((e) => ({ amount: e.kind === 'in' ? e.amount : -e.amount })));
  return groups;
}
