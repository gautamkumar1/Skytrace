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

// No bounce — smooth ease-out only
export default function AnimatedCard({ children, delay = 0, style, slideFrom = 'bottom' }: Props) {
  const entering = slideFrom === 'left'
    ? FadeInLeft.delay(delay).duration(350)
    : slideFrom === 'right'
    ? FadeInRight.delay(delay).duration(350)
    : FadeInDown.delay(delay).duration(350);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
