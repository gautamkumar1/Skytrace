import { apiFetch, API_BASE_URL } from './client';
import type {
  DashboardStats, Case, CaseDetail, FleetSummaryRow, FleetHealthCase,
  LLPPart, LLPStats, BTBAuditResult, SearchResult, FeedbackPayload,
} from '../types';

export const fetchStats = () => apiFetch<DashboardStats>('/api/stats');
export const fetchCases = () => apiFetch<Case[]>('/api/cases');
export const fetchCaseDetail = (id: string) => apiFetch<CaseDetail>(`/api/cases/${encodeURIComponent(id)}`);
export const fetchFleet = () => apiFetch<FleetSummaryRow[]>('/api/fleet');
export const fetchFleetHealth = () => apiFetch<FleetHealthCase[]>('/api/engine/fleet-health');
export const fetchLLP = () => apiFetch<{ parts: LLPPart[]; stats: LLPStats }>('/api/llp');
export const searchGlobal = (q: string) => apiFetch<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`);

export const runBTBAudit = () =>
  apiFetch<BTBAuditResult>('/api/llp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'run_btb_audit' }),
  });

export const submitFeedback = (payload: FeedbackPayload) =>
  apiFetch<{ success: boolean; feedback_id: string }>('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export async function submitAnalysis(
  caseId: string, registration: string,
  aircraftType: string, engineType: string,
  files: { uri: string; name: string; type: string }[],
): Promise<{ success: boolean; case_id: string; output: string }> {
  const form = new FormData();
  form.append('case_id', caseId);
  form.append('registration', registration);
  if (aircraftType) form.append('aircraft_type', aircraftType);
  if (engineType) form.append('engine_type', engineType);
  files.forEach(f => form.append('files', f as any));

  const res = await fetch(`${API_BASE_URL}/api/analyze`, { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Analysis failed (${res.status}): ${body}`);
  }
  return res.json();
}
