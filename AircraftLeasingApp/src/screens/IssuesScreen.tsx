import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { fetchCases, fetchCaseDetail } from '../api/endpoints';
import FindingCard from '../components/FindingCard';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedNumber from '../components/AnimatedNumber';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import type { Finding } from '../types';

type Filter = 'ALL' | 'STOP' | 'FLAG';

export default function IssuesScreen() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cases = await fetchCases();
      const details = await Promise.all(
        cases.map(c => fetchCaseDetail(c.case_id).catch(() => null)),
      );
      const issues: Finding[] = [];
      details.forEach(d =>
        d?.findings.forEach(f => {
          if (f.severity === 'STOP' || f.severity === 'FLAG') issues.push(f);
        }),
      );
      issues.sort((a, b) => {
        if (a.severity === 'STOP' && b.severity !== 'STOP') return -1;
        if (b.severity === 'STOP' && a.severity !== 'STOP') return 1;
        return 0;
      });
      setFindings(issues);
    } catch (e: any) { console.warn('Issues load failed:', e.message); } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? findings : findings.filter(f => f.severity === filter)),
    [findings, filter],
  );
  const stops = findings.filter(f => f.severity === 'STOP').length;
  const flags = findings.filter(f => f.severity === 'FLAG').length;

  return (
    <View style={styles.screen}>
      {/* Sticky header: title + summary + filters */}
      <View style={styles.stickyHeader}>
        <PageHeader title="Issues" subtitle="Critical findings across fleet" />

        <View style={styles.summaryRow}>
          <View style={styles.sumOuter}>
            <LinearGradient colors={[...C.gradRed]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sumCard}>
              <AnimatedNumber value={stops} style={styles.sumNum} delay={100} />
              <Text style={styles.sumLabel}>STOP</Text>
            </LinearGradient>
          </View>
          <View style={styles.sumOuter}>
            <LinearGradient colors={[...C.gradAmber]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sumCard}>
              <AnimatedNumber value={flags} style={styles.sumNum} delay={150} />
              <Text style={styles.sumLabel}>FLAG</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['ALL', 'STOP', 'FLAG'] as Filter[]).map(f => (
            <TouchableOpacity key={f} activeOpacity={0.7} onPress={() => setFilter(f)} style={[styles.fBtn, filter === f && styles.fActive]}>
              <Text style={[styles.fText, filter === f && styles.fTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <Text style={styles.countLabel}>{filtered.length} issues</Text>
        </View>
      </View>

      {/* Scrollable findings list */}
      {loading ? (
        <ActivityIndicator style={{ padding: Spacing.huge }} color={C.blue} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={f => f.id}
          maxToRenderPerBatch={8}
          windowSize={7}
          renderItem={({ item, index }) => (
            <View style={styles.cardWrap}>
              <FindingCard finding={item} showCase onFeedbackSent={load} delay={index * 50} />
            </View>
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={C.blue} />}
          ListEmptyComponent={<EmptyState title="All clear" subtitle="No outstanding issues" />}
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  stickyHeader: { backgroundColor: C.bg, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: C.border },
  titleRow: { paddingHorizontal: 20, paddingTop: Spacing.xl },
  sub: { ...T.body, color: C.t3, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: 20, marginTop: Spacing.md },
  sumOuter: { flex: 1, ...C.shadow.card },
  sumCard: { borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' },
  sumNum: { fontSize: 28, fontWeight: '800', color: C.white },
  sumLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: Spacing.sm, marginTop: Spacing.md, alignItems: 'center' },
  fBtn: { paddingHorizontal: Spacing.xl, paddingVertical: 8, borderRadius: Radius.md, backgroundColor: C.bgCard, borderWidth: 1.5, borderColor: C.border },
  fActive: { backgroundColor: C.blue, borderColor: C.blue },
  fText: { ...T.capBold, color: C.t3 },
  fTextActive: { color: C.white },
  countLabel: { ...T.tiny, color: C.t4 },
  cardWrap: { paddingHorizontal: 20, paddingTop: Spacing.xs },
});
