import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { EngineMetric } from '../types';
import { metricStatusColor } from '../utils/severity';
import { formatMetricName } from '../utils/format';
import AnimatedCard from './AnimatedCard';
import PulsingDot from './PulsingDot';
import { C } from '../theme/colors';
import { T } from '../theme/typography';

export default memo(function MetricCard({ m, delay = 0 }: { m: EngineMetric; delay?: number }) {
  const sc = metricStatusColor(m.status);
  const crit = ['warning', 'critical', 'danger'].includes(m.status.toLowerCase());
  return (
    <AnimatedCard delay={delay} slideFrom="left" distance={16}>
      <View style={[styles.card, { borderLeftColor: sc }]}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{formatMetricName(m.metric_name)}</Text>
            <View style={styles.valRow}>
              <Text style={styles.val}>{m.metric_value ?? '\u2014'}</Text>
              {m.unit ? <Text style={styles.unit}>{m.unit}</Text> : null}
            </View>
          </View>
          <PulsingDot color={sc} size={8} pulse={crit} />
        </View>
      </View>
    </AnimatedCard>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: C.bgGlass, borderRadius: 12, padding: 16, borderLeftWidth: 3, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { ...T.label, marginBottom: 4 },
  valRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  val: { fontSize: 22, fontWeight: '700', color: C.t1 },
  unit: { ...T.cap },
});
