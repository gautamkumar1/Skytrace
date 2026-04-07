import React from 'react';
import { View, Text, Image, StyleSheet, Platform, StatusBar } from 'react-native';
import { Images } from '../assets';
import { C } from '../theme/colors';

const STATUS_BAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 40) : 44;

interface Props {
  heading: string;
  label?: string;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHeader({ heading, label, rightElement, children }: Props) {
  return (
    <View style={styles.container}>
      {/* Status bar spacer */}
      <View style={{ height: STATUS_BAR_H }} />

      {/* Logo — full width, centered, prominent */}
      <View style={styles.logoBar}>
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Optional extra (tagline) */}
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
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logoBar: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  logo: {
    height: 50,
    width: 260,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 20,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
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
