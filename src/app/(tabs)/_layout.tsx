import { router, Tabs } from 'expo-router';
import { Pressable, StyleSheet, View, type ColorValue } from 'react-native';
import { ArrowsDownUp, ChartPie, GearSix, House, Plus, type Icon } from 'phosphor-react-native';
import { useTheme } from '../../theme';

const icon =
  (I: Icon) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    // Tint colors are our hex strings from theme.ts.
    <I size={24} color={color as string} weight={focused ? 'fill' : 'regular'} />
  );

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: t.bg },
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.hairline,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: icon(House) }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity', tabBarIcon: icon(ArrowsDownUp) }} />
      <Tabs.Screen
        name="new"
        options={{
          title: 'Record transaction',
          // Not a real tab: the button opens the add modal and never selects this route.
          tabBarButton: () => (
            <View style={s.slot}>
              <Pressable
                onPress={() => router.push('/add')}
                accessibilityRole="button"
                accessibilityLabel="Record transaction"
                style={({ pressed }) => [
                  s.add,
                  { backgroundColor: t.accent, shadowColor: t.balanceBg },
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
              >
                <Plus size={26} color={t.bg} weight="bold" />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: icon(ChartPie) }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon(GearSix) }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center' },
  add: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
