import { C } from '../theme/colors';
import type { FindingSeverity } from '../types';

export function sevColor(s: FindingSeverity) { return C.sev[s] ?? C.sev.ADVISORY; }
export const severityColors = sevColor; // compat

export function metricStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'ok': case 'normal': return C.green;
    case 'advisory': case 'caution': return C.amber;
    case 'warning': case 'critical': case 'danger': case 'flag': return C.red;
    default: return C.t3;
  }
}

export const SEVERITY_ORDER: FindingSeverity[] = ['STOP', 'FLAG', 'ADVISORY', 'CLEAR'];
