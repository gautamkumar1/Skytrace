import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import { C } from '../theme/colors';

interface Props { percent: number; color?: string; height?: number; delay?: number; bgColor?: string }

export default function AnimatedBar({ percent, color = C.blue, height = 4, delay = 0, bgColor = C.border }: Props) {
  const w = useSharedValue(0);
  useEffect(() => { w.value = withDelay(delay, withSpring(Math.min(percent, 100), { damping: 18, stiffness: 80 })); }, [percent]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value}%` as any }));

  return (
    <View style={[styles.track, { height, backgroundColor: bgColor, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, fillStyle, { height, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0 },
});
