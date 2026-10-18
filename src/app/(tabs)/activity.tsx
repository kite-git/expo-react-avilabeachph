import { View } from 'react-native';
import { ActivityRow } from '../../components/ActivityRow';
import { EmptyState, Loaded, Screen } from '../../components/Screen';
import { useTransactions } from '../../store';
import { useTheme } from '../../theme';

export default function ActivityScreen() {
  const t = useTheme();
  const { entries } = useTransactions();
  return (
    <Screen title="Activity" subtitle="All income and expenses. Tap one to edit.">
      <Loaded>
        {entries.length === 0 ? (
          <EmptyState>No transactions yet. Tap + to record your first one.</EmptyState>
        ) : (
          <View style={{ backgroundColor: t.surface, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 6 }}>
            {entries.map((a, i) => (
              <ActivityRow key={a.id} item={a} divider={i > 0} />
            ))}
          </View>
        )}
      </Loaded>
    </Screen>
  );
}
