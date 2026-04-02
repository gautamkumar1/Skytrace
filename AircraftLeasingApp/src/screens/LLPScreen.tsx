import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  RefreshControl, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { useApi } from '../hooks/useApi';
import { fetchLLP, runBTBAudit } from '../api/endpoints';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedBar from '../components/AnimatedBar';
import EmptyState from '../components/EmptyState';
import { C } from '../theme/colors';
import { T } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Images } from '../assets';
import { formatDate } from '../utils/format';
import type { LLPPart, LLPBtbStatus, BTBAuditResult } from '../types';

const BTB_C: Record<LLPBtbStatus, string> = {
  verified: C.green,
  pending_review: C.amber,
  gap: C.blue,
  overdue: C.red,
};

export default function LLPScreen() {
  const { data, loading, refresh } = useApi(fetchLLP);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LLPBtbStatus | 'all'>('all');
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<BTBAuditResult | null>(null);

  const filtered = useMemo(() => {
    if (!data?.parts) return [];
    return data.parts.filter(p => {
      if (filter !== 'all' && p.btb_status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return [p.part_number, p.part_name, p.serial_number, p.registration]
          .some(v => v.toLowerCase().includes(q));
      }
      return true;
    });
  }, [data, search, filter]);

  const st = data?.stats;

  const doAudit = async () => {
    setAuditing(true);
    try {
      setAuditResult(await runBTBAudit());
    } catch (e: any) {
      Alert.alert('Failed', e.message);
    }
    setAuditing(false);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={T.hero}>LLP Tracking</Text>
          <Text style={styles.sub}>Life limited parts & BTB audit</Text>
        </View>
        <AnimatedButton onPress={doAudit} disabled={auditing} style={styles.auditBtn}>
          <Text style={styles.auditText}>{auditing ? 'Running...' : 'Run Audit'}</Text>
        </AnimatedButton>
      </View>

      {/* Mini stat cards */}
      {st && (
        <AnimatedCard delay={100}>
          <View style={styles.statsRow}>
            {([
              { l: 'TRACKING', v: st.active_tracking, c: C.blue, s: '' },
              { l: 'PENDING', v: st.pending_btb_review, c: C.amber, s: '' },
              { l: 'COMPLIANCE', v: st.compliance_rate_percent, c: C.green, s: '%' },
              { l: 'OVERDUE', v: st.overdue_count, c: C.red, s: '' },
            ] as const).map((s) => (
              <View key={s.l} style={[styles.statMini, { borderTopColor: s.c }]}>
                <Text style={styles.statVal}>{s.v}{s.s}</Text>
                <Text style={styles.statLbl}>{s.l}</Text>
              </View>
            ))}
          </View>
        </AnimatedCard>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search parts..."
          placeholderTextColor={C.t4}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={['all', 'verified', 'pending_review', 'gap', 'overdue'] as const}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={{ paddingHorizontal: 20, gap: Spacing.sm }}
        renderItem={({ item: f }) => (
          <AnimatedButton
            onPress={() => setFilter(f)}
            style={[styles.fChip, filter === f && styles.fActive]}
          >
            <Text style={[styles.fText, filter === f && styles.fTextActive]}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </Text>
          </AnimatedButton>
        )}
      />

      {/* Part list */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={C.blue} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No parts found"
            subtitle={search ? 'Try a different search' : 'Upload docs to populate'}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Spacing.sm,
          paddingBottom: 32,
          flexGrow: 1,
        }}
        renderItem={({ item: p, index }) => {
          const rem = p.life_limit - p.current_used;
          const pct = p.life_limit > 0 ? (p.current_used / p.life_limit) * 100 : 0;
          return (
            <AnimatedCard delay={index * 50} slideFrom="bottom" distance={10}>
              <View style={styles.partCard}>
                <View style={styles.partTop}>
                  <Text style={[T.mono, { color: C.t1, fontWeight: '700' }]}>
                    {p.part_number}
                  </Text>
                  <View style={[styles.btb, { borderColor: BTB_C[p.btb_status] }]}>
                    <View
                      style={[styles.btbDot, { backgroundColor: BTB_C[p.btb_status] }]}
                    />
                    <Text style={[T.tiny, { color: BTB_C[p.btb_status] }]}>
                      {p.btb_status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <Text style={[T.bold, { marginBottom: 2 }]}>{p.part_name}</Text>
                <Text style={[T.cap, { color: C.t3, marginBottom: Spacing.md }]}>
                  {p.registration} {'\u00B7'} {p.position} {'\u00B7'} SN: {p.serial_number}
                </Text>
                <View style={styles.lifeRow}>
                  <Text style={[T.cap, { color: C.t3 }]}>
                    {p.current_used.toLocaleString()} / {p.life_limit.toLocaleString()} {p.life_unit}
                  </Text>
                  <Text
                    style={[
                      T.capBold,
                      { color: rem <= 0 ? C.red : pct >= 80 ? C.amber : C.t2 },
                    ]}
                  >
                    {rem.toLocaleString()} left
                  </Text>
                </View>
                <AnimatedBar
                  percent={pct}
                  height={3}
                  delay={80 + index * 50}
                  color={pct >= 80 ? C.red : pct >= 60 ? C.amber : C.green}
                />
                {p.next_inspection_date && (
                  <Text style={[T.cap, { color: C.t3, marginTop: Spacing.sm }]}>
                    Next inspection: {formatDate(p.next_inspection_date)}
                  </Text>
                )}
              </View>
            </AnimatedCard>
          );
        }}
      />

      {/* Audit results modal */}
      <Modal visible={!!auditResult} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={[T.h2, { marginBottom: Spacing.lg }]}>Audit Results</Text>
            {auditResult && (
              <>
                <Text style={[T.bold, { color: C.t1, marginBottom: 4 }]}>
                  Total: {auditResult.total_parts}
                </Text>
                <Text style={[T.bold, { color: C.green, marginBottom: 4 }]}>
                  Verified: {auditResult.verified}
                </Text>
                <Text style={[T.bold, { color: C.amber, marginBottom: 4 }]}>
                  Pending: {auditResult.pending_review}
                </Text>
                <Text style={[T.bold, { color: C.red, marginBottom: 4 }]}>
                  Gap: {auditResult.gap} {'\u00B7'} Overdue: {auditResult.overdue}
                </Text>
              </>
            )}
            <AnimatedButton onPress={() => setAuditResult(null)} style={styles.closeBtn}>
              <Text style={[T.bold, { color: C.white }]}>Close</Text>
            </AnimatedButton>
          </View>
        </View>
      </Modal>
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
  auditBtn: {
    backgroundColor: C.blue,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  auditText: {
    ...T.capBold,
    color: C.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: 20,
    marginBottom: Spacing.md,
  },
  statMini: {
    flex: 1,
    backgroundColor: C.bgGlass,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow.card,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: C.t1,
  },
  statLbl: {
    ...T.label,
    color: C.t3,
    fontSize: 9,
    marginTop: 2,
  },
  searchWrap: {
    paddingHorizontal: 20,
  },
  searchInput: {
    backgroundColor: C.bgInput,
    borderRadius: Radius.md,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...T.body,
    color: C.t1,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterList: {
    flexGrow: 0,
    paddingVertical: Spacing.md,
  },
  fChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: C.bgGlass,
    borderWidth: 1,
    borderColor: C.border,
  },
  fActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  fText: {
    ...T.capBold,
    color: C.t3,
  },
  fTextActive: {
    color: C.white,
  },
  partCard: {
    backgroundColor: C.bgGlass,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow.card,
  },
  partTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  btb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  btbDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  lifeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  modal: {
    backgroundColor: C.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow.card,
  },
  closeBtn: {
    backgroundColor: C.blue,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
});
