import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

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
