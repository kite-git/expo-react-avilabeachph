import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AuthProvider, useSession } from '../auth';
import { TransactionsProvider } from '../store';
import { useTheme } from '../theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TransactionsProvider>
        <StatusBar style="auto" />
        <RootStack />
      </TransactionsProvider>
    </AuthProvider>
  );
}

function RootStack() {
  const t = useTheme();
  const session = useSession();
  // Plain background while the saved session is read, so sign-in never flashes for a signed-in user.
  if (session === undefined) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add"
          options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }}
        />
        <Stack.Screen name="cash-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="expense" options={{ presentation: 'modal' }} />
        <Stack.Screen name="entry/[id]" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
