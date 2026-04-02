/**
 * Haptic feedback wrapper.
 * Falls back gracefully if haptics unavailable.
 */
import { Platform } from 'react-native';

let HapticFeedback: any = null;
try {
  HapticFeedback = require('react-native-haptic-feedback').default;
} catch {}

const opts = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

export function hapticLight() {
  if (Platform.OS === 'android') {
    HapticFeedback?.trigger?.('soft', opts);
  } else {
    HapticFeedback?.trigger?.('impactLight', opts);
  }
}

export function hapticMedium() {
  if (Platform.OS === 'android') {
    HapticFeedback?.trigger?.('impactMedium', opts);
  } else {
    HapticFeedback?.trigger?.('impactMedium', opts);
  }
}

export function hapticSuccess() {
  HapticFeedback?.trigger?.('notificationSuccess', opts);
}

export function hapticError() {
  HapticFeedback?.trigger?.('notificationError', opts);
}
