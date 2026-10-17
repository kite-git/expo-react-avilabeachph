import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { Screen } from '../../../components/Screen';
import { settingsGroups } from '../../../settings-data';
import { useTheme } from '../../../theme';

export default function Settings() {
  const t = useTheme();
  return (
    <Screen title="Settings" subtitle="Sample settings">
      {settingsGroups.map(({ group, pages }) => (
        <View key={group} style={{ gap: 8 }}>
          <Text style={{ color: t.muted, fontSize: 13, fontWeight: '600', marginLeft: 4 }}>{group}</Text>
          <View style={{ backgroundColor: t.surface, borderRadius: 16, paddingHorizontal: 14 }}>
            {pages.map((p, i) => (
              <Pressable
                key={p.slug}
                onPress={() => router.push(`/settings/${p.slug}`)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  s.row,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={[s.tile, { backgroundColor: t.accent + '1A' }]}>
                  <p.icon size={18} color={t.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontSize: 15, fontWeight: '500' }}>{p.title}</Text>
                  <Text style={{ color: t.muted, fontSize: 13 }} numberOfLines={1}>
                    {p.summary}
                  </Text>
                </View>
                <CaretRight size={16} color={t.muted} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  tile: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
