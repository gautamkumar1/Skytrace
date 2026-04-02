export type FindingSeverity = 'CLEAR' | 'ADVISORY' | 'FLAG' | 'STOP';

export interface Case {
  case_id: string;
  registration: string;
  aircraft_type: string;
  engine_type: string;
  created_at: string | null;
}

export interface Document {
  id: string;
  case_id: string;
  filename: string;
  content_hash: string;
  storage_key: string;
  page_count: number;
  metadata_json: Record<string, unknown> | null;
  created_at: string | null;
}

export interface FindingMetadata {
  reasoning?: string;
  correlation_group?: string;
  aviation_reference?: string;
  [key: string]: unknown;
}

export interface Finding {
  id: string;
  case_id: string;
  agent_name: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  evidence: string;
  confidence: number;
  source_doc_id: string | null;
  source_page: string | null;
  iteration: number;
  metadata_json: FindingMetadata | null;
  created_at: string | null;
  user_feedback?: 'approve' | 'flag' | 'reject';
  feedback_comment?: string;
}

export interface EngineMetric {
  id: number;
  case_id: string;
  registration: string;
  aircraft_type: string;
  engine_type: string;
  metric_name: string;
  metric_value: string | number | null;
  unit: string | null;
  status: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string | null;
}

export interface FleetSummaryRow {
  case_id: string;
  registration: string;
  aircraft_type: string;
  engine_type: string;
  doc_count: number;
  finding_count: number;
  engine_metric_count: number;
}

export interface FleetHealthCase extends FleetSummaryRow {
  critical_count: number;
  advisory_count: number;
  clear_count: number;
  health_pct: number;
  status: 'clean' | 'missing_link' | 'advisory' | 'fraud_risk';
}

export interface DashboardStats {
  total_cases: number;
  total_findings: number;
  total_documents: number;
  total_engine_metrics: number;
  severity_counts: Partial<Record<FindingSeverity, number>>;
  recent_findings: RecentFinding[];
}

export interface RecentFinding {
  id: string;
  case_id: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  confidence: number;
  created_at: string | null;
  registration: string;
  aircraft_type: string;
}

export interface CaseDetail extends Case {
  findings: Finding[];
  documents: Document[];
  engine_data: EngineMetric[];
}

export type LLPLifeUnit = 'FH' | 'FC' | 'CAL';
export type LLPBtbStatus = 'verified' | 'pending_review' | 'gap' | 'overdue';

export interface LLPPart {
  id: string;
  case_id: string;
  registration: string;
  aircraft_type: string;
  part_number: string;
  part_name: string;
  serial_number: string;
  position: string;
  life_unit: LLPLifeUnit;
  current_used: number;
  life_limit: number;
  btb_status: LLPBtbStatus;
  next_inspection_date: string | null;
  last_btb_verified_at: string | null;
  notes: string | null;
}

export interface LLPStats {
  active_tracking: number;
  pending_btb_review: number;
  compliance_rate_percent: number;
  overdue_count: number;
}

export interface FeedbackPayload {
  finding_id: string;
  case_id: string;
  feedback: 'approve' | 'flag' | 'reject';
  comment?: string;
}

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  severity?: FindingSeverity;
}

export interface BTBAuditResult {
  run_at: string;
  total_parts: number;
  verified: number;
  pending_review: number;
  gap: number;
  overdue: number;
  items_flagged: { part_number: string; serial_number: string; reason: string }[];
}
