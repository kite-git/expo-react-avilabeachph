import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { DownloadSimple } from 'phosphor-react-native';
import { Button } from '../../components/Controls';
import { Loaded, Screen } from '../../components/Screen';
import { categoryIcon } from '../../data';
import { exportCsv, exportPdf } from '../../export';
import { groupByMonth, monthKey, sumAmounts } from '../../format';
import { useTransactions } from '../../store';
import { peso, signed, useTheme, type Theme } from '../../theme';

const CHART_HEIGHT = 140;
const MONTHS = 6;

export default function Reports() {
  const t = useTheme();
  const s = makeStyles(t);
  const { entries, categories, resort } = useTransactions();
  const months = groupByMonth(entries, MONTHS);
  const [selected, setSelected] = useState(MONTHS - 1);
  const [exporting, setExporting] = useState(false);

  const totalIn = sumAmounts(months.map((m) => ({ amount: m.income })));
  const totalOut = sumAmounts(months.map((m) => ({ amount: m.expenses })));
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expenses]));
  const sel = months[selected];
  const selTitle = `${sel.label} ${sel.year}`;
  const selEntries = entries.filter((e) => monthKey(e.occurredAt) === sel.key);

  const totalsFor = (kind: 'in' | 'out') =>
    categories
      .filter((c) => c.kind === kind)
      .map((c) => ({ label: c.name, amount: sumAmounts(selEntries.filter((e) => e.categoryId === c.id)) }))
      .sort((a, b) => b.amount - a.amount);
  const sources = totalsFor('in');
  const topExpenses = totalsFor('out');
  const maxSource = Math.max(1, ...sources.map((x) => x.amount));

  const runExport = async (kind: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const job = { key: sel.key, title: selTitle, resortName: resort?.name ?? 'Avila Beach PH', entries: selEntries };
      await (kind === 'csv' ? exportCsv(job) : exportPdf(job));
    } catch (e) {
      Alert.alert('Export failed', (e as Error).message);
    } finally {
      setExporting(false);
    }
  };
  const chooseExport = () =>
    Alert.alert(`Export ${selTitle}`, `${selEntries.length} transactions`, [
      { text: 'CSV file', onPress: () => runExport('csv') },
      { text: 'PDF summary', onPress: () => runExport('pdf') },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <Screen title="Reports" subtitle={`Last ${MONTHS} months`}>
      <Loaded>
        <View style={s.section}>
          <Text style={s.muted}>Net profit, last {MONTHS} months</Text>
          <Text style={s.hero}>{signed(totalIn - totalOut)}</Text>
          <View style={s.totals}>
            <Legend t={t} color={t.chartIn} label="Income" value={totalIn} />
            <Legend t={t} color={t.chartOut} label="Expenses" value={totalOut} />
          </View>

          <View style={[s.readout, { borderTopColor: t.hairline }]} accessibilityLiveRegion="polite">
            <Text style={s.readoutMonth}>{selTitle}</Text>
            <Text style={s.readoutLine}>
              {peso(sel.income)} in, {peso(sel.expenses)} out
            </Text>
            <Text style={s.muted}>Net {signed(sel.income - sel.expenses)}</Text>
          </View>

          <View style={s.chart}>
            {months.map((m, i) => (
              <Pressable
                key={m.key}
                onPress={() => setSelected(i)}
                accessibilityRole="button"
                accessibilityState={{ selected: i === selected }}
                accessibilityLabel={`${m.label} ${m.year}: income ${peso(m.income)}, expenses ${peso(m.expenses)}`}
                style={s.column}
              >
                <View style={[s.bars, { borderBottomColor: t.hairline }]}>
                  <View style={[s.pair, { opacity: i === selected ? 1 : 0.55 }]}>
                    <View style={[s.bar, { height: (m.income / max) * CHART_HEIGHT, backgroundColor: t.chartIn }]} />
                    <View style={[s.bar, { height: (m.expenses / max) * CHART_HEIGHT, backgroundColor: t.chartOut }]} />
                  </View>
                </View>
                <Text style={[s.monthLabel, i === selected && { color: t.text, fontWeight: '600' }]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Income by source</Text>
          <Text style={[s.muted, { marginBottom: 6 }]}>
            {selTitle}, {peso(sel.income)}
          </Text>
          {sel.income === 0 ? (
            <Text style={[s.muted, { paddingVertical: 8 }]}>No cash in recorded for {selTitle}.</Text>
          ) : (
            sources.map((x) => {
              const Glyph = categoryIcon(x.label);
              return (
                <View key={x.label} style={s.sourceRow}>
                  <View style={s.sourceHead}>
                    <Glyph size={18} color={t.accent} />
                    <Text style={s.rowLabel}>{x.label}</Text>
                    <Text style={s.rowValue}>{peso(x.amount)}</Text>
                  </View>
                  <View style={s.sourceBarRow}>
                    <View
                      style={[s.sourceBar, { width: `${(x.amount / maxSource) * 80}%`, backgroundColor: t.chartIn }]}
                    />
                    <Text style={s.muted}>{((x.amount / sel.income) * 100).toFixed(1)}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Top expenses</Text>
          <Text style={[s.muted, { marginBottom: 6 }]}>
            {selTitle}, {peso(sel.expenses)}
          </Text>
          {sel.expenses === 0 ? (
            <Text style={[s.muted, { paddingVertical: 8 }]}>No expenses recorded for {selTitle}.</Text>
          ) : (
            topExpenses.map((e, i) => {
              const Glyph = categoryIcon(e.label);
              return (
                <View
                  key={e.label}
                  style={[
                    s.expenseRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline },
                  ]}
                >
                  <View style={[s.tile, { backgroundColor: t.accent + '1A' }]}>
                    <Glyph size={18} color={t.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>{e.label}</Text>
                    <Text style={s.muted}>{((e.amount / sel.expenses) * 100).toFixed(1)}% of spending</Text>
                  </View>
                  <Text style={s.rowValue}>{peso(e.amount)}</Text>
                </View>
              );
            })
          )}
        </View>

        <Button
          label={exporting ? 'Preparing file' : `Export ${selTitle}`}
          onPress={chooseExport}
          disabled={exporting || selEntries.length === 0}
          icon={
            <DownloadSimple size={20} color={exporting || selEntries.length === 0 ? t.muted : t.bg} weight="bold" />
          }
        />
      </Loaded>
    </Screen>
  );
}

function Legend({ t, color, label, value }: { t: Theme; color: string; label: string; value: number }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
        <Text style={{ color: t.muted, fontSize: 13 }}>{label}</Text>
      </View>
      <Text style={{ color: t.text, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
        {peso(value)}
      </Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    section: { backgroundColor: t.surface, borderRadius: 16, padding: 18 },
    sectionTitle: { color: t.text, fontSize: 18, fontWeight: '600', letterSpacing: -0.2 },
    muted: { color: t.muted, fontSize: 13 },
    hero: {
      color: t.text,
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -0.8,
      fontVariant: ['tabular-nums'],
      marginTop: 2,
    },
    totals: { flexDirection: 'row', marginTop: 14 },
    readout: { marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, gap: 2 },
    readoutMonth: { color: t.text, fontSize: 15, fontWeight: '600' },
    readoutLine: { color: t.text, fontSize: 14, fontVariant: ['tabular-nums'] },
    chart: { flexDirection: 'row', marginTop: 16 },
    column: { flex: 1, alignItems: 'center', gap: 6, paddingTop: 4 },
    bars: { alignSelf: 'stretch', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
    pair: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
    bar: { width: 12, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
    monthLabel: { color: t.muted, fontSize: 12 },
    sourceRow: { paddingVertical: 8, gap: 6 },
    sourceHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sourceBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sourceBar: { height: 6, borderRadius: 3 },
    rowLabel: { flex: 1, color: t.text, fontSize: 15, fontWeight: '500' },
    rowValue: { color: t.text, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
    expenseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    tile: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  });
