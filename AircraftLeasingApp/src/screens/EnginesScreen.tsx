import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApi } from '../hooks/useApi';
import { fetchFleetHealth, fetchCaseDetail } from '../api/endpoints';
import HealthGauge from '../components/HealthGauge';
import MetricCard from '../components/MetricCard';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import EmptyState from '../components/EmptyState';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Images } from '../assets';
import type { FleetHealthCase, EngineMetric } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ST: Record<string, { label: string; color: string }> = {
  clean:        { label: 'Clean',    color: C.green },
  missing_link: { label: 'No Data',  color: C.t3 },
  advisory:     { label: 'Advisory', color: C.amber },
  fraud_risk:   { label: 'Critical', color: C.red },
};

export default function EnginesScreen() {
  const nav = useNavigation<Nav>();
  const { data: fleet, loading, refresh } = useApi(fetchFleetHealth);
  const [sel, setSel] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<EngineMetric[]>([]);
  const [mLoad, setMLoad] = useState(false);

  useEffect(() => {
    if (fleet?.length && !sel) setSel(fleet[0].case_id);
  }, [fleet]);

  useEffect(() => {
    if (!sel) { setMetrics([]); return; }
    setMLoad(true);
    fetchCaseDetail(sel)
      .then(d => setMetrics(d.engine_data))
      .catch(() => setMetrics([]))
      .finally(() => setMLoad(false));
  }, [sel]);

  const sc = fleet?.find(f => f.case_id === sel);
  const grp = {
    crit: metrics.filter(m => ['warning', 'critical', 'danger', 'flag'].includes(m.status.toLowerCase())),
    adv:  metrics.filter(m => ['advisory', 'caution'].includes(m.status.toLowerCase())),
    ok:   metrics.filter(m => ['ok', 'normal', ''].includes(m.status.toLowerCase())),
  };

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={C.blue} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Image source={Images.appIcon} style={{ width: 32, height: 32, borderRadius: 8 }} /><Text style={T.hero}>Engines</Text></View>
        <Text style={styles.sub}>Performance by aircraft</Text>
      </View>

      {/* Horizontal gauge carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gaugeRow}
      >
        {(fleet ?? []).map((c: FleetHealthCase, i: number) => {
          const st = ST[c.status] ?? ST.missing_link;
          const active = c.case_id === sel;
          return (
            <AnimatedCard key={c.case_id} delay={i * 60} slideFrom="right" distance={16}>
              <AnimatedButton onPress={() => setSel(c.case_id)} scaleDown={0.95}>
                <View style={[styles.gaugeCard, active && styles.gaugeActive]}>
                  <HealthGauge pct={c.health_pct} size={64} strokeWidth={4} delay={150 + i * 60} />
                  <Text style={styles.gaugeReg}>{c.registration}</Text>
                  <Text style={styles.gaugeType}>{c.aircraft_type}</Text>
                  <View style={[styles.statusDot, { backgroundColor: st.color }]} />
                </View>
              </AnimatedButton>
            </AnimatedCard>
          );
        })}
      </ScrollView>

      {/* Selected case detail */}
      {sc && (
        <View style={styles.detailSection}>
          <AnimatedCard delay={100}>
            <AnimatedButton onPress={() => nav.navigate('CaseDetail', { caseId: sc.case_id })}>
              <View style={styles.selCard}>
                <Text style={[T.h2]}>{sc.registration}</Text>
                <Text style={[T.bold, { color: C.t2 }]}>{sc.engine_type}</Text>
                <Text style={[T.cap, { color: C.t3, marginTop: 2 }]}>
                  {metrics.length} metric{metrics.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </AnimatedButton>
          </AnimatedCard>

          {mLoad ? (
            <ActivityIndicator style={{ padding: Spacing.huge }} color={C.blue} />
          ) : metrics.length === 0 ? (
            <EmptyState title="No metrics" subtitle="Upload documents to extract engine data" />
          ) : (
            <>
              {grp.crit.length > 0 && (
                <Text style={[T.label, styles.grpLabel, { color: C.red }]}>
                  CRITICAL ({grp.crit.length})
                </Text>
              )}
              {grp.crit.map((m, i) => (
                <MetricCard key={m.id} m={m} delay={150 + i * 40} />
              ))}

              {grp.adv.length > 0 && (
                <Text style={[T.label, styles.grpLabel, { color: C.amber }]}>
                  ADVISORY ({grp.adv.length})
                </Text>
              )}
              {grp.adv.map((m, i) => (
                <MetricCard key={m.id} m={m} delay={200 + i * 40} />
              ))}

              {grp.ok.length > 0 && (
                <Text style={[T.label, styles.grpLabel, { color: C.green }]}>
                  NORMAL ({grp.ok.length})
                </Text>
              )}
              {grp.ok.map((m, i) => (
                <MetricCard key={m.id} m={m} delay={250 + i * 40} />
              ))}
            </>
          )}
        </View>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  sub: {
    ...T.body,
    color: C.t3,
    marginTop: 2,
  },
  gaugeRow: {
    gap: Spacing.sm,
    paddingHorizontal: 20,
    paddingBottom: Spacing.lg,
  },
  gaugeCard: {
    backgroundColor: C.bgGlass,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow.card,
  },
  gaugeActive: {
    borderColor: C.blue,
    borderWidth: 2,
  },
  gaugeReg: {
    ...T.capBold,
    color: C.t1,
    marginTop: Spacing.sm,
  },
  gaugeType: {
    ...T.tiny,
    color: C.t3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  detailSection: {
    paddingHorizontal: 20,
  },
  selCard: {
    backgroundColor: C.bgGlass,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow.card,
  },
  grpLabel: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
});
