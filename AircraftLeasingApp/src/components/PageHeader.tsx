import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Images } from '../assets';
import { C } from '../theme/colors';
import { T } from '../theme/typography';

interface Props {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, rightElement }: Props) {
  return (
    <View style={styles.container}>
      {/* Brand bar: icon + OriginTrace.ai */}
      <View style={styles.brandBar}>
        <Image source={Images.appIcon} style={styles.icon} />
        <Text style={styles.brandText}>
          Origin<Text style={styles.brandBold}>Trace</Text>
          <Text style={styles.brandAi}>.ai</Text>
        </Text>
      </View>

      {/* Divider line */}
      <View style={styles.divider} />

      {/* Page title */}
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bgCard,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '400',
    color: C.t2,
    letterSpacing: -0.3,
  },
  brandBold: {
    fontWeight: '700',
    color: C.t1,
  },
  brandAi: {
    fontWeight: '800',
    color: C.blue,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: { ...T.hero },
  subtitle: { ...T.body, color: C.t3, marginTop: 2 },
});
