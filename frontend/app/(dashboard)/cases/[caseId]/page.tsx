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
import type { CaseDetail, Finding } from "@/lib/types";
import {
    Plane,
    Gauge,
    AlertTriangle,
    FileText,
    Calendar,
    Link as LinkIcon,
} from "lucide-react";

type TabType = "findings" | "metrics" | "documents";

export default function CaseDetailPage() {
    const params = useParams();
    const rawParam = (params.caseId as string) ?? "";
    const caseId = rawParam ? decodeURIComponent(rawParam) : "";
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

    return (
        <div className="px-6 md:px-8 pb-12 overflow-x-hidden">
            <Header
                title={`Case: ${data.case_id}`}
                subtitle={`${data.registration} — ${data.aircraft_type}`}
            />

            {/* ── Asset Summary Bar (Persistent context) ── */}
            <div className="flex flex-wrap items-center gap-6 py-4 px-6 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 mt-2 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100"><Plane size={20} /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration</p>
                        <p className="text-[14px] font-black text-slate-900 uppercase">{data.registration}</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
                    <p className="text-[14px] font-bold text-slate-700">{data.aircraft_type}</p>
                </div>
                <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine</p>
                    <p className="text-[14px] font-bold text-slate-700">{data.engine_type}</p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                         <Calendar size={14} className="opacity-50" />
                         {formatDate(data.created_at)}
                     </div>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex border-b border-slate-200 mb-8 gap-8">
                {[
                    { id: "findings", label: "Findings Report", icon: AlertTriangle },
                    { id: "metrics", label: "Health Metrics", icon: Gauge },
                    { id: "documents", label: "Source Documents", icon: FileText },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`group flex items-center gap-2.5 py-4 px-1 relative transition-all border-0 bg-transparent cursor-pointer ${
                            activeTab === tab.id 
                            ? "text-blue-600" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? "text-blue-600" : "text-slate-300 group-hover:text-slate-400"} />
                        <span className="text-[13px] font-bold uppercase tracking-widest">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="min-h-[600px]">
                {activeTab === "findings" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {data.findings.length === 0 ? (
                            <div className="premium-card p-12">
                                <EmptyState
                                    icon={<AlertTriangle size={28} />}
                                    title="No Findings"
                                    description="No AI findings have been generated for this case."
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-10">
                                {(() => {
                                    const bySeverity = {
                                        "STOP": data.findings.filter(f => f.severity === "STOP"),
                                        "FLAG": data.findings.filter(f => f.severity === "FLAG"),
                                        "ADVISORY": data.findings.filter(f => f.severity === "ADVISORY"),
                                    };

                                    const renderSeverityGroup = (severity: string, findings: Finding[], bgColor: string, textColor: string, titleColor: string) => {
                                        if (findings.length === 0) return null;
                                        
                                        // Internal group by correlation
                                        const grouped = new Map<string, Finding[]>();
                                        const independent: Finding[] = [];
                                        findings.forEach(f => {
                                            const group = f.metadata_json?.correlation_group;
                                            if (group) {
                                                if (!grouped.has(group)) grouped.set(group, []);
                                                grouped.get(group)!.push(f);
                                            } else {
                                                independent.push(f);
                                            }
                                        });

                                        return (
                                            <div key={severity} className="space-y-6">
                                                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                                                     <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${bgColor} ${textColor} ring-1 ring-inset ${titleColor}/20`}>
                                                         {severity}
                                                     </span>
                                                     <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-wider">
                                                         {findings.length} {findings.length === 1 ? 'Technical Finding' : 'Technical Findings'}
                                                     </h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                                    {Array.from(grouped.values()).flat().map((finding, i) => (
                                                        <FindingCard key={finding.id} finding={finding} index={i} />
                                                    ))}
                                                    {independent.map((finding, i) => (
                                                        <FindingCard key={finding.id} finding={finding} index={i} />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    };

                                    return (
                                        <>
                                            {renderSeverityGroup("STOP", bySeverity["STOP"], "bg-rose-600", "text-white", "rose")}
                                            {renderSeverityGroup("FLAG", bySeverity["FLAG"], "bg-amber-500", "text-white", "amber")}
                                            {renderSeverityGroup("ADVISORY", bySeverity["ADVISORY"], "bg-blue-600", "text-white", "blue")}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "metrics" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg"><Gauge size={18} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Health Metrics Analysis</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Twin Status Sheet</p>
                                </div>
                            </div>
                        </div>

                        {data.engine_data.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="bg-slate-100 p-5 rounded-none border-l-4 border-blue-500">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Performance</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-black font-mono">
                                            {data.engine_data.find(m => m.metric_name.includes("EGT"))?.metric_value || "—"}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">EGT Margin</span>
                                    </div>
                                </div>
                                <div className="bg-slate-100 p-5 rounded-none border-l-4 border-emerald-500">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Life</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-black font-mono">
                                            {data.engine_data.find(m => m.metric_name.includes("CSN"))?.metric_value || "—"}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Cycles Since New</span>
                                    </div>
                                </div>
                                <div className="bg-slate-100 p-5 rounded-none border-l-4 border-amber-500">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Maintenance Scope</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-black font-mono">
                                            {data.engine_data.find(m => m.metric_name.includes("LLP"))?.metric_value || "—"}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">LLP Min Remaining</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {data.engine_data.length === 0 ? (
                            <div className="bg-slate-50 border border-dashed border-slate-200 p-16 text-center">
                                <Gauge size={40} className="mx-auto text-slate-300 mb-4" />
                                <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest mb-1">No Metrics Extracted</h4>
                                <p className="text-slate-400 text-[11px] max-w-xs mx-auto font-medium">Please ensure technical status sheets are uploaded for automated parameter extraction.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {data.engine_data.map((metric, i) => (
                                    <MetricCard key={metric.id} metric={metric} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "documents" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg"><FileText size={18} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Technical Records Vault</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Inventory Status</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 border border-slate-100">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Total Assets</span>
                                    <span className="text-[14px] font-bold text-slate-900">{data.documents.length} Files</span>
                                </div>
                                <div className="w-px h-6 bg-slate-200" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Ingested Volume</span>
                                    <span className="text-[14px] font-bold text-slate-900">
                                        {data.documents.reduce((acc, d) => acc + (d.page_count || 0), 0)} Pages
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {data.documents.map((doc, i) => (
                                <DocumentCard key={doc.id} doc={doc} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
