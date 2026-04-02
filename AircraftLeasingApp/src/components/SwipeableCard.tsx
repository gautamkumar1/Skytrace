import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { C } from '../theme/colors';

const ACTION_W = 180;
const THRESHOLD = 80;

interface Props {
  children: React.ReactNode;
  onApprove?: () => void;
  onFlag?: () => void;
  onReject?: () => void;
  enabled?: boolean;
}

export default function SwipeableCard({ children, onApprove, onFlag, onReject, enabled = true }: Props) {
  const translateX = useSharedValue(0);
  const ctx = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => { ctx.value = translateX.value; })
    .onUpdate((e) => {
      translateX.value = Math.min(0, Math.max(-ACTION_W, ctx.value + e.translationX));
    })
    .onEnd(() => {
      translateX.value = translateX.value < -THRESHOLD
        ? withSpring(-ACTION_W, { damping: 20, stiffness: 150 })
        : withSpring(0, { damping: 20, stiffness: 150 });
    });

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [0, -THRESHOLD], [0.8, 1], Extrapolation.CLAMP) }],
  }));

  const close = () => { translateX.value = withSpring(0, { damping: 20, stiffness: 150 }); };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.actions, actionsStyle]}>
        <View style={styles.actRow}>
          <Pressable style={[styles.actBtn, { backgroundColor: C.greenBg }]} onPress={() => { close(); onApprove?.(); }}>
            <Text style={[styles.actIcon, { color: C.green }]}>{'\u2713'}</Text>
          </Pressable>
          <Pressable style={[styles.actBtn, { backgroundColor: C.amberBg }]} onPress={() => { close(); onFlag?.(); }}>
            <Text style={[styles.actIcon, { color: C.amber }]}>{'\u2691'}</Text>
          </Pressable>
          <Pressable style={[styles.actBtn, { backgroundColor: C.redBg }]} onPress={() => { close(); onReject?.(); }}>
            <Text style={[styles.actIcon, { color: C.red }]}>{'\u2717'}</Text>
          </Pressable>
        </View>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden', borderRadius: 14, marginBottom: 10 },
  actions: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: ACTION_W, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12,
  },
  actRow: { flexDirection: 'row', gap: 8 },
  actBtn: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actIcon: { fontSize: 20, fontWeight: '700' },
});
