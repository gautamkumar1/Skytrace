import { Platform } from 'react-native';

/**
 * Base URL for the Next.js API (`frontend`, default port 3591).
 *
 * - iOS Simulator: `localhost` reaches the host Mac.
 * - Android Emulator: `10.0.2.2` is the host loopback.
 * - Physical device: set `PHYSICAL_DEVICE_LAN_HOST` to your Mac’s LAN IP (e.g. 192.168.1.12).
 */
const PHYSICAL_DEVICE_LAN_HOST: string | undefined = undefined;

const PORT = 3591;

export function getApiBaseUrl(): string {
  if (PHYSICAL_DEVICE_LAN_HOST && PHYSICAL_DEVICE_LAN_HOST.trim()) {
    return `http://${PHYSICAL_DEVICE_LAN_HOST.trim()}:${PORT}`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${PORT}`;
  }
  return `http://localhost:${PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();
