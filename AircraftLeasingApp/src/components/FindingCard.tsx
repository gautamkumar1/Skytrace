import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import type { Finding, FeedbackPayload } from '../types';
import SeverityBadge from './SeverityBadge';
import AnimatedButton from './AnimatedButton';
import AnimatedCard from './AnimatedCard';
import SwipeableCard from './SwipeableCard';
import { sevColor } from '../utils/severity';
import { formatConfidence, formatDateTime } from '../utils/format';
import { submitFeedback } from '../api/endpoints';
import { hapticSuccess, hapticError } from '../utils/haptics';
import { C } from '../theme/colors';
import { T } from '../theme/typography';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true);

interface Props { finding: Finding; showCase?: boolean; onFeedbackSent?: () => void; onViewCase?: (caseId: string) => void; delay?: number; swipeable?: boolean }

export default memo(function FindingCard({ finding, showCase, onFeedbackSent, onViewCase, delay = 0, swipeable = false }: Props) {
  const sc = sevColor(finding.severity);
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const meta = finding.metadata_json;
  const hasFeedback = !!(finding.user_feedback || finding.feedback_comment);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  }, []);

  const send = useCallback(async (fb: FeedbackPayload['feedback']) => {
    setSending(true);
    try {
      await submitFeedback({ finding_id: finding.id, case_id: finding.case_id, feedback: fb, comment: comment || undefined });
      hapticSuccess();
      onFeedbackSent?.();
    } catch (e: any) {
      hapticError();
      Alert.alert('Error', e.message);
    }
    setSending(false);
  }, [finding.id, finding.case_id, comment, onFeedbackSent]);

  const cardContent = (
    <View style={[styles.card, { borderLeftColor: sc.color }]}>
      <View style={styles.header}>
        <SeverityBadge severity={finding.severity} />
        <Text style={styles.conf}>{formatConfidence(finding.confidence)}</Text>
      </View>
      <Text style={styles.title}>{finding.title}</Text>
      <Text style={styles.cat}>{finding.category}</Text>
      {showCase && <View style={styles.caseBadge}><Text style={styles.caseText}>{finding.case_id}</Text></View>}
      <Text style={styles.evidence} numberOfLines={expanded ? undefined : 2}>{finding.evidence}</Text>

      {expanded && (
        <View style={styles.detail}>
          {meta?.reasoning && (
            <View style={styles.rBox}><Text style={styles.rLabel}>REASONING</Text><Text style={styles.rText}>{meta.reasoning}</Text></View>
          )}
          {meta?.aviation_reference && <Text style={styles.ref}>Ref: {meta.aviation_reference}</Text>}
          <Text style={styles.date}>{formatDateTime(finding.created_at)}</Text>
          {onViewCase && (
            <AnimatedButton onPress={() => onViewCase(finding.case_id)} style={styles.viewCaseBtn}>
              <Text style={styles.viewCaseText}>View Case  {'\u203A'}</Text>
            </AnimatedButton>
          )}
          {hasFeedback ? (
            <View style={styles.fbDone}><Text style={[T.capBold, { color: C.blue }]}>Feedback: {finding.user_feedback}</Text></View>
          ) : !swipeable ? (
            <>
              <TextInput style={styles.input} placeholder="Add a note..." placeholderTextColor={C.t4} value={comment} onChangeText={setComment} />
              <View style={styles.btnRow}>
                {([['approve', C.green, C.greenBg], ['flag', C.amber, C.amberBg], ['reject', C.red, C.redBg]] as const).map(([fb, col, bg]) => (
                  <AnimatedButton key={fb} onPress={() => send(fb as any)} disabled={sending} style={[styles.btn, { backgroundColor: bg }]}>
                    <Text style={[styles.btnText, { color: col }]}>{fb.charAt(0).toUpperCase() + fb.slice(1)}</Text>
                  </AnimatedButton>
                ))}
              </View>
            </>
          ) : (
            <Text style={[T.cap, { color: C.t4 }]}>{'\u2190'} Swipe left for quick actions</Text>
          )}
        </View>
      )}
    </View>
  );

  const inner = (
    <AnimatedCard delay={delay}>
      <AnimatedButton onPress={toggle} scaleDown={0.985}>
        {cardContent}
      </AnimatedButton>
    </AnimatedCard>
  );

  if (swipeable && !hasFeedback) {
    return (
      <SwipeableCard onApprove={() => send('approve')} onFlag={() => send('flag')} onReject={() => send('reject')} enabled={!hasFeedback}>
        {inner}
      </SwipeableCard>
    );
  }
  return inner;
});

const styles = StyleSheet.create({
  card: { backgroundColor: C.bgGlass, borderRadius: 14, padding: 16, borderLeftWidth: 3, borderWidth: 1, borderColor: C.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { ...T.bold, fontSize: 15 },
  cat: { ...T.cap },
  caseBadge: { backgroundColor: C.blueGlow, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  caseText: { ...T.mono, color: C.blue, fontSize: 11 },
  conf: { ...T.capBold },
  evidence: { ...T.body, marginTop: 8 },
  detail: { marginTop: 16, borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 16 },
  rBox: { backgroundColor: C.bgCard, borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  rLabel: { ...T.label, marginBottom: 6 },
  rText: { ...T.body, color: C.t1 },
  ref: { ...T.capBold, color: C.blue, marginBottom: 4 },
  date: { ...T.cap, color: C.t4, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, ...T.body, color: C.t1, backgroundColor: C.bgInput, marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { fontSize: 13, fontWeight: '700' },
  viewCaseBtn: { backgroundColor: C.blueGlow, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 12 },
  viewCaseText: { ...T.capBold, color: C.blue, fontSize: 14 },
  fbDone: { padding: 12, borderRadius: 10, backgroundColor: C.blueGlow },
});
