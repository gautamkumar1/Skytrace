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
      {/* Page title row with logo on right */}
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightElement}
      </View>

      {/* OriginTrace.ai logo bar — the website logo, lowered below title */}
      <View style={styles.logoRow}>
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bgCard,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: { ...T.hero },
  subtitle: { ...T.body, color: C.t3, marginTop: 2 },
  logoRow: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  logo: { height: 36, width: 230 },
});
