import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Controls';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme';

export default function SignIn() {
  const t = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
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

  const input = [s.input, { backgroundColor: t.surface, color: t.text, borderColor: error ? t.error : t.hairline }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ gap: 4, marginBottom: 12 }}>
          <Text style={[s.title, { color: t.text }]}>Avila Beach PH</Text>
          <Text style={{ color: t.muted, fontSize: 15 }}>Sign in to manage the resort’s finances.</Text>
        </View>

        <View style={s.field}>
          <Text style={[s.label, { color: t.text }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="username"
            accessibilityLabel="Email"
            style={input}
          />
        </View>

        <View style={s.field}>
          <Text style={[s.label, { color: t.text }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            accessibilityLabel="Password"
            onSubmitEditing={signIn}
            style={input}
          />
          {!!error && (
            <Text style={{ color: t.error, fontSize: 13 }} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
        </View>

        <Button
          label={busy ? 'Signing in' : 'Sign in'}
          onPress={signIn}
          disabled={busy || !email.trim() || !password}
          style={{ marginTop: 8 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: 'center', gap: 18 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -0.8 },
  field: { gap: 8 },
  label: { fontSize: 15, fontWeight: '600' },
  input: { height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
});
