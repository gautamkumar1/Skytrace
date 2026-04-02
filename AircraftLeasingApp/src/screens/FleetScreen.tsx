import React, { useMemo, useState } from 'react';
import { View, Text, Image, SectionList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApi } from '../hooks/useApi';
import { fetchFleet } from '../api/endpoints';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedBar from '../components/AnimatedBar';
import EmptyState from '../components/EmptyState';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import { Images } from '../assets';
import { Spacing, Radius } from '../theme/spacing';
import type { FleetSummaryRow } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FleetScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, refresh } = useApi(fetchFleet);
  const [groupBy, setGroupBy] = useState<'aircraft' | 'engine'>('aircraft');

  const sections = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, FleetSummaryRow[]>();
    data.forEach(r => {
      const k = groupBy === 'aircraft' ? r.aircraft_type : r.engine_type;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    return Array.from(map.entries()).map(([title, items]) => ({ title, data: items }));
  }, [data, groupBy]);

  const healthScore = (r: FleetSummaryRow) => Math.max(0, 100 - Number(r.finding_count) * 10);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image source={Images.appIcon} style={{ width: 32, height: 32, borderRadius: 8 }} />
          <View>
            <Text style={T.hero}>Fleet</Text>
            <Text style={styles.sub}>{data?.length ?? 0} aircraft in portfolio</Text>
          </View>
        </View>
        <View style={styles.toggle}>
          {(['aircraft', 'engine'] as const).map(g => (
            <AnimatedButton
              key={g}
              onPress={() => setGroupBy(g)}
              style={[styles.pill, groupBy === g && styles.pillActive]}
            >
              <Text style={[styles.pillText, groupBy === g && styles.pillTextActive]}>
                {g === 'aircraft' ? 'Type' : 'Engine'}
              </Text>
            </AnimatedButton>
          ))}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={i => i.case_id}
        stickySectionHeadersEnabled={false}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={C.blue} />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.secHeader}>
            <Text style={[T.label, { color: C.blue }]}>{section.title}</Text>
            <Text style={styles.secCount}>{section.data.length}</Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          const h = healthScore(item);
          const fc = Number(item.finding_count);
          const fcColor = fc === 0 ? C.green : fc < 3 ? C.amber : C.red;
          return (
            <AnimatedCard delay={index * 50} slideFrom="bottom" distance={10}>
              <AnimatedButton
                onPress={() => nav.navigate('CaseDetail', { caseId: item.case_id })}
                scaleDown={0.985}
              >
                <View style={styles.row}>
                  <View style={styles.rowTop}>
                    <View>
                      <Text style={[T.h3]}>{item.registration}</Text>
                      <Text style={[T.mono, { fontSize: 11, marginTop: 2 }]}>{item.case_id}</Text>
                    </View>
                    <View style={[styles.fcBadge, { borderColor: fcColor }]}>
                      <View style={[styles.fcDot, { backgroundColor: fcColor }]} />
                      <Text style={[T.tiny, { color: fcColor }]}>
                        {fc} finding{fc !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chips}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{item.doc_count} docs</Text>
                    </View>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{item.engine_metric_count} metrics</Text>
                    </View>
                  </View>
                  <AnimatedBar
                    percent={h}
                    height={3}
                    delay={80 + index * 50}
                    color={h >= 80 ? C.green : h >= 50 ? C.amber : C.red}
                  />
                </View>
              </AnimatedButton>
            </AnimatedCard>
          );
        }}
        ListEmptyComponent={<EmptyState title="No fleet data" />}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  sub: {
    ...T.body,
    color: C.t3,
    marginTop: 2,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: C.bgGlass,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.border,
    padding: 3,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  pillActive: {
    backgroundColor: C.blue,
  },
  pillText: {
    ...T.capBold,
    color: C.t3,
  },
  pillTextActive: {
    color: C.white,
  },
  secHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  secCount: {
    ...T.tiny,
    color: C.t3,
  },
  row: {
    backgroundColor: C.bgGlass,
    marginHorizontal: 20,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow.card,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  fcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  fcDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    backgroundColor: C.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  chipText: {
    ...T.tiny,
    color: C.t3,
  },
});
