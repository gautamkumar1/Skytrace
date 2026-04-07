import React from 'react';
import { View, Text, Image, StyleSheet, Platform, StatusBar } from 'react-native';
import { Images } from '../assets';
import { C } from '../theme/colors';

const STATUS_BAR = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 40) : 0;

interface Props {
  heading: string;
  label?: string;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHeader({ heading, label, rightElement, children }: Props) {
  return (
    <View style={styles.container}>
      {/* Logo — left aligned, tight to status bar like reference */}
      <View style={[styles.logoRow, { marginTop: STATUS_BAR }]}>
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logoRow: {
    marginBottom: 10,
  },
  logo: {
    height: 40,
    width: 210,
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
