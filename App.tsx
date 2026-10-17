import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bed,
  Drop,
  ForkKnife,
  Lightning,
  Receipt,
  UsersThree,
  type Icon,
} from 'phosphor-react-native';

// Radius rule: balance card 20, sections 16, icon tiles 12.
const themes = {
  light: {
    bg: '#F2F5F5',
    surface: '#FAFCFC',
    text: '#0F1A1C',
    muted: '#56676A',
    hairline: '#DFE5E6',
    accent: '#0B6E72',
    balanceBg: '#0B5E62',
    onBalance: '#EEF7F6',
    onBalanceMuted: '#A9D3D1',
  },
  dark: {
    bg: '#0B1112',
    surface: '#131B1D',
    text: '#E8EEEE',
    muted: '#93A3A5',
    hairline: '#223033',
    accent: '#4FBDB6',
    balanceBg: '#12474A',
    onBalance: '#EEF7F6',
    onBalanceMuted: '#9CCBC8',
  },
};
type Theme = typeof themes.light;

// Mock data until a real ledger is wired in.
const balance = 2846310.42;
const income = 1204880.0;
const expenses: { label: string; amount: number; icon: Icon }[] = [
  { label: 'Payroll', amount: 268900.0, icon: UsersThree },
  { label: 'Food and beverage', amount: 148720.5, icon: ForkKnife },
  { label: 'Utilities', amount: 121384.65, icon: Lightning },
  { label: 'Maintenance', amount: 73432.0, icon: Drop },
];
const activity: { title: string; when: string; amount: number; icon: Icon }[] = [
  { title: 'Villa 3 booking, Reyes family', when: 'Today, 9:42 AM', amount: 38500.0, icon: Bed },
  { title: 'Meralco electric bill', when: 'Today, 8:15 AM', amount: -42816.37, icon: Lightning },
  { title: 'Restaurant sales', when: 'Yesterday', amount: 27940.0, icon: ForkKnife },
  { title: 'Pool chemicals restock', when: 'Yesterday', amount: -6215.5, icon: Drop },
  { title: 'Housekeeping payroll', when: 'Oct 15', amount: -118400.0, icon: UsersThree },
  { title: 'Cabana 2 walk-in, GCash', when: 'Oct 14', amount: 4800.0, icon: Receipt },
];

const peso = (n: number) =>
  Math.abs(n).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
const signed = (n: number) => (n < 0 ? '−' : '+') + peso(n);

// Segment shades are the one accent at stepped opacity, keeping the palette to a single hue.
const shades = ['FF', 'B3', '73', '40'];

export default function App() {
  const t = themes[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const s = makeStyles(t);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.screen} edges={['top']}>
        <StatusBar style="auto" />
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.header}>
            <Text style={s.resort}>Avila Beach PH</Text>
            <Text style={s.period}>Finances, October 2026</Text>
          </View>

          <View style={s.balanceCard}>
            <Text style={s.balanceLabel}>Total balance</Text>
            <Text style={s.balanceAmount} adjustsFontSizeToFit numberOfLines={1}>
              {peso(balance)}
            </Text>
            <View style={s.flowRow}>
              <Flow t={t} label="Income" value={income} Icon={ArrowDownLeft} />
              <Flow t={t} label="Expenses" value={totalExpenses} Icon={ArrowUpRight} />
            </View>
          </View>

          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Expenses</Text>
              <Text style={s.sectionMeta}>{peso(totalExpenses)}</Text>
            </View>
            <View style={s.bar} accessibilityLabel="Expense breakdown by category">
              {expenses.map((e, i) => (
                <View
                  key={e.label}
                  style={{ flex: e.amount, backgroundColor: t.accent + shades[i] }}
                />
              ))}
            </View>
            <View style={s.legend}>
              {expenses.map((e, i) => (
                <View key={e.label} style={s.legendItem}>
                  <View style={[s.swatch, { backgroundColor: t.accent + shades[i] }]} />
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
          </View>

          <View style={s.section}>
            <Text style={[s.sectionTitle, { marginBottom: 4 }]}>Recent activity</Text>
            {activity.length === 0 ? (
              <Text style={[s.muted, { paddingVertical: 24 }]}>
                No transactions yet. Bookings and bills will show up here.
              </Text>
            ) : (
              activity.map((a, i) => (
                <View key={a.title} style={[s.row, i > 0 && s.rowDivider]}>
                  <View style={s.tile}>
                    <a.icon size={20} color={t.accent} weight="regular" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowTitle} numberOfLines={1}>
                      {a.title}
                    </Text>
                    <Text style={s.muted}>{a.when}</Text>
                  </View>
                  <Text style={[s.rowAmount, a.amount > 0 && { color: t.accent }]}>
                    {signed(a.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
    screen: { flex: 1, backgroundColor: t.bg },
    content: { padding: 20, gap: 16, paddingBottom: 48 },
    header: { gap: 2, marginBottom: 4 },
    resort: { color: t.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
    period: { color: t.muted, fontSize: 15 },
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
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline },
    tile: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.accent + '1A',
    },
    rowTitle: { color: t.text, fontSize: 15, fontWeight: '500' },
    rowAmount: { color: t.text, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  });
