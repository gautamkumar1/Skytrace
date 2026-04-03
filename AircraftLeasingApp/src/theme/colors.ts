/**
 * Light theme — clean, professional, easy to read.
 */
export const C = {
  // Base surfaces
  bg: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgGlass: '#FFFFFF',
  bgElevated: '#FFFFFF',
  bgInput: '#F1F5F9',

  // Accent
  blue: '#1D4ED8',
  blueGlow: 'rgba(29,78,216,0.08)',
  blueMuted: '#93C5FD',
  cyan: '#0891B2',
  cyanGlow: 'rgba(8,145,178,0.08)',

  // Severity
  red: '#DC2626',
  redGlow: 'rgba(220,38,38,0.06)',
  redBg: '#FEF2F2',
  amber: '#D97706',
  amberGlow: 'rgba(217,119,6,0.06)',
  amberBg: '#FFFBEB',
  green: '#16A34A',
  greenGlow: 'rgba(22,163,74,0.06)',
  greenBg: '#F0FDF4',
  sky: '#2563EB',
  skyBg: '#EFF6FF',

  // Text — high contrast, easy to read
  white: '#FFFFFF',
  t1: '#0F172A',       // primary text — near black
  t2: '#334155',       // secondary — dark slate
  t3: '#475569',       // tertiary — readable gray
  t4: '#94A3B8',       // placeholder only

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',

  overlay: 'rgba(0,0,0,0.4)',

  // Gradients
  gradBlue: ['#1D4ED8', '#2563EB'] as readonly string[],
  gradDark: ['#0F172A', '#1E293B'] as readonly string[],
  gradRed: ['#DC2626', '#EF4444'] as readonly string[],
  gradAmber: ['#D97706', '#F59E0B'] as readonly string[],
  gradGreen: ['#059669', '#10B981'] as readonly string[],
  gradCyan: ['#0891B2', '#06B6D4'] as readonly string[],

  // Severity configs
  sev: {
    STOP:     { color: '#DC2626', bg: '#FEF2F2', glow: 'rgba(220,38,38,0.15)' },
    FLAG:     { color: '#D97706', bg: '#FFFBEB', glow: 'rgba(217,119,6,0.15)' },
    ADVISORY: { color: '#2563EB', bg: '#EFF6FF', glow: 'rgba(37,99,235,0.15)' },
    CLEAR:    { color: '#16A34A', bg: '#F0FDF4', glow: 'rgba(22,163,74,0.15)' },
  } as Record<string, { color: string; bg: string; glow: string }>,

  shadow: {
    card: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    glow: (color: string) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }),
  },
} as const;

export const Colors = C;
export type SeverityKey = 'stop' | 'flag' | 'advisory' | 'clear';
