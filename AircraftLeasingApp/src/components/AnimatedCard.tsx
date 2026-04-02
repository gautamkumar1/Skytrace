import React from 'react';
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { ViewStyle, StyleProp } from 'react-native';

interface Props {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  slideFrom?: 'bottom' | 'left' | 'right';
  distance?: number;
}

export default function AnimatedCard({ children, delay = 0, style, slideFrom = 'bottom', distance = 20 }: Props) {
  const entering = slideFrom === 'left'
    ? FadeInLeft.delay(delay).duration(450).springify().damping(15)
    : slideFrom === 'right'
    ? FadeInRight.delay(delay).duration(450).springify().damping(15)
    : FadeInDown.delay(delay).duration(450).springify().damping(15);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
