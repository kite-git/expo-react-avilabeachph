import { useState, type ReactNode } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../store';
import { useTheme } from '../theme';
import { Button } from './Controls';

export const screenPadding = { padding: 20, paddingBottom: 48 };

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ ...screenPadding, gap: 16 }} refreshControl={usePullToRefresh()}>
        <ScreenHeader title={title} subtitle={subtitle} />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 2, marginBottom: 4 }}>
      <Text style={{ color: t.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.6 }}>{title}</Text>
      {subtitle && <Text style={{ color: t.muted, fontSize: 15 }}>{subtitle}</Text>}
    </View>
  );
}

// Refetches without the loading skeleton; on failure the current data stays and an alert explains why.
export function usePullToRefresh() {
  const t = useTheme();
  const { refresh } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (e) {
      Alert.alert('Couldn’t refresh', (e as Error).message);
    } finally {
      setRefreshing(false);
    }
  };
  return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} colors={[t.accent]} progressBackgroundColor={t.surface} />;
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
