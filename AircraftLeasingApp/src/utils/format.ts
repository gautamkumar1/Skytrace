export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '\u2014';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return dateStr; }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '\u2014';
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

export function formatConfidence(c: number): string {
  const capped = Math.min(Math.max(c, 0), 0.95);
  return `${(capped * 100).toFixed(0)}%`;
}

export function formatMetricName(name: string): string {
  const special: Record<string, string> = {
    ASSET_PRIMARY_ID: 'Asset Primary ID',
    TOTAL_TIME_SINCE_NEW: 'Total Time Since New',
    FORM_1_8130_3_LINKAGE: 'Form 1 / 8130-3 Linkage',
    CSLSV: 'Cycles Since Last Shop Visit',
    TSLSV: 'Time Since Last Shop Visit',
  };
  if (special[name]) return special[name];
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function truncate(text: string, maxLen = 100): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '\u2026';
}
