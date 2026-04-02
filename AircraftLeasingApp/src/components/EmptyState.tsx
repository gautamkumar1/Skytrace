import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../theme/colors';
import { T } from '../theme/typography';

export default function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.t}>{title}</Text>
      {subtitle ? <Text style={styles.s}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48 },
  t: { ...T.h3, color: C.t3, textAlign: 'center' },
  s: { ...T.cap, color: C.t4, textAlign: 'center', marginTop: 8 },
});
