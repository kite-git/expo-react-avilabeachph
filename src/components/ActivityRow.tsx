import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryIcon } from '../data';
import { formatWhen, type Entry } from '../format';
import { signed, useTheme } from '../theme';

export function ActivityRow({ item, divider, subtitle }: { item: Entry; divider: boolean; subtitle?: string }) {
  const t = useTheme();
  const Glyph = categoryIcon(item.category);
  const value = item.kind === 'in' ? item.amount : -item.amount;
  return (
    <Pressable
      onPress={() => router.push(`/entry/${item.id}`)}
      accessibilityRole="button"
      accessibilityHint="Opens this entry to edit or delete it"
      style={({ pressed }) => [
        s.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={[s.tile, { backgroundColor: t.accent + '1A' }]}>
        <Glyph size={20} color={t.accent} weight="regular" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.title, { color: t.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: t.muted, fontSize: 13 }}>{subtitle ?? formatWhen(item.occurredAt)}</Text>
      </View>
      <Text style={[s.amount, { color: item.kind === 'in' ? t.accent : t.text }]}>{signed(value)}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  tile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '500' },
  amount: { fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
