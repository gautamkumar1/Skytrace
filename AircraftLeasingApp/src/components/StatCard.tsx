import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AnimatedNumber from './AnimatedNumber';
import AnimatedCard from './AnimatedCard';
import { C } from '../theme/colors';

interface Props { label: string; value: number; gradient: readonly string[]; delay?: number; suffix?: string }

export default memo(function StatCard({ label, value, gradient, delay = 0, suffix = '' }: Props) {
  return (
    <AnimatedCard delay={delay}>
      <View style={styles.outer}>
        <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <AnimatedNumber value={value} style={styles.num} delay={delay + 200} suffix={suffix} />
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </View>
    </AnimatedCard>
  );
});

const styles = StyleSheet.create({
  outer: { ...C.shadow.card },
  card: { borderRadius: 16, paddingVertical: 20, paddingHorizontal: 16, minWidth: 130, minHeight: 88, justifyContent: 'flex-end' },
  num: { fontSize: 30, fontWeight: '800', color: C.white, letterSpacing: -1 },
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' },
});
