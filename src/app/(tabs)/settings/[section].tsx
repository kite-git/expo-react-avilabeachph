import { useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { EmptyState } from '../../../components/Screen';
import { settingsPages } from '../../../settings-data';
import { useTheme } from '../../../theme';

export default function SettingsSection() {
  const t = useTheme();
  const { section } = useLocalSearchParams<{ section: string }>();
  const page = settingsPages.find((p) => p.slug === section);
  // shortcut: toggles live in local state only, reset on leave; persist with Supabase later
  const [toggles, setToggles] = useState(() => page?.rows.map((r) => !!r.toggle) ?? []);

  if (!page) {
    return (
      <View style={{ padding: 20 }}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState>This settings page does not exist.</EmptyState>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Stack.Screen options={{ title: page.title }} />
      <View style={{ backgroundColor: t.surface, borderRadius: 16, paddingHorizontal: 16 }}>
        {page.rows.map((r, i) => (
          <View
            key={r.label}
            style={[s.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline }]}
          >
            <Text style={{ flex: 1, color: t.text, fontSize: 15 }}>{r.label}</Text>
            {r.toggle !== undefined ? (
              <Switch
                value={toggles[i]}
                onValueChange={(v) => setToggles((x) => x.map((old, j) => (j === i ? v : old)))}
                trackColor={{ true: t.accent, false: t.hairline }}
                accessibilityLabel={r.label}
              />
            ) : (
              !!r.value && <Text style={{ color: t.muted, fontSize: 15, flexShrink: 1, textAlign: 'right' }}>{r.value}</Text>
            )}
          </View>
        ))}
      </View>
      {!!page.note && <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19, marginHorizontal: 4 }}>{page.note}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 10 },
});
