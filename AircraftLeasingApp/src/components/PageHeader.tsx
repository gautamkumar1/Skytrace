import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Images } from '../assets';
import { C } from '../theme/colors';

interface Props {
  heading: string;
  label?: string;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHeader({ heading, label, rightElement, children }: Props) {
  return (
    <View style={styles.container}>
      {/* Logo row: icon + OriginTrace.ai text */}
      <View style={styles.logoRow}>
        <Image source={Images.appIcon} style={styles.icon} />
        <Text style={styles.brandText}>
          Origin<Text style={styles.brandBold}>Trace</Text>
          <Text style={styles.brandDot}>.ai</Text>
        </Text>
      </View>

      {/* Optional tagline */}
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
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '400',
    color: C.t2,
    letterSpacing: -0.2,
  },
  brandBold: {
    fontWeight: '700',
    color: C.t1,
  },
  brandDot: {
    fontWeight: '700',
    color: C.blue,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: C.t1,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: C.t3,
    marginTop: 1,
  },
});
