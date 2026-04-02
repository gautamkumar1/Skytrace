import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, StatusBar, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApi } from '../hooks/useApi';
import { fetchStats } from '../api/endpoints';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedBar from '../components/AnimatedBar';
import AnimatedNumber from '../components/AnimatedNumber';
import AnimatedButton from '../components/AnimatedButton';
import PulsingDot from '../components/PulsingDot';
import CollapsibleHeader from '../components/CollapsibleHeader';
import EmptyState from '../components/EmptyState';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import { Images } from '../assets';
import { formatConfidence } from '../utils/format';
import { sevColor, SEVERITY_ORDER } from '../utils/severity';
import type { RecentFinding } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, refresh } = useApi(fetchStats);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  if (!data && !loading) return <EmptyState title="Unable to load" />;

  const s = data;
  const sev = s?.severity_counts ?? {};
  const total = s?.total_findings ?? 0;
  const stops = sev.STOP ?? 0;
  const flags = sev.FLAG ?? 0;
  const eff = Math.max(0, 100 - stops * 12 - flags * 5 - (sev.ADVISORY ?? 0) * 2);

  const findings = [...(s?.recent_findings ?? [])].sort((a, b) =>
    a.severity === 'STOP' ? -1 : b.severity === 'STOP' ? 1 : 0);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <CollapsibleHeader title="OriginTrace" subtitle="Fleet operations overview" scrollY={scrollY} logo={Images.appIcon} />

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={C.blue} progressBackgroundColor={C.bg} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        {/* Stats row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          <StatCard label="Active Assets" value={s?.total_cases ?? 0} gradient={C.gradBlue} delay={100} />
          <StatCard label="Risk Points" value={total} gradient={C.gradRed} delay={180} />
          <StatCard label="Data Sources" value={s?.total_documents ?? 0} gradient={C.gradCyan} delay={260} />
          <StatCard label="Engine Metrics" value={s?.total_engine_metrics ?? 0} gradient={C.gradGreen} delay={340} />
        </ScrollView>

        {/* Alert */}
        {stops > 0 && (
          <AnimatedCard delay={400}>
            <AnimatedButton onPress={() => nav.navigate('Tabs', { screen: 'Issues' })}>
              <View style={styles.alert}>
                <PulsingDot color={C.red} size={8} />
                <Text style={styles.alertText}>{stops} critical finding{stops > 1 ? 's' : ''} require review</Text>
                <Text style={styles.alertArrow}>{'\u203A'}</Text>
              </View>
            </AnimatedButton>
          </AnimatedCard>
        )}

        {/* Severity */}
        <AnimatedCard delay={450}><Text style={styles.section}>SEVERITY BREAKDOWN</Text></AnimatedCard>
        <View style={styles.sevGrid}>
          {SEVERITY_ORDER.map((sv, i) => {
            const count = sev[sv] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            const c = sevColor(sv);
            return (
              <AnimatedCard key={sv} delay={500 + i * 80} style={{ width: '48%' }}>
                <View style={[styles.sevCard, { borderLeftColor: c.color }]}>
                  <AnimatedNumber value={count} style={[styles.sevNum, { color: c.color }]} delay={550 + i * 80} />
                  <Text style={[styles.sevLabel, { color: c.color }]}>{sv}</Text>
                  <AnimatedBar percent={pct} color={c.color} height={3} delay={600 + i * 80} bgColor={C.border} />
                </View>
              </AnimatedCard>
            );
          })}
        </View>

        {/* Efficiency */}
        <AnimatedCard delay={850}>
          <View style={styles.effCard}>
            <View>
              <Text style={styles.effLabel}>FLEET EFFICIENCY</Text>
              <Text style={styles.effSub}>Weighted by active findings</Text>
            </View>
            <AnimatedNumber value={eff} suffix="%" delay={900}
              style={[styles.effNum, { color: eff >= 80 ? C.green : eff >= 50 ? C.amber : C.red }]} />
          </View>
        </AnimatedCard>

        {/* Findings */}
        <AnimatedCard delay={950}>
          <View style={styles.sectionRow}>
            <Text style={styles.section}>RECENT FINDINGS</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{findings.length}</Text></View>
          </View>
        </AnimatedCard>
        {findings.map((f: RecentFinding, i: number) => (
          <AnimatedCard key={f.id} delay={1000 + i * 70}>
            <AnimatedButton onPress={() => nav.navigate('CaseDetail', { caseId: f.case_id })} scaleDown={0.985}>
              <View style={styles.fCard}>
                <View style={styles.fTop}>
                  <SeverityBadge severity={f.severity} />
                  <Text style={styles.fConf}>{formatConfidence(f.confidence)}</Text>
                </View>
                <Text style={styles.fTitle} numberOfLines={1}>{f.title}</Text>
                <Text style={styles.fMeta}>{f.registration}  ·  {f.aircraft_type}  ·  {f.category}</Text>
              </View>
            </AnimatedButton>
          </AnimatedCard>
        ))}
        <View style={{ height: 32 }} />
      </AnimatedScrollView>
    </View>
  );
}

const P = 20;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  statsRow: { gap: 10, paddingHorizontal: P, paddingBottom: 16 },
  alert: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: P, backgroundColor: C.redBg, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', marginBottom: 8,
  },
  alertText: { ...T.bold, color: C.red, flex: 1, fontSize: 14 },
  alertArrow: { fontSize: 20, color: C.red },
  section: { ...T.label, paddingHorizontal: P, marginTop: 24, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: P, marginTop: 24, marginBottom: 12 },
  badge: { backgroundColor: C.bgGlass, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { ...T.tiny, color: C.t3 },
  sevGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: P },
  sevCard: { backgroundColor: C.bgGlass, borderRadius: 14, padding: 16, borderLeftWidth: 3, borderWidth: 1, borderColor: C.border },
  sevNum: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  sevLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  effCard: {
    backgroundColor: C.bgGlass, borderRadius: 14, padding: 20,
    marginHorizontal: P, marginTop: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  effLabel: { ...T.label },
  effSub: { ...T.cap, color: C.t4, marginTop: 2 },
  effNum: { fontSize: 40, fontWeight: '800', letterSpacing: -1.5 },
  fCard: {
    backgroundColor: C.bgGlass, borderRadius: 14, padding: 16,
    marginHorizontal: P, marginBottom: 8, borderWidth: 1, borderColor: C.border,
  },
  fTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fTitle: { ...T.bold },
  fMeta: { ...T.cap, color: C.t4, marginTop: 4 },
  fConf: { ...T.capBold },
});
