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
      {/* OriginTrace.AI branding — always visible */}
      <View style={styles.brandRow}>
        <Image source={Images.appIcon} style={styles.brandIcon} resizeMode="contain" />
        <Text style={styles.brandName}>OriginTrace<Text style={styles.brandDot}>.AI</Text></Text>
      </View>

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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  brandIcon: { width: 28, height: 28, borderRadius: 6 },
  brandName: { fontSize: 15, fontWeight: '700', color: C.t1 },
  brandDot: { color: C.blue, fontWeight: '800' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: { ...T.hero },
  subtitle: { ...T.body, color: C.t3, marginTop: 2 },
});
