import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { incomeBySource, incomeSources, monthly } from '../../data';
import { useTransactions } from '../../store';
import { peso, signed, useTheme, type Theme } from '../../theme';

const CHART_HEIGHT = 140;

export default function Reports() {
  const t = useTheme();
  const s = makeStyles(t);
  const { added, addedIn, addedOut, expenses } = useTransactions();

  // Entries recorded this session count toward the current month (October).
  const months = monthly.map((m, i) =>
    i === monthly.length - 1 ? { ...m, income: m.income + addedIn, expenses: m.expenses + addedOut } : m,
  );
  const sources = incomeBySource.map((src) => ({
    ...src,
    amount: src.amount + added.filter((a) => a.amount > 0 && a.category === src.label).reduce((sum, a) => sum + a.amount, 0),
  }));
  const [selected, setSelected] = useState(months.length - 1);

  const totalIn = months.reduce((sum, m) => sum + m.income, 0);
  const totalOut = months.reduce((sum, m) => sum + m.expenses, 0);
  const max = Math.max(...months.flatMap((m) => [m.income, m.expenses]));
  const sel = months[selected];
  const sourceTotal = sources.reduce((sum, x) => sum + x.amount, 0);
  const maxSource = Math.max(...sources.map((x) => x.amount));
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount);

  return (
    <Screen title="Reports" subtitle="May to October 2026, sample data">
      <View style={s.section}>
        <Text style={s.muted}>Net profit, last 6 months</Text>
        <Text style={s.hero}>{signed(totalIn - totalOut)}</Text>
        <View style={s.totals}>
          <Legend t={t} color={t.chartIn} label="Income" value={totalIn} />
          <Legend t={t} color={t.chartOut} label="Expenses" value={totalOut} />
        </View>

        <View style={[s.readout, { borderTopColor: t.hairline }]} accessibilityLiveRegion="polite">
          <Text style={s.readoutMonth}>{sel.month} 2026</Text>
          <Text style={s.readoutLine}>
            {peso(sel.income)} in, {peso(sel.expenses)} out
          </Text>
          <Text style={s.muted}>Net {signed(sel.income - sel.expenses)}</Text>
        </View>

        <View style={s.chart}>
          {months.map((m, i) => (
            <Pressable
              key={m.month}
              onPress={() => setSelected(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: i === selected }}
              accessibilityLabel={`${m.month}: income ${peso(m.income)}, expenses ${peso(m.expenses)}`}
              style={s.column}
            >
              <View style={[s.bars, { borderBottomColor: t.hairline }]}>
                <View style={[s.pair, { opacity: i === selected ? 1 : 0.55 }]}>
                <View style={[s.bar, { height: (m.income / max) * CHART_HEIGHT, backgroundColor: t.chartIn }]} />
                <View style={[s.bar, { height: (m.expenses / max) * CHART_HEIGHT, backgroundColor: t.chartOut }]} />
                </View>
              </View>
              <Text style={[s.monthLabel, i === selected && { color: t.text, fontWeight: '600' }]}>{m.month}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Income by source</Text>
        <Text style={[s.muted, { marginBottom: 6 }]}>October, {peso(sourceTotal)}</Text>
        {sources.map((x) => {
          const Glyph = incomeSources.find((src) => src.label === x.label)!.icon;
          return (
            <View key={x.label} style={s.sourceRow}>
              <View style={s.sourceHead}>
                <Glyph size={18} color={t.accent} />
                <Text style={s.rowLabel}>{x.label}</Text>
                <Text style={s.rowValue}>{peso(x.amount)}</Text>
              </View>
              <View style={s.sourceBarRow}>
                <View style={[s.sourceBar, { width: `${(x.amount / maxSource) * 80}%`, backgroundColor: t.chartIn }]} />
                <Text style={s.muted}>{((x.amount / sourceTotal) * 100).toFixed(1)}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Top expenses</Text>
        <Text style={[s.muted, { marginBottom: 6 }]}>October, {peso(expenseTotal)}</Text>
        {topExpenses.map((e, i) => (
          <View key={e.label} style={[s.expenseRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline }]}>
            <View style={[s.tile, { backgroundColor: t.accent + '1A' }]}>
              <e.icon size={18} color={t.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>{e.label}</Text>
              <Text style={s.muted}>{((e.amount / expenseTotal) * 100).toFixed(1)}% of spending</Text>
            </View>
            <Text style={s.rowValue}>{peso(e.amount)}</Text>
          </View>
        ))}
      </View>
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
      <Text style={{ color: t.text, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{peso(value)}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    section: { backgroundColor: t.surface, borderRadius: 16, padding: 18 },
    sectionTitle: { color: t.text, fontSize: 18, fontWeight: '600', letterSpacing: -0.2 },
    muted: { color: t.muted, fontSize: 13 },
    hero: { color: t.text, fontSize: 32, fontWeight: '700', letterSpacing: -0.8, fontVariant: ['tabular-nums'], marginTop: 2 },
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
