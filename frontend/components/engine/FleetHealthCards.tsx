"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, FileQuestion, HelpCircle } from "lucide-react";

export type FleetHealthStatus = "clean" | "missing_link" | "advisory" | "fraud_risk";

export interface FleetHealthCase {
    case_id: string;
    registration: string;
    aircraft_type: string;
    engine_type: string;
    doc_count: number;
    finding_count: number;
    critical_count: number;
    advisory_count: number;
    clear_count: number;
    engine_metric_count: number;
    health_pct: number;
    status: FleetHealthStatus;
}

const statusConfig: Record<
    FleetHealthStatus,
    { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
    clean: {
        label: "Clean",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle2,
    },
    missing_link: {
        label: "Missing Link",
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: FileQuestion,
    },
    advisory: {
        label: "Advisory",
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: HelpCircle,
    },
    fraud_risk: {
        label: "Fraud Risk",
        color: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
        icon: AlertTriangle,
    },
};

function CircularGauge({ pct, status }: { pct: number; status: FleetHealthStatus }) {
    const clamped = Math.min(100, Math.max(0, pct));
    const stroke = status === "fraud_risk" ? "#e11d48" : status === "advisory" || status === "missing_link" ? "#f59e0b" : "#10b981";
    const r = 28;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                    cx="32"
                    cy="32"
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-100"
                />
                <circle
                    cx="32"
                    cy="32"
                    r={r}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
            </svg>
            <span className="absolute text-sm font-bold text-slate-800 tabular-nums">{clamped}%</span>
        </div>
    );
}

interface FleetHealthCardsProps {
    cases: FleetHealthCase[];
    onSelectCase?: (caseId: string) => void;
    selectedCaseId?: string | null;
}

export default function FleetHealthCards({ cases, onSelectCase, selectedCaseId }: FleetHealthCardsProps) {
    if (!cases.length) {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-6 py-8 text-center text-sm text-slate-500">
                No fleet data. Upload documents to see health metrics.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Global Fleet Health</h3>
            <div className="flex flex-wrap gap-3">
                {cases.map((c, i) => {
                    const config = statusConfig[c.status];
                    const Icon = config.icon;
                    const isSelected = selectedCaseId != null && c.case_id === selectedCaseId;

                    return (
                        <motion.button
                            key={c.case_id}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => onSelectCase?.(c.case_id)}
                            className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-all hover:shadow-md ${
                                isSelected
                                    ? "border-blue-400 bg-blue-50/80 shadow-sm"
                                    : `border-slate-200 bg-white hover:border-slate-300 ${config.bg} ${config.border}`
                            }`}
                        >
                            <CircularGauge pct={c.health_pct} status={c.status} />
                            <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">
                                    {c.registration}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                    {c.aircraft_type}
                                </div>
                                <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                                    <Icon className="w-3 h-3 shrink-0" />
                                    {config.label}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
