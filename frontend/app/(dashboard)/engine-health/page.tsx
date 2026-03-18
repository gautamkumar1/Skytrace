"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/engine/MetricCard";
import EngineFocusView from "@/components/models/EngineFocusView";
import TopPartsReference from "@/components/engine/TopPartsReference";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/utils";
import type { FleetSummaryRow, EngineMetric } from "@/lib/types";
import { Gauge, Filter, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function EngineHealthPage() {
    const [fleet, setFleet] = useState<FleetSummaryRow[]>([]);
    const [selectedCase, setSelectedCase] = useState<string>("");
    const [metrics, setMetrics] = useState<EngineMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMetrics, setLoadingMetrics] = useState(false);

    useEffect(() => {
        apiFetch<FleetSummaryRow[]>("/api/fleet")
            .then((data) => {
                setFleet(data);
                if (data.length > 0) setSelectedCase(data[0].case_id);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedCase) return;
        setLoadingMetrics(true);
        apiFetch<{ engine_data: EngineMetric[] }>(`/api/cases/${encodeURIComponent(selectedCase)}`)
            .then((data) => setMetrics(data.engine_data || []))
            .catch(console.error)
            .finally(() => setLoadingMetrics(false));
    }, [selectedCase]);

    const okMetrics = metrics.filter((m) => m.status === "ok" || m.status === "normal");
    const advisoryMetrics = metrics.filter((m) => m.status === "advisory" || m.status === "caution");
    const criticalMetrics = metrics.filter(
        (m) => m.status === "warning" || m.status === "critical" || m.status === "danger" || m.status === "flag"
    );

    const overallStatus: "red" | "amber" | "green" = criticalMetrics.length > 0 ? "red" : advisoryMetrics.length > 0 ? "amber" : "green";

    const getHighlightedParts = () => {
        const parts = new Set<string>();
        metrics.forEach((m) => {
            if (m.status !== "ok" && m.status !== "normal") {
                const name = m.metric_name.toUpperCase();
                if (name.includes("EGT")) {
                    parts.add("exhaust");
                    parts.add("Nozzle");
                    parts.add("Core");
                } else if (name.includes("LLP") || name.includes("CYCLES")) {
                    parts.add("blades");
                    parts.add("fanWheel");
                    parts.add("Core");
                } else {
                    parts.add("casing");
                    parts.add("EngineL");
                    parts.add("Nacelle");
                }
            }
        });
        return Array.from(parts);
    };
    const highlightedParts = getHighlightedParts();

    if (loading) return <LoadingSpinner text="Loading engine data..." />;

    return (
        <>
            <Header title="Engine Health" subtitle="Monitor engine performance metrics by case" />

            <motion.div
                className="flex items-center gap-3 mb-6 mt-10 px-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Filter size={15} className="text-slate-400" />
                <select
                    value={selectedCase}
                    onChange={(e) => setSelectedCase(e.target.value)}
                    id="engine-case-select"
                    className="bg-white border border-slate-200 rounded-lg text-slate-700 px-3 py-2 text-sm outline-none cursor-pointer min-w-[260px] focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                >
                    {fleet.map((c) => (
                        <option key={c.case_id} value={c.case_id}>
                            {c.registration} — {c.aircraft_type} ({c.case_id})
                        </option>
                    ))}
                </select>
                <span className="text-sm text-slate-400">
                    {metrics.length} metric{metrics.length !== 1 ? "s" : ""}
                </span>
            </motion.div>

            {loadingMetrics ? (
                <LoadingSpinner text="Loading metrics..." />
            ) : metrics.length === 0 ? (
                <EmptyState
                    icon={<Gauge size={28} />}
                    title="No Engine Metrics"
                    description="No engine performance data has been extracted for this case."
                />
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 px-2 mb-8">
                    {/* 3D Model Column */}
                    <motion.div
                        className="w-full lg:w-[50%] xl:w-[50%] flex-shrink-0 border border-slate-200/60 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col h-[400px] lg:h-[calc(100vh-220px)] lg:sticky lg:top-24"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between">
                            <div>
                                <h3 className="m-0 text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Gauge size={16} className="text-blue-500" />
                                    Engine Digital Twin
                                </h3>
                                <p className="text-[11px] text-slate-500 m-0 mt-0.5 font-medium">Live structural overview</p>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${overallStatus === 'red' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                    overallStatus === 'amber' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                        'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}>
                                {overallStatus}
                            </div>
                        </div>
                        <div className="flex-1 relative bg-gradient-to-b from-slate-50/50 to-slate-100/50">
                            <EngineFocusView status={overallStatus} highlightedParts={highlightedParts} />
                        </div>
                    </motion.div>

                    {/* Metrics Column */}
                    <div className="flex-1 space-y-6">
                        {criticalMetrics.length > 0 && (
                            <motion.div
                                className="px-2"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <div className="flex items-center justify-between mb-3.5">
                                    <h3 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#0c1d36]">
                                        <AlertTriangle size={16} className="text-rose-500" />
                                        <span className="text-rose-700">Critical / Warning</span>
                                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 border border-rose-100">{criticalMetrics.length}</span>
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                    {criticalMetrics.map((m, i) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                        >
                                            <MetricCard metric={m} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {advisoryMetrics.length > 0 && (
                            <motion.div
                                className="px-2"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.35 }}
                            >
                                <div className="flex items-center justify-between mb-3.5">
                                    <h3 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#0c1d36]">
                                        <AlertTriangle size={16} className="text-amber-500" />
                                        <span className="text-amber-700">Advisory / Caution</span>
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 border border-amber-100">{advisoryMetrics.length}</span>
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                    {advisoryMetrics.map((m, i) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                                        >
                                            <MetricCard metric={m} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {okMetrics.length > 0 && (
                            <motion.div
                                className="px-2"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.35 }}
                            >
                                <div className="flex items-center justify-between mb-3.5">
                                    <h3 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#0c1d36]">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        <span className="text-emerald-700">Normal</span>
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-100">{okMetrics.length}</span>
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                    {okMetrics.map((m, i) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                                        >
                                            <MetricCard metric={m} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* Top 50 most changed parts reference */}
            <div className="mt-12 px-2">
                <TopPartsReference />
            </div>
        </>
    );
}
