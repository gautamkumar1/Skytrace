import React, { useEffect, useRef, useState, memo } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface Props { value: number; duration?: number; delay?: number; style?: StyleProp<TextStyle>; suffix?: string; prefix?: string }

export default memo(function AnimatedNumber({ value, duration = 700, delay = 0, style, suffix = '', prefix = '' }: Props) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    timerRef.current = setTimeout(() => {
      let startTime: number | null = null;
      const animate = (time: number) => {
        if (!mountedRef.current) return;
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, delay]);

  return <Text style={style}>{prefix}{display}{suffix}</Text>;
});
