import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../store';
import { useTheme } from '../theme';
import { Button } from './Controls';

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 48 }}>
        <View style={{ gap: 2, marginBottom: 4 }}>
          <Text style={{ color: t.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.6 }}>{title}</Text>
          {subtitle && <Text style={{ color: t.muted, fontSize: 15 }}>{subtitle}</Text>}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function EmptyState({ children }: { children: string }) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.surface, borderRadius: 16, padding: 18 }}>
      <Text style={{ color: t.muted, fontSize: 15, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}

// Shows a skeleton while the store loads and a retry box if it failed; renders children once ready.
export function Loaded({ children }: { children: ReactNode }) {
  const t = useTheme();
  const { status, error, reload } = useTransactions();
  if (status === 'loading') {
    return (
      <View style={{ gap: 16 }} accessibilityLabel="Loading" accessible>
        {[150, 220, 260].map((h) => (
          <View key={h} style={{ height: h, borderRadius: 16, backgroundColor: t.surface }} />
        ))}
      </View>
    );
  }
  if (status === 'error') {
    return (
      <View style={{ backgroundColor: t.surface, borderRadius: 16, padding: 18, gap: 14 }}>
        <Text style={{ color: t.text, fontSize: 16, fontWeight: '600' }}>Couldn’t load your data</Text>
        <Text style={{ color: t.muted, fontSize: 14, lineHeight: 20 }}>{error ?? 'Check your connection and try again.'}</Text>
        <Button label="Try again" onPress={reload} />
      </View>
    );
  }
  return <>{children}</>;
}
