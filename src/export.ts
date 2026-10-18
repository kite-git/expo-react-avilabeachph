import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { buildCsv, escapeHtml, sumAmounts, type Entry } from './format';
import { peso, themes } from './theme';

export type MonthExport = { key: string; title: string; resortName: string; entries: Entry[] };

async function share(uri: string, mimeType: string, UTI: string) {
  if (!(await isAvailableAsync())) throw new Error('Sharing isn’t available on this device.');
  await shareAsync(uri, { mimeType, UTI });
}

export async function exportCsv({ key, entries }: MonthExport) {
  const file = new File(Paths.cache, `avila-${key}.csv`);
  file.create({ overwrite: true });
  await file.write(buildCsv(entries));
  await share(file.uri, 'text/csv', 'public.comma-separated-values-text');
}

export async function exportPdf({ title, resortName, entries }: MonthExport) {
  const c = themes.light;
  const income = sumAmounts(entries.filter((e) => e.kind === 'in'));
  const spent = sumAmounts(entries.filter((e) => e.kind === 'out'));
  const byCategory = [...new Set(entries.map((e) => e.category))]
    .map((name) => ({
      name,
      kind: entries.find((e) => e.category === name)!.kind,
      amount: sumAmounts(entries.filter((e) => e.category === name)),
    }))
    .sort((a, b) => b.amount - a.amount);
  const cell = 'padding:6px 8px;border-bottom:1px solid ' + c.hairline;

  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,Roboto,sans-serif;color:${c.text};padding:24px;font-size:12px">
  <h1 style="margin:0;font-size:22px">${escapeHtml(resortName)}</h1>
  <p style="margin:4px 0 20px;color:${c.muted}">Finance summary, ${escapeHtml(title)}</p>
  <table style="width:100%;margin-bottom:20px"><tr>
    <td><div style="color:${c.muted}">Income</div><b style="font-size:16px">${peso(income)}</b></td>
    <td><div style="color:${c.muted}">Expenses</div><b style="font-size:16px">${peso(spent)}</b></td>
    <td><div style="color:${c.muted}">Net</div><b style="font-size:16px;color:${c.accent}">${income - spent < 0 ? '−' : ''}${peso(income - spent)}</b></td>
  </tr></table>
  <h2 style="font-size:14px">By category</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    ${byCategory.map((r) => `<tr><td style="${cell}">${escapeHtml(r.name)}</td><td style="${cell};color:${c.muted}">${r.kind === 'in' ? 'Cash in' : 'Expense'}</td><td style="${cell};text-align:right">${peso(r.amount)}</td></tr>`).join('')}
  </table>
  <h2 style="font-size:14px">Transactions</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr style="color:${c.muted};text-align:left"><th style="${cell}">Date</th><th style="${cell}">Description</th><th style="${cell}">Category</th><th style="${cell}">Paid</th><th style="${cell};text-align:right">Amount</th></tr>
    ${entries
      .map(
        (e) =>
          `<tr><td style="${cell}">${e.occurredAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td><td style="${cell}">${escapeHtml(e.title)}</td><td style="${cell}">${escapeHtml(e.category)}</td><td style="${cell}">${escapeHtml(e.method)}</td><td style="${cell};text-align:right">${e.kind === 'in' ? '+' : '−'}${peso(e.amount)}</td></tr>`,
      )
      .join('')}
  </table>
</body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  await share(uri, 'application/pdf', 'com.adobe.pdf');
}
