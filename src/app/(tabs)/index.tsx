import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, type Icon } from 'phosphor-react-native';
import { ActivityRow } from '../../components/ActivityRow';
import { Loaded, Screen } from '../../components/Screen';
import { sumAmounts } from '../../format';
import { useTransactions } from '../../store';
import { peso, useTheme, type Theme } from '../../theme';

// Segment shades are the one accent at stepped opacity, keeping the palette to a single hue.
// shortcut: 4 shades for the 4 seeded expense categories; extra categories reuse the lightest, add steps if categories grow
const shades = ['FF', 'B3', '73', '40'];
const shade = (i: number) => shades[Math.min(i, shades.length - 1)];

export default function Overview() {
  const t = useTheme();
  const s = makeStyles(t);
  const { entries, balance, expenses, income } = useTransactions();
  const totalExpenses = sumAmounts(expenses);
  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Screen title="Avila Beach PH" subtitle={`Finances, ${month}`}>
      <Loaded>
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Total balance</Text>
          <Text style={s.balanceAmount} adjustsFontSizeToFit numberOfLines={1}>
            {peso(balance)}
          </Text>
          <View style={s.flowRow}>
            <Flow t={t} label="Income this month" value={income} Icon={ArrowDownLeft} />
            <Flow t={t} label="Spent this month" value={totalExpenses} Icon={ArrowUpRight} />
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Expenses</Text>
            <Text style={s.sectionMeta}>{peso(totalExpenses)}</Text>
          </View>
          {totalExpenses === 0 ? (
            <Text style={[s.muted, { paddingTop: 12 }]}>No expenses recorded this month.</Text>
          ) : (
            <>
              <View style={s.bar} accessibilityLabel="Expense breakdown by category">
                {expenses.map((e, i) =>
                  e.amount > 0 ? (
                    <View key={e.label} style={{ flex: e.amount, backgroundColor: t.accent + shade(i) }} />
                  ) : null,
                )}
              </View>
              <View style={s.legend}>
                {expenses.map((e, i) => (
                  <View key={e.label} style={s.legendItem}>
                    <View style={[s.swatch, { backgroundColor: t.accent + shade(i) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.legendLabel}>{e.label}</Text>
                      <Text style={s.legendValue}>
                        {peso(e.amount)}
                        <Text style={s.muted}>
                          {'  '}
                          {((e.amount / totalExpenses) * 100).toFixed(1)}%
                        </Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, { marginBottom: 4 }]}>Recent activity</Text>
          {entries.length === 0 ? (
            <Text style={[s.muted, { paddingVertical: 24 }]}>No transactions yet. Tap + to record your first one.</Text>
          ) : (
            entries.slice(0, 4).map((a, i) => <ActivityRow key={a.id} item={a} divider={i > 0} />)
          )}
        </View>
      </Loaded>
    </Screen>
  );
}

function Flow({ t, label, value, Icon }: { t: Theme; label: string; value: number; Icon: Icon }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon size={14} color={t.onBalanceMuted} weight="bold" />
        <Text style={{ color: t.onBalanceMuted, fontSize: 13 }}>{label}</Text>
      </View>
      <Text style={{ color: t.onBalance, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
        {peso(value)}
      </Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    balanceCard: { backgroundColor: t.balanceBg, borderRadius: 20, padding: 22, gap: 6 },
    balanceLabel: { color: t.onBalanceMuted, fontSize: 14 },
    balanceAmount: {
      color: t.onBalance,
      fontSize: 38,
      fontWeight: '700',
      letterSpacing: -1,
      fontVariant: ['tabular-nums'],
    },
    flowRow: {
      flexDirection: 'row',
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.onBalanceMuted + '55',
    },
    section: { backgroundColor: t.surface, borderRadius: 16, padding: 18 },
    sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    sectionTitle: { color: t.text, fontSize: 18, fontWeight: '600', letterSpacing: -0.2 },
    sectionMeta: { color: t.text, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
    bar: { flexDirection: 'row', height: 10, gap: 3, marginTop: 16, borderRadius: 5, overflow: 'hidden' },
    legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18, rowGap: 16 },
    legendItem: { width: '50%', flexDirection: 'row', gap: 10, paddingRight: 8 },
    swatch: { width: 10, height: 10, borderRadius: 3, marginTop: 4 },
    legendLabel: { color: t.muted, fontSize: 13 },
    legendValue: { color: t.text, fontSize: 15, fontWeight: '500', fontVariant: ['tabular-nums'] },
    muted: { color: t.muted, fontSize: 13 },
  });
