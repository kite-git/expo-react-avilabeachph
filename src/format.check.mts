// Run with: node src/format.check.mts
import assert from 'node:assert/strict';
import { buildCsv, escapeHtml, formatWhen, groupByMonth, sumAmounts, type Entry } from './format.ts';

const now = new Date(2026, 9, 18, 15, 30);
const entry = (over: Partial<Entry>): Entry => ({
  id: 'x',
  title: 'Villa 3 booking',
  amount: 100,
  kind: 'in',
  categoryId: 'c',
  category: 'Room bookings',
  methodId: 'm',
  method: 'Cash',
  occurredAt: now,
  ...over,
});

// formatWhen
assert.equal(formatWhen(new Date(2026, 9, 18, 9, 42), now), 'Today, 9:42 AM');
assert.equal(formatWhen(new Date(2026, 9, 17, 23, 59), now), 'Yesterday');
assert.equal(formatWhen(new Date(2026, 9, 15), now), 'Oct 15');
assert.equal(formatWhen(new Date(2025, 11, 31), now), 'Dec 31, 2025');
assert.equal(formatWhen(new Date(2026, 9, 1), new Date(2026, 9, 2)), 'Yesterday');
assert.equal(formatWhen(new Date(2026, 8, 30), new Date(2026, 9, 1)), 'Yesterday');

// sumAmounts avoids float drift
assert.equal(sumAmounts([{ amount: 0.1 }, { amount: 0.2 }]), 0.3);

// groupByMonth: oldest first, ends at current month, splits in and out, crosses years
const months = groupByMonth(
  [
    entry({ amount: 1250.5, occurredAt: new Date(2026, 9, 3) }),
    entry({ amount: 400, kind: 'out', occurredAt: new Date(2026, 9, 10) }),
    entry({ amount: 99.99, occurredAt: new Date(2026, 4, 31, 23, 59) }),
    entry({ amount: 5, occurredAt: new Date(2026, 3, 30) }), // outside the window
  ],
  6,
  now,
);
assert.deepEqual(months.map((m) => m.key), ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']);
assert.deepEqual(months.map((m) => m.label), ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']);
assert.equal(months[5].income, 1250.5);
assert.equal(months[5].expenses, 400);
assert.equal(months[0].income, 99.99);
assert.deepEqual(groupByMonth([], 3, new Date(2026, 0, 15)).map((m) => m.key), ['2025-11', '2025-12', '2026-01']);

// buildCsv: BOM, header, quoting, formula guard, plain 2-decimal amounts
const csv = buildCsv([
  entry({ title: 'Diesel, 2 drums', amount: 8450, kind: 'out', category: 'Maintenance', method: 'GCash', occurredAt: new Date(2026, 9, 5) }),
  entry({ title: 'He said "rush"', amount: 1250.5 }),
  entry({ title: '=HYPERLINK("x")', amount: 1 }),
]);
const lines = csv.slice(1).split('\r\n');
assert.ok(csv.startsWith('\uFEFF'));
assert.equal(lines[0], 'Date,Description,Type,Category,Payment method,Amount');
assert.equal(lines[1], '2026-10-05,"Diesel, 2 drums",Expense,Maintenance,GCash,8450.00');
assert.equal(lines[2], '2026-10-18,"He said ""rush""",Cash in,Room bookings,Cash,1250.50');
assert.equal(lines[3], `2026-10-18,"'=HYPERLINK(""x"")",Cash in,Room bookings,Cash,1.00`);
assert.equal(lines[4], '');

// escapeHtml
assert.equal(escapeHtml(`<b>Tom & "Jerry's"</b>`), '&lt;b&gt;Tom &amp; &quot;Jerry&#39;s&quot;&lt;/b&gt;');

console.log('format checks passed');
