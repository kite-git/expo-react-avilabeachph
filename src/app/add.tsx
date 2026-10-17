import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownLeft, ArrowUpRight, X, type Icon } from 'phosphor-react-native';
import { useTheme } from '../theme';

// Sits over the tab bar: the close button lands roughly where the + was (49pt tab bar, + raised 18pt).
export default function AddMenu() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const option = (label: string, Glyph: Icon, href: '/cash-in' | '/expense') => (
    <Pressable
      onPress={() => router.replace(href)}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.option,
        { backgroundColor: t.surface, borderColor: t.hairline },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={[s.optionIcon, { backgroundColor: t.accent + '1A' }]}>
        <Glyph size={20} color={t.accent} weight="bold" />
      </View>
      <Text style={{ color: t.text, fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={s.root}>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: t.bg + 'CC' }]}
        onPress={() => router.back()}
        accessibilityLabel="Close menu"
      />
      <View style={[s.stack, { paddingBottom: insets.bottom + 11 }]} pointerEvents="box-none">
        {option('Cash in', ArrowDownLeft, '/cash-in')}
        {option('Add expense', ArrowUpRight, '/expense')}
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          style={({ pressed }) => [
            s.close,
            { backgroundColor: t.accent, shadowColor: t.balanceBg },
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
        >
          <X size={24} color={t.bg} weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  stack: { alignItems: 'center', gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 220,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  close: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
