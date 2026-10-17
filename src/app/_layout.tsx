import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TransactionsProvider } from '../store';
import { useTheme } from '../theme';

export default function RootLayout() {
  const t = useTheme();
  return (
    <TransactionsProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add"
          options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }}
        />
        <Stack.Screen name="cash-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="expense" options={{ presentation: 'modal' }} />
      </Stack>
    </TransactionsProvider>
  );
}
