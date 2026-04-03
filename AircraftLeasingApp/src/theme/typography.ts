import { TextStyle } from 'react-native';
import { C } from './colors';

export const T: Record<string, TextStyle> = {
  hero:      { fontSize: 32, fontWeight: '800', color: C.t1, letterSpacing: -1 },
  h1:        { fontSize: 26, fontWeight: '700', color: C.t1, letterSpacing: -0.5 },
  h2:        { fontSize: 20, fontWeight: '700', color: C.t1 },
  h3:        { fontSize: 17, fontWeight: '600', color: C.t1 },
  body:      { fontSize: 15, fontWeight: '400', color: C.t2, lineHeight: 22 },
  bold:      { fontSize: 15, fontWeight: '600', color: C.t1 },
  cap:       { fontSize: 13, fontWeight: '500', color: C.t3 },
  capBold:   { fontSize: 13, fontWeight: '600', color: C.t2 },
  label:     { fontSize: 11, fontWeight: '700', color: C.t3, letterSpacing: 1, textTransform: 'uppercase' as const },
  mono:      { fontSize: 13, fontWeight: '500', color: C.t2, fontFamily: 'monospace' },
  tiny:      { fontSize: 11, fontWeight: '600', color: C.t3 },
  num:       { fontSize: 36, fontWeight: '800', color: C.t1, letterSpacing: -1 },
  numMd:     { fontSize: 24, fontWeight: '800', color: C.t1 },
};

export const Font = T;
