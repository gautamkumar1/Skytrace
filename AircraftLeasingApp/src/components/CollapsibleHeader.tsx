import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Animated, {
  useAnimatedStyle, interpolate, Extrapolation, SharedValue,
} from 'react-native-reanimated';
import { C } from '../theme/colors';
import { T } from '../theme/typography';

const MAX_H = 120;
const MIN_H = 56;

interface Props {
  title: string;
  subtitle?: string;
  scrollY: SharedValue<number>;
  rightElement?: React.ReactNode;
  logo?: ImageSourcePropType;
}

export default function CollapsibleHeader({ title, subtitle, scrollY, rightElement, logo }: Props) {
  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, MAX_H - MIN_H], [MAX_H, MIN_H], Extrapolation.CLAMP),
    paddingTop: interpolate(scrollY.value, [0, MAX_H - MIN_H], [24, 12], Extrapolation.CLAMP),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY.value, [0, MAX_H - MIN_H], [32, 20], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, MAX_H - MIN_H], [0, -4], Extrapolation.CLAMP) }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 40], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 40], [0, -8], Extrapolation.CLAMP) }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, MAX_H - MIN_H], [1, 0.6], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(scrollY.value, [0, MAX_H - MIN_H], [1, 0.7], Extrapolation.CLAMP) }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [30, 60], [0, 1], Extrapolation.CLAMP),
    transform: [{ scaleX: interpolate(scrollY.value, [30, 60], [0, 1], Extrapolation.CLAMP) }],
  }));

  return (
    <Animated.View style={[styles.header, headerStyle]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Animated.Text style={[styles.title, titleStyle]}>{title}</Animated.Text>
          {subtitle && <Animated.Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Animated.Text>}
        </View>
        {logo && (
          <Animated.View style={logoStyle}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        )}
        {rightElement}
      </View>
      <Animated.View style={[styles.line, lineStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: C.bg, paddingHorizontal: 20, justifyContent: 'flex-end', paddingBottom: 12, zIndex: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  title: { fontWeight: '800', color: C.white, letterSpacing: -1 },
  subtitle: { ...T.body, color: C.t3, marginTop: 2 },
  logo: { width: 36, height: 36, borderRadius: 8 },
  line: { position: 'absolute', bottom: 0, left: 20, right: 20, height: 1, backgroundColor: C.border },
});
