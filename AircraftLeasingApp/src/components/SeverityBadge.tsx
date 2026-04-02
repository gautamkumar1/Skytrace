import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FindingSeverity } from '../types';
import { sevColor } from '../utils/severity';
import PulsingDot from './PulsingDot';

interface Props { severity: FindingSeverity; size?: 'sm' | 'md' }

export default function SeverityBadge({ severity, size = 'sm' }: Props) {
  const c = sevColor(severity);
  const sm = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, sm && styles.sm]}>
      <PulsingDot color={c.color} size={sm ? 5 : 7} pulse={severity === 'STOP'} />
      <Text style={[sm ? styles.textSm : styles.textMd, { color: c.color }]}>{severity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: 8, paddingVertical: 3 },
  textSm: { fontSize: 11, fontWeight: '700' },
  textMd: { fontSize: 13, fontWeight: '700' },
});
