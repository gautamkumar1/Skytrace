import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface Props { color: string; size?: number; pulse?: boolean }

export default function PulsingDot({ color, size = 8, pulse = true }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!pulse) return;
    scale.value = withRepeat(withSequence(withTiming(1.6, { duration: 700 }), withTiming(1, { duration: 500 })), -1);
    opacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 700 }), withTiming(1, { duration: 500 })), -1);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />
  );
}
