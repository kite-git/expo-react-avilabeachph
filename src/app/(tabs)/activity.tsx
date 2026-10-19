import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityRow } from '../../components/ActivityRow';
import { EmptyState, Loaded, Screen, ScreenHeader, screenPadding, usePullToRefresh } from '../../components/Screen';
import { groupByDay } from '../../format';
import { useTransactions } from '../../store';
import { signed, useTheme } from '../../theme';

const TITLE = 'Activity';
const SUBTITLE = 'All income and expenses. Tap one to edit.';
const time = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export default function ActivityScreen() {
  const t = useTheme();
  const { status, entries } = useTransactions();
  const refreshControl = usePullToRefresh();
  const days = useMemo(() => groupByDay(entries), [entries]);

  if (status !== 'ready' || entries.length === 0) {
    return (
      <Screen title={TITLE} subtitle={SUBTITLE}>
        <Loaded>
          <EmptyState>No transactions yet. Tap + to record your first one.</EmptyState>
        </Loaded>
      </Screen>
    );
  }

  // Each day reads as one card: the first and last rows carry the corner radius.
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <SectionList
        sections={days}
        keyExtractor={(e) => e.id}
        contentContainerStyle={screenPadding}
        refreshControl={refreshControl}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={<ScreenHeader title={TITLE} subtitle={SUBTITLE} />}
        renderSectionHeader={({ section }) => (
          <View style={s.dayHead}>
            <Text style={[s.dayTitle, { color: t.text }]}>{section.title}</Text>
            <Text style={[s.dayNet, { color: t.muted }]} accessibilityLabel={`Net ${signed(section.net)}`}>
              {signed(section.net)}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View
            style={[
              s.group,
              { backgroundColor: t.surface },
              index === 0 && s.first,
              index === section.data.length - 1 && s.last,
            ]}
          >
            <ActivityRow item={item} divider={index > 0} subtitle={`${item.category}, ${time(item.occurredAt)}`} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  dayHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    paddingTop: 20,
    paddingBottom: 8,
  },
  dayTitle: { fontSize: 15, fontWeight: '600' },
  dayNet: { fontSize: 13, fontVariant: ['tabular-nums'] },
  group: { paddingHorizontal: 18 },
  first: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: 6 },
  last: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16, paddingBottom: 6 },
});
