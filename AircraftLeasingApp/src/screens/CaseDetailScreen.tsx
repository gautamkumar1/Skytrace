import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useApi } from '../hooks/useApi';
import { fetchCaseDetail } from '../api/endpoints';
import FindingCard from '../components/FindingCard';
import MetricCard from '../components/MetricCard';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import SeverityBadge from '../components/SeverityBadge';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { Images } from '../assets';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { formatDate, formatDateTime } from '../utils/format';
import { SEVERITY_ORDER } from '../utils/severity';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Tab = 'findings' | 'metrics' | 'documents';

export default function CaseDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'CaseDetail'>>();
  const { caseId } = route.params;
  const { data, loading, refresh } = useApi(() => fetchCaseDetail(caseId), [caseId]);
  const [tab, setTab] = useState<Tab>('findings');

  if (!data && !loading) return <EmptyState title="Case not found" />;

  const findings = data?.findings ?? [];
  const metrics = data?.engine_data ?? [];
  const docs = data?.documents ?? [];
  const grouped = SEVERITY_ORDER
    .map(s => ({ s, items: findings.filter(f => f.severity === s) }))
    .filter(g => g.items.length > 0);

  const tabs: { key: Tab; label: string; n: number }[] = [
    { key: 'findings', label: 'Findings', n: findings.length },
    { key: 'metrics', label: 'Metrics', n: metrics.length },
    { key: 'documents', label: 'Docs', n: docs.length },
  ];

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={C.blue} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      {data && (
        <AnimatedCard delay={0}>
          <View style={styles.hero}>
            <Text style={[T.hero, { color: C.blue }]}>{data.registration}</Text>
            <Text style={[T.bold, { color: C.t1, marginTop: 4 }]}>
              {data.aircraft_type}  {'\u00B7'}  {data.engine_type}
            </Text>
            <Text style={[T.cap, { color: C.t3, marginTop: 4 }]}>
              {data.case_id}  {'\u00B7'}  {formatDate(data.created_at)}
            </Text>
          </View>
        </AnimatedCard>
      )}

      {/* Segmented tab bar */}
      <AnimatedCard delay={80}>
        <View style={styles.tabBar}>
          {tabs.map(t => (
            <AnimatedButton
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, tab === t.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
              <View style={[styles.tabBadge, tab === t.key && styles.tabBadgeActive]}>
                <Text
                  style={[styles.tabBadgeText, tab === t.key && styles.tabBadgeTextActive]}
                >
                  {t.n}
                </Text>
              </View>
            </AnimatedButton>
          ))}
        </View>
      </AnimatedCard>

      {/* Tab content */}
      <View style={styles.content}>
        {/* Findings tab */}
        {tab === 'findings' && (
          findings.length === 0 ? (
            <EmptyState title="No findings" />
          ) : (
            grouped.map((g, gi) => (
              <View key={g.s}>
                <AnimatedCard delay={120 + gi * 60}>
                  <View style={styles.sevRow}>
                    <SeverityBadge severity={g.s} size="md" />
                    <Text style={[T.cap, { color: C.t3 }]}>{g.items.length}</Text>
                  </View>
                </AnimatedCard>
                {g.items.map((f, fi) => (
                  <FindingCard
                    key={f.id}
                    finding={f}
                    onFeedbackSent={refresh}
                    delay={150 + gi * 60 + fi * 50}
                  />
                ))}
              </View>
            ))
          )
        )}

        {/* Metrics tab */}
        {tab === 'metrics' && (
          metrics.length === 0 ? (
            <EmptyState title="No metrics" />
          ) : (
            metrics.map((m, i) => (
              <MetricCard key={m.id} m={m} delay={i * 40} />
            ))
          )
        )}

        {/* Documents tab */}
        {tab === 'documents' && (
          docs.length === 0 ? (
            <EmptyState title="No documents" />
          ) : (
            docs.map((d, i) => (
              <AnimatedCard key={d.id} delay={i * 50}>
                <View style={styles.docCard}>
                  <View style={styles.docIcon}>
                    <Text style={styles.docExt}>
                      {d.filename.split('.').pop()?.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[T.bold]} numberOfLines={1}>{d.filename}</Text>
                    <Text style={[T.cap, { color: C.t3 }]}>
                      {d.page_count} pages  {'\u00B7'}  {formatDateTime(d.created_at)}
                    </Text>
                  </View>
                </View>
              </AnimatedCard>
            ))
          )
        )}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: Spacing.lg,
    backgroundColor: C.bgCard,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
  },
  tabActive: {
    backgroundColor: C.bgGlass,
    ...C.shadow.card,
  },
  tabText: {
    ...T.capBold,
    color: C.t3,
  },
  tabTextActive: {
    color: C.t1,
  },
  tabBadge: {
    backgroundColor: C.divider,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: C.blue,
  },
  tabBadgeText: {
    ...T.tiny,
    color: C.t3,
  },
  tabBadgeTextActive: {
    color: C.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
  },
  sevRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: C.bgGlass,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow.card,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: C.blueGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docExt: {
    ...T.tiny,
    color: C.blue,
    fontWeight: '700',
  },
});
