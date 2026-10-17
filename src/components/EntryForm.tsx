import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { expenses, incomeSources, paymentMethods } from '../data';
import { parseAmount } from '../money';
import { useTransactions } from '../store';
import { useTheme } from '../theme';
import { Button, Chip } from './Controls';

const categoriesFor = {
  in: incomeSources,
  out: expenses.map(({ label, icon }) => ({ label, icon })),
};

export function EntryForm({ kind }: { kind: 'in' | 'out' }) {
  const t = useTheme();
  const { addEntry } = useTransactions();
  const categories = categoriesFor[kind];
  const [amountText, setAmountText] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0].label);
  const [method, setMethod] = useState(paymentMethods[0]);
  const [touched, setTouched] = useState({ amount: false, title: false });

  const amount = parseAmount(amountText);
  const amountError = touched.amount && amount === null ? 'Enter an amount above ₱0 with up to 2 decimals.' : '';
  const titleError = touched.title && !title.trim() ? 'Add a short description.' : '';
  const valid = amount !== null && title.trim().length > 0;

  const save = () => {
    if (!valid) return;
    addEntry({
      title: title.trim(),
      amount: kind === 'in' ? amount : -amount,
      category,
      method,
      icon: categories.find((c) => c.label === category)!.icon,
    });
    router.back();
  };

  const inputStyle = (error: string) => [
    s.input,
    { backgroundColor: t.surface, color: t.text, borderColor: error ? t.error : t.hairline },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={[s.title, { color: t.text }]}>{kind === 'in' ? 'Cash in' : 'Add expense'}</Text>

          <View style={s.field}>
            <Text style={[s.label, { color: t.text }]}>Amount</Text>
            <View>
              <Text style={[s.prefix, { color: t.muted }]}>₱</Text>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                onBlur={() => setTouched((x) => ({ ...x, amount: true }))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={t.muted}
                accessibilityLabel="Amount in pesos"
                autoFocus
                style={[inputStyle(amountError), s.amountInput]}
              />
            </View>
            {!!amountError && <Text style={[s.error, { color: t.error }]}>{amountError}</Text>}
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: t.text }]}>Description</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              onBlur={() => setTouched((x) => ({ ...x, title: true }))}
              placeholder={kind === 'in' ? 'Villa 2 booking, Santos family' : 'Generator diesel refill'}
              placeholderTextColor={t.muted}
              accessibilityLabel="Description"
              maxLength={60}
              style={inputStyle(titleError)}
            />
            {!!titleError && <Text style={[s.error, { color: t.error }]}>{titleError}</Text>}
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: t.text }]}>{kind === 'in' ? 'Source' : 'Category'}</Text>
            <View style={s.chips} accessibilityRole="radiogroup">
              {categories.map((c) => (
                <Chip key={c.label} label={c.label} selected={c.label === category} onPress={() => setCategory(c.label)} />
              ))}
            </View>
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: t.text }]}>Paid {kind === 'in' ? 'by' : 'with'}</Text>
            <View style={s.chips} accessibilityRole="radiogroup">
              {paymentMethods.map((m) => (
                <Chip key={m} label={m} selected={m === method} onPress={() => setMethod(m)} />
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={[s.footer, { borderTopColor: t.hairline }]}>
          <Button label={kind === 'in' ? 'Save cash in' : 'Save expense'} onPress={save} disabled={!valid} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, gap: 22 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.6, marginTop: 8 },
  field: { gap: 8 },
  label: { fontSize: 15, fontWeight: '600' },
  input: { height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  prefix: { position: 'absolute', left: 16, top: 0, bottom: 0, zIndex: 1, fontSize: 22, lineHeight: 52, fontWeight: '600' },
  amountInput: { paddingLeft: 38, fontSize: 22, fontWeight: '600', fontVariant: ['tabular-nums'] },
  error: { fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { padding: 20, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
