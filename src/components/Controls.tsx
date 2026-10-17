import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export function Button({ label, onPress, disabled, icon, style }: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        s.button,
        { backgroundColor: disabled ? t.hairline : t.accent },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {icon}
      <Text style={[s.buttonLabel, { color: disabled ? t.muted : t.bg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        s.chip,
        selected
          ? { backgroundColor: t.accent, borderColor: t.accent }
          : { backgroundColor: t.surface, borderColor: t.hairline },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={{ color: selected ? t.bg : t.text, fontSize: 14, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
});
