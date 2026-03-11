"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/engine/MetricCard";
import FindingCard from "@/components/findings/FindingCard";
import DocumentCard from "@/components/documents/DocumentCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { apiFetch, formatDate } from "@/lib/utils";
import type { CaseDetail } from "@/lib/types";
import {
    Plane,
    Gauge,
    AlertTriangle,
    FileText,
    Calendar,
} from "lucide-react";

type TabType = "findings" | "engine" | "documents";

export default function CaseDetailPage() {
    const params = useParams();
    const caseId = params.caseId as string;
    const [data, setData] = useState<CaseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("findings");

    useEffect(() => {
        if (!caseId) return;
        setLoading(true);
        apiFetch<CaseDetail>(`/api/cases/${encodeURIComponent(caseId)}`)
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [caseId]);

    if (loading) return <LoadingSpinner text="Loading case details..." />;

    if (error || !data) {
        return (
            <>
                <Header title="Case Not Found" />
                <EmptyState
                    icon={<AlertTriangle size={28} />}
                    title="Case Not Found"
                    description={error || `Case ${caseId} could not be loaded.`}
                />
            </>
        );
    }

    const tabs: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
        { key: "findings", label: "Findings", icon: <AlertTriangle size={16} />, count: data.findings.length },
        { key: "engine", label: "Engine Health", icon: <Gauge size={16} />, count: data.engine_data.length },
        { key: "documents", label: "Documents", icon: <FileText size={16} />, count: data.documents.length },
    ];

    return (
        <>
            <Header
                title={`Case: ${data.case_id}`}
                subtitle={`${data.registration} — ${data.aircraft_type}`}
            />

            {/* Case Info Card */}
            <motion.div
                className="flex items-center gap-5 bg-white border border-slate-900/[0.06] rounded-xl p-5 mb-8 shadow-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="w-12 h-12 rounded-xl bg-[#2563a8]/10 text-[#2563a8] flex items-center justify-center shrink-0">
                    <Plane size={26} />
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-4 gap-x-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Case ID</span>
                        <span className="text-sm font-bold text-[#0c1d36] font-mono">{data.case_id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration</span>
                        <span className="text-sm font-bold text-[#0c1d36]">{data.registration}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aircraft Type</span>
                        <span className="text-sm font-bold text-[#0c1d36]">{data.aircraft_type}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine Type</span>
                        <span className="text-sm font-bold text-[#0c1d36]">{data.engine_type}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</span>
                        <span className="text-sm font-bold text-[#0c1d36] flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {formatDate(data.created_at)}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px cursor-pointer
                            ${activeTab === tab.key
                                ? "border-[#2563a8] text-[#2563a8] bg-sky-50/50"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold
                            ${activeTab === tab.key ? "bg-[#2563a8] text-white" : "bg-slate-100 text-slate-500"}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === "findings" && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#0c1d36]">
                                AI Findings
                                <span className="rounded-full bg-[#f0f3f7] px-2 py-0.5 text-[11px] font-semibold text-slate-500">{data.findings.length}</span>
                            </h3>
                        </div>
                        {data.findings.length === 0 ? (
                            <EmptyState
                                icon={<AlertTriangle size={28} />}
                                title="No Findings"
                                description="No AI findings have been generated for this case."
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                                {data.findings.map((finding, i) => (
                                    <FindingCard key={finding.id} finding={finding} index={i} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "engine" && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#0c1d36]">
                                Engine Metrics
                                <span className="rounded-full bg-[#f0f3f7] px-2 py-0.5 text-[11px] font-semibold text-slate-500">{data.engine_data.length}</span>
                            </h3>
                        </div>
                        {data.engine_data.length === 0 ? (
                            <EmptyState
                                icon={<Gauge size={28} />}
                                title="No Engine Data"
                                description="No engine metrics have been extracted for this case."
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                                {data.engine_data.map((metric, i) => (
                                    <motion.div
                                        key={metric.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.3 }}
                                    >
                                        <MetricCard metric={metric} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "documents" && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#0c1d36]">
                                Ingested Documents
                                <span className="rounded-full bg-[#f0f3f7] px-2 py-0.5 text-[11px] font-semibold text-slate-500">{data.documents.length}</span>
                            </h3>
                        </div>
                        {data.documents.length === 0 ? (
                            <EmptyState
                                icon={<FileText size={28} />}
                                title="No Documents"
                                description="No documents have been ingested for this case."
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                {data.documents.map((doc, i) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.3 }}
                                    >
                                        <DocumentCard doc={doc} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </>
    );
}
