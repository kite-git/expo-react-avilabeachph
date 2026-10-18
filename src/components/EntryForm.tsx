import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Entry, Kind } from '../format';
import { parseAmount } from '../money';
import { useTransactions } from '../store';
import { useTheme } from '../theme';
import { Button, Chip } from './Controls';
import { EmptyState } from './Screen';

const titles = {
  in: { add: 'Cash in', edit: 'Edit cash in', save: 'Save cash in', example: 'Villa 2 booking, Santos family' },
  out: { add: 'Add expense', edit: 'Edit expense', save: 'Save expense', example: 'Generator diesel refill' },
};

export function EntryForm({ kind, initial }: { kind: Kind; initial?: Entry }) {
  const t = useTheme();
  const { categories: allCategories, methods, addEntry, updateEntry, removeEntry } = useTransactions();
  const categories = allCategories.filter((c) => c.kind === kind);
  const copy = titles[kind];

  const [amountText, setAmountText] = useState(initial ? initial.amount.toFixed(2) : '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id);
  const [methodId, setMethodId] = useState(initial?.methodId ?? methods[0]?.id);
  const [touched, setTouched] = useState({ amount: false, title: false });
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!categories.length || !methods.length) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: t.bg }}>
        <EmptyState>Categories and payment methods haven’t loaded yet. Close this and try again.</EmptyState>
      </View>
    );
  }

  const amount = parseAmount(amountText);
  const amountError = touched.amount && amount === null ? 'Enter an amount above ₱0 with up to 2 decimals.' : '';
  const titleError = touched.title && !title.trim() ? 'Add a short description.' : '';
  const valid = amount !== null && title.trim().length > 0 && !!categoryId && !!methodId;

  const save = async () => {
    if (!valid || busy || amount === null || !categoryId || !methodId) return;
    setBusy(true);
    setSaveError('');
    try {
      const input = { title: title.trim(), amount, categoryId, methodId };
      if (initial) await updateEntry(initial.id, input);
      else await addEntry(input);
      router.back();
    } catch (e) {
      setSaveError(`Couldn’t save. ${(e as Error).message}`);
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (!initial) return;
    Alert.alert('Delete this entry?', `${initial.title} will be removed from your records.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await removeEntry(initial.id);
            router.back();
          } catch (e) {
            setSaveError(`Couldn’t delete. ${(e as Error).message}`);
            setBusy(false);
          }
        },
      },
    ]);
  };

  const inputStyle = (error: string) => [
    s.input,
    { backgroundColor: t.surface, color: t.text, borderColor: error ? t.error : t.hairline },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={[s.title, { color: t.text }]}>{initial ? copy.edit : copy.add}</Text>

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
                autoFocus={!initial}
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
              placeholder={copy.example}
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
                <Chip key={c.id} label={c.name} selected={c.id === categoryId} onPress={() => setCategoryId(c.id)} />
              ))}
            </View>
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: t.text }]}>Paid {kind === 'in' ? 'by' : 'with'}</Text>
            <View style={s.chips} accessibilityRole="radiogroup">
              {methods.map((m) => (
                <Chip key={m.id} label={m.name} selected={m.id === methodId} onPress={() => setMethodId(m.id)} />
              ))}
            </View>
          </View>

          {initial && (
            <Pressable
              onPress={confirmDelete}
              disabled={busy}
              accessibilityRole="button"
              style={({ pressed }) => [s.delete, { borderColor: t.hairline }, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Text style={{ color: t.error, fontSize: 16, fontWeight: '600' }}>Delete entry</Text>
            </Pressable>
          )}
        </ScrollView>
        <View style={[s.footer, { borderTopColor: t.hairline }]}>
          {!!saveError && (
            <Text style={[s.error, { color: t.error }]} accessibilityLiveRegion="polite">
              {saveError}
            </Text>
          )}
          <Button label={busy ? 'Saving' : copy.save} onPress={save} disabled={!valid || busy} />
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
  delete: { height: 52, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  footer: { padding: 20, paddingBottom: 12, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
