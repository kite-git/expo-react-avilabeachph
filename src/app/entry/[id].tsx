import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { EntryForm } from '../../components/EntryForm';
import { EmptyState } from '../../components/Screen';
import { useTransactions } from '../../store';
import { useTheme } from '../../theme';

export default function EditEntry() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useTransactions().entries.find((e) => e.id === id);
  if (!entry) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: t.bg }}>
        <EmptyState>This entry no longer exists. It may have been deleted.</EmptyState>
      </View>
    );
  }
  return <EntryForm kind={entry.kind} initial={entry} />;
}
