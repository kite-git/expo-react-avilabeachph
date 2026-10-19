import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Eye, EyeSlash, SunHorizon } from 'phosphor-react-native';
import { Button } from '../components/Controls';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme';

export default function SignIn() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const horizon = useRef(new Animated.Value(0)).current;

  // The horizon line draws in once; with Reduce Motion it just appears.
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) horizon.setValue(1);
      else
        Animated.timing(horizon, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
    });
  }, [horizon]);

  const canSubmit = !busy && !!email.trim() && !!password;

  const fail = (message: string) => {
    setError(message);
    setBusy(false);
    // accessibilityLiveRegion only covers Android; iOS needs an explicit announcement.
    AccessibilityInfo.announceForAccessibility(message);
  };

  const signIn = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      // On success the auth listener swaps in the app; only failures need handling here.
      if (authError) {
        fail(
          authError.message === 'Invalid login credentials'
            ? 'Email or password is incorrect.'
            : `Couldn’t sign in. ${authError.message}`,
        );
      }
    } catch {
      fail('Couldn’t reach the server. Check your connection and try again.');
    }
  };

  const border = (field: 'email' | 'password') =>
    field === 'password' && error ? t.error : focused === field ? t.accent : t.hairline;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
      >
        <View
          style={[
            s.panel,
            { backgroundColor: t.balanceBg, minHeight: Math.min(height * 0.42, 360), paddingTop: insets.top + 24 },
          ]}
        >
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginBottom: 16 }}>
            <SunHorizon size={32} weight="duotone" color={t.onBalanceMuted} />
          </View>
          <Text style={[s.brand, { color: t.onBalance }]} accessibilityRole="header" accessibilityLabel="Avila Beach PH">
            {'Avila\nBeach PH'}
          </Text>
          <Text style={{ color: t.onBalanceMuted, fontSize: 16, marginTop: 8 }}>Resort finances</Text>
        </View>
        <Animated.View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[s.horizon, { backgroundColor: t.onBalanceMuted, transform: [{ scaleX: horizon }] }]}
        />

        <View style={s.form}>

          <View style={s.field}>
            <Text style={[s.label, { color: t.text }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="username"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
              accessibilityLabel="Email"
              style={[s.input, { backgroundColor: t.surface, color: t.text, borderColor: border('email') }]}
            />
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: t.text }]}>Password</Text>
            <View style={[s.input, s.row, { backgroundColor: t.surface, borderColor: border('password') }]}>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={signIn}
                accessibilityLabel="Password"
                style={{ flex: 1, paddingVertical: 14, color: t.text, fontSize: 16 }}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                accessibilityRole="switch"
                accessibilityLabel="Show password"
                accessibilityState={{ checked: showPassword }}
                hitSlop={4}
                style={({ pressed }) => [s.eye, pressed && { opacity: 0.6 }]}
              >
                {showPassword ? <EyeSlash size={22} color={t.muted} /> : <Eye size={22} color={t.muted} />}
              </Pressable>
            </View>
            {!!error && (
              <Text style={{ color: t.error, fontSize: 13 }} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
          </View>

          <Button label={busy ? 'Signing in' : 'Sign in'} onPress={signIn} disabled={!canSubmit} style={{ marginTop: 8 }} />

          <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19 }}>
            Forgot your password? Reset it in the Supabase dashboard under Authentication.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  // The sky ends in a straight horizon, so the panel has no radius; inputs keep 14 (see theme.ts).
  panel: { justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 32 },
  horizon: { height: 2, transformOrigin: 'left' },
  brand: { fontSize: 44, lineHeight: 46, fontWeight: '700', letterSpacing: -1.5 },
  form: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, gap: 18, width: '100%', maxWidth: 480, alignSelf: 'center' },
  field: { gap: 8 },
  label: { fontSize: 15, fontWeight: '600' },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
