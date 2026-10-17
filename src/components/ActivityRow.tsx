import { StyleSheet, Text, View } from 'react-native';
import type { Activity } from '../data';
import { signed, useTheme } from '../theme';

export function ActivityRow({ item, divider }: { item: Activity; divider: boolean }) {
  const t = useTheme();
  return (
    <View
      style={[
        s.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline },
      ]}
    >
      <View style={[s.tile, { backgroundColor: t.accent + '1A' }]}>
        <item.icon size={20} color={t.accent} weight="regular" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: t.muted, fontSize: 13 }}>{item.when}</Text>
      </View>
      <Text style={[s.amount, { color: item.amount > 0 ? t.accent : t.text }]}>
        {signed(item.amount)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  tile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '500' },
  amount: { fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
