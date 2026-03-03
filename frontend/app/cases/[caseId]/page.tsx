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
                className="case-info"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="case-info__icon">
                    <Plane size={26} />
                </div>
                <div className="case-info__details">
                    <div className="case-info__field">
                        <span className="case-info__label">Case ID</span>
                        <span className="case-info__value font-mono text-sm">{data.case_id}</span>
                    </div>
                    <div className="case-info__field">
                        <span className="case-info__label">Registration</span>
                        <span className="case-info__value">{data.registration}</span>
                    </div>
                    <div className="case-info__field">
                        <span className="case-info__label">Aircraft Type</span>
                        <span className="case-info__value">{data.aircraft_type}</span>
                    </div>
                    <div className="case-info__field">
                        <span className="case-info__label">Engine Type</span>
                        <span className="case-info__value">{data.engine_type}</span>
                    </div>
                    <div className="case-info__field">
                        <span className="case-info__label">Created</span>
                        <span className="case-info__value flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {formatDate(data.created_at)}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`tabs__tab ${activeTab === tab.key ? "tabs__tab--active" : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className="tabs__tab-count">{tab.count}</span>
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
                    <div className="page-section">
                        <div className="page-section__header">
                            <h3 className="page-section__title">
                                AI Findings
                                <span className="page-section__count">{data.findings.length}</span>
                            </h3>
                        </div>
                        {data.findings.length === 0 ? (
                            <EmptyState
                                icon={<AlertTriangle size={28} />}
                                title="No Findings"
                                description="No AI findings have been generated for this case."
                            />
                        ) : (
                            <div className="grid-findings">
                                {data.findings.map((finding, i) => (
                                    <FindingCard key={finding.id} finding={finding} index={i} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "engine" && (
                    <div className="page-section">
                        <div className="page-section__header">
                            <h3 className="page-section__title">
                                Engine Metrics
                                <span className="page-section__count">{data.engine_data.length}</span>
                            </h3>
                        </div>
                        {data.engine_data.length === 0 ? (
                            <EmptyState
                                icon={<Gauge size={28} />}
                                title="No Engine Data"
                                description="No engine metrics have been extracted for this case."
                            />
                        ) : (
                            <div className="grid-metrics">
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
                    <div className="page-section">
                        <div className="page-section__header">
                            <h3 className="page-section__title">
                                Ingested Documents
                                <span className="page-section__count">{data.documents.length}</span>
                            </h3>
                        </div>
                        {data.documents.length === 0 ? (
                            <EmptyState
                                icon={<FileText size={28} />}
                                title="No Documents"
                                description="No documents have been ingested for this case."
                            />
                        ) : (
                            <div className="grid-documents">
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
