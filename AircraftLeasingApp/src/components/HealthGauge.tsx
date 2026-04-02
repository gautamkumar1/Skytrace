import React, { useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withDelay, withTiming } from 'react-native-reanimated';
import { C } from '../theme/colors';

const ACircle = Animated.createAnimatedComponent(Circle);

interface Props { pct: number; size?: number; strokeWidth?: number; delay?: number }

export default memo(function HealthGauge({ pct, size = 72, strokeWidth = 5, delay = 0 }: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const progress = useSharedValue(0);
  const [display, setDisplay] = React.useState(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(pct, { duration: 900 }));

    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    timerRef.current = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        if (!mountedRef.current) return;
        const t = Math.min((Date.now() - start) / 900, 1);
        setDisplay(Math.round(t * pct));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pct, delay]);

  const animProps = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - progress.value / 100) }));
  const color = pct >= 80 ? C.green : pct >= 50 ? C.amber : C.red;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={C.border} strokeWidth={strokeWidth - 1} fill="none" />
        <ACircle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circ}`} animatedProps={animProps}
          strokeLinecap="round" rotation={-90} origin={`${size/2},${size/2}`} />
      </Svg>
      <Text style={[styles.label, { color }]}>{display}%</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center' },
  label: { position: 'absolute', fontSize: 14, fontWeight: '800' },
});
