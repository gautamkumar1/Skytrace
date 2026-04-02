/**
 * Dark aviation cockpit theme.
 * Deep navy base, electric accents, glass surfaces.
 */
export const C = {
  // Base
  bg: '#070B14',
  bgCard: 'rgba(255,255,255,0.05)',
  bgGlass: 'rgba(255,255,255,0.07)',
  bgElevated: 'rgba(255,255,255,0.10)',
  bgInput: 'rgba(255,255,255,0.06)',

  // Accent
  blue: '#3B82F6',
  blueGlow: 'rgba(59,130,246,0.25)',
  blueMuted: '#1E3A5F',
  cyan: '#06B6D4',
  cyanGlow: 'rgba(6,182,212,0.2)',

  // Severity
  red: '#EF4444',
  redGlow: 'rgba(239,68,68,0.2)',
  redBg: 'rgba(239,68,68,0.12)',
  amber: '#F59E0B',
  amberGlow: 'rgba(245,158,11,0.2)',
  amberBg: 'rgba(245,158,11,0.12)',
  green: '#22C55E',
  greenGlow: 'rgba(34,197,94,0.2)',
  greenBg: 'rgba(34,197,94,0.12)',
  sky: '#3B82F6',
  skyBg: 'rgba(59,130,246,0.12)',

  // Text
  white: '#FFFFFF',
  t1: '#F1F5F9',
  t2: '#94A3B8',
  t3: '#64748B',
  t4: '#334155',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.04)',
  divider: 'rgba(255,255,255,0.06)',

  // Gradients
  gradBlue: ['#1D4ED8', '#3B82F6'] as readonly string[],
  gradDark: ['#0F172A', '#1E293B'] as readonly string[],
  gradRed: ['#DC2626', '#EF4444'] as readonly string[],
  gradAmber: ['#D97706', '#F59E0B'] as readonly string[],
  gradGreen: ['#059669', '#22C55E'] as readonly string[],
  gradCyan: ['#0891B2', '#06B6D4'] as readonly string[],

  // Severity configs
  sev: {
    STOP:     { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', glow: 'rgba(239,68,68,0.3)' },
    FLAG:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.3)' },
    ADVISORY: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', glow: 'rgba(59,130,246,0.3)' },
    CLEAR:    { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', glow: 'rgba(34,197,94,0.3)' },
  } as Record<string, { color: string; bg: string; glow: string }>,

  shadow: {
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
    glow: (color: string) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 }),
  },
} as const;

// Compat alias
export const Colors = C;
export type SeverityKey = 'stop' | 'flag' | 'advisory' | 'clear';
