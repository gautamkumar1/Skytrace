import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Images } from '../assets';
import { C } from '../theme/colors';
import { T } from '../theme/typography';

interface Props {
  /** Big heading (e.g. "Fleet Overview") */
  heading: string;
  /** Smaller label below heading (e.g. "Dashboard") */
  label?: string;
  rightElement?: React.ReactNode;
  /** Extra content between logo and heading (e.g. tagline) */
  children?: React.ReactNode;
}

export default function PageHeader({ heading, label, rightElement, children }: Props) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoBar}>
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Optional tagline / extra content */}
      {children}

      {/* Heading + label */}
      <View style={styles.headingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>{heading}</Text>
          {label ? <Text style={styles.label}>{label}</Text> : null}
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
  logoBar: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  logo: {
    height: 38,
    width: 200,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: C.t1,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: C.t3,
    marginTop: 2,
  },
});
