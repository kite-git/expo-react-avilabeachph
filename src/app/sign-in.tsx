import { useRef, useState, type ComponentRef } from 'react';
import {
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

  const canSubmit = !busy && !!email.trim() && !!password;

  const signIn = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      // On success the auth listener swaps in the app; only failures need handling here.
      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'Email or password is incorrect.'
            : `Couldn’t sign in. ${authError.message}`,
        );
        setBusy(false);
      }
    } catch {
      setError('Couldn’t reach the server. Check your connection and try again.');
      setBusy(false);
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
            { backgroundColor: t.balanceBg, minHeight: height * 0.42, paddingTop: insets.top + 24 },
          ]}
        >
          <View style={[s.tile, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
            <SunHorizon size={28} weight="duotone" color={t.onBalanceMuted} />
          </View>
          <Text style={[s.brand, { color: t.onBalance }]} accessibilityRole="header">
            Avila Beach PH
          </Text>
          <Text style={{ color: t.onBalanceMuted, fontSize: 16, marginTop: 4 }}>Resort finances</Text>
        </View>

        <View style={s.form}>
          <Text style={[s.heading, { color: t.text }]}>Sign in</Text>

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
                style={{ flex: 1, height: '100%', color: t.text, fontSize: 16 }}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={4}
                style={s.eye}
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
            This app has one account. Ask the owner if you need access.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  // Radius rule: balance card 20, inputs 14, icon tiles 12 (see theme.ts).
  panel: {
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  tile: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  brand: { fontSize: 34, fontWeight: '700', letterSpacing: -0.9 },
  form: { padding: 24, gap: 18 },
  heading: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  field: { gap: 8 },
  label: { fontSize: 15, fontWeight: '600' },
  input: { height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
