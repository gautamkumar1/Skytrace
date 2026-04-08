import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
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
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import { Images } from '../assets';
import { formatConfidence } from '../utils/format';
import { sevColor, SEVERITY_ORDER } from '../utils/severity';
import { getRecentCases, onRecentChange } from '../utils/recentlyViewed';
import type { Case, RecentFinding } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, refresh } = useApi(fetchStats);
  const [recentCases, setRecentCases] = useState<Case[]>(getRecentCases());

  // Refresh recently viewed when screen is focused or list changes
  useFocusEffect(React.useCallback(() => { setRecentCases(getRecentCases()); }, []));
  useEffect(() => onRecentChange(() => setRecentCases(getRecentCases())), []);

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
      <StatusBar barStyle="dark-content" backgroundColor={C.bgCard} />
      <PageHeader heading="Fleet Overview" label="Dashboard">
        <View style={styles.tagline}>
          <Text style={styles.taglineText}>Records Risk Intelligence</Text>
        </View>
      </PageHeader>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={C.blue} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
      >
        {/* Stats row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          <StatCard label="Active Assets" value={s?.total_cases ?? 0} gradient={C.gradBlue} delay={80} />
          <StatCard label="Risk Points" value={total} gradient={C.gradRed} delay={140} />
          <StatCard label="Data Sources" value={s?.total_documents ?? 0} gradient={C.gradCyan} delay={200} />
          <StatCard label="Engine Metrics" value={s?.total_engine_metrics ?? 0} gradient={C.gradGreen} delay={260} />
        </ScrollView>

        {/* Alert */}
        {stops > 0 && (
          <AnimatedCard delay={300}>
            <AnimatedButton onPress={() => nav.navigate('Tabs', { screen: 'Issues' })}>
              <View style={styles.alert}>
                <PulsingDot color={C.red} size={8} />
                <Text style={styles.alertText}>{stops} critical finding{stops > 1 ? 's' : ''} require review</Text>
                <Text style={styles.alertArrow}>{'\u203A'}</Text>
              </View>
            </AnimatedButton>
          </AnimatedCard>
        )}

        {/* Records Upload */}
        <AnimatedCard delay={320}>
          <AnimatedButton onPress={() => nav.navigate('Tabs', { screen: 'Upload' })} scaleDown={0.985}>
            <View style={styles.uploadBox}>
              <View style={styles.uploadIcon}><Text style={styles.uploadIconText}>{'\u21E7'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTitle}>Records Upload</Text>
                <Text style={styles.uploadSub}>Upload technical documents for AI analysis</Text>
              </View>
              <Text style={styles.uploadArrow}>{'\u203A'}</Text>
            </View>
          </AnimatedButton>
        </AnimatedCard>

        {/* Recently Viewed */}
        {recentCases.length > 0 && (
          <>
            <AnimatedCard delay={350}><Text style={styles.section}>RECENTLY VIEWED</Text></AnimatedCard>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
              {recentCases.map((rc, i) => (
                <AnimatedCard key={rc.case_id} delay={380 + i * 50} slideFrom="right">
                  <AnimatedButton onPress={() => nav.navigate('CaseDetail', { caseId: rc.case_id })} scaleDown={0.97}>
                    <View style={styles.recentCard}>
                      <Text style={styles.recentReg}>{rc.registration}</Text>
                      <Text style={styles.recentType}>{rc.aircraft_type}</Text>
                      <Text style={styles.recentCase}>{rc.case_id}</Text>
                    </View>
                  </AnimatedButton>
                </AnimatedCard>
              ))}
            </ScrollView>
          </>
        )}

        {/* Severity */}
        <AnimatedCard delay={450}><Text style={styles.section}>SEVERITY BREAKDOWN</Text></AnimatedCard>
        <View style={styles.sevGrid}>
          {SEVERITY_ORDER.map((sv, i) => {
            const count = sev[sv] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            const c = sevColor(sv);
            return (
              <AnimatedCard key={sv} delay={400 + i * 60} style={{ width: '48%' }}>
                <View style={[styles.sevCard, { borderLeftColor: c.color }]}>
                  <AnimatedNumber value={count} style={[styles.sevNum, { color: c.color }]} delay={420 + i * 60} />
                  <Text style={[styles.sevLabel, { color: c.color }]}>{sv}</Text>
                  <AnimatedBar percent={pct} color={c.color} height={3} delay={440 + i * 60} bgColor={C.border} />
                </View>
              </AnimatedCard>
            );
          })}
        </View>

        {/* Efficiency */}
        <AnimatedCard delay={650}>
          <View style={styles.effCard}>
            <View>
              <Text style={styles.effLabel}>Fleet Efficiency</Text>
              <Text style={styles.effSub}>Weighted by active findings</Text>
            </View>
            <AnimatedNumber value={eff} suffix="%" delay={700}
              style={[styles.effNum, { color: eff >= 80 ? C.green : eff >= 50 ? C.amber : C.red }]} />
          </View>
        </AnimatedCard>

        {/* Findings */}
        <AnimatedCard delay={750}>
          <View style={styles.sectionRow}>
            <Text style={styles.section}>RECENT FINDINGS</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{findings.length}</Text></View>
          </View>
        </AnimatedCard>
        {findings.map((f: RecentFinding, i: number) => (
          <AnimatedCard key={f.id} delay={800 + i * 50}>
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
      </ScrollView>
    </View>
  );
}

const P = 20;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  tagline: { paddingBottom: 8 },
  taglineText: { fontSize: 16, fontWeight: '600', color: C.blue, letterSpacing: 0.3 },
  uploadBox: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: P, backgroundColor: C.bgCard, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: C.border,
    ...C.shadow.card, marginBottom: 4,
  },
  uploadIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center' as const, alignItems: 'center' as const },
  uploadIconText: { fontSize: 20, color: C.blue },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: C.t1 },
  uploadSub: { fontSize: 13, fontWeight: '400', color: C.t3, marginTop: 1 },
  uploadArrow: { fontSize: 22, color: C.t4 },
  recentRow: { gap: 10, paddingHorizontal: P, paddingBottom: 4 },
  recentCard: {
    backgroundColor: C.bgCard, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: C.border, width: 140,
    ...C.shadow.card,
  },
  recentReg: { fontSize: 16, fontWeight: '700', color: C.blue },
  recentType: { fontSize: 12, fontWeight: '500', color: C.t2, marginTop: 2 },
  recentCase: { fontSize: 11, fontWeight: '500', color: C.t4, marginTop: 4, fontFamily: 'monospace' },
  statsRow: { gap: 10, paddingHorizontal: P, paddingBottom: 12 },
  alert: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: P, backgroundColor: C.redBg, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  alertText: { ...T.bold, color: C.red, flex: 1, fontSize: 14 },
  alertArrow: { fontSize: 20, color: C.red },
  section: { ...T.label, color: C.t3, paddingHorizontal: P, marginTop: 20, marginBottom: 10 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: P, marginTop: 20, marginBottom: 10 },
  badge: { backgroundColor: C.bgInput, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { ...T.tiny, color: C.t3 },
  sevGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: P },
  sevCard: { backgroundColor: C.bgCard, borderRadius: 14, padding: 16, borderLeftWidth: 3, borderWidth: 1, borderColor: C.border, ...C.shadow.card },
  sevNum: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  sevLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  effCard: {
    backgroundColor: C.bgCard, borderRadius: 14, padding: 20,
    marginHorizontal: P, marginTop: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: C.border, ...C.shadow.card,
  },
  effLabel: { ...T.bold, fontSize: 16, color: C.t1 },
  effSub: { ...T.cap, color: C.t3, marginTop: 2 },
  effNum: { fontSize: 40, fontWeight: '800', letterSpacing: -1.5 },
  fCard: {
    backgroundColor: C.bgCard, borderRadius: 14, padding: 16,
    marginHorizontal: P, marginBottom: 8, borderWidth: 1, borderColor: C.border, ...C.shadow.card,
  },
  fTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fTitle: { ...T.bold, color: C.t1 },
  fMeta: { ...T.cap, color: C.t3, marginTop: 4 },
  fConf: { ...T.capBold, color: C.t2 },
});
