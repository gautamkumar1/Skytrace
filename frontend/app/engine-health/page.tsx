"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/engine/MetricCard";
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
        (m) => m.status === "warning" || m.status === "critical" || m.status === "danger"
    );

    if (loading) return <LoadingSpinner text="Loading engine data..." />;

    return (
        <>
            <Header title="Engine Health" subtitle="Monitor engine performance metrics by case" />

            <motion.div
                className="flex items-center gap-3 mb-6"
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
                <>
                    {criticalMetrics.length > 0 && (
                        <motion.div
                            className="page-section"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className="page-section__header">
                                <h3 className="page-section__title">
                                    <AlertTriangle size={16} className="text-rose-500" />
                                    <span className="text-rose-700">Critical / Warning</span>
                                    <span className="page-section__count">{criticalMetrics.length}</span>
                                </h3>
                            </div>
                            <div className="grid-metrics">
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
                            className="page-section"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.35 }}
                        >
                            <div className="page-section__header">
                                <h3 className="page-section__title">
                                    <AlertTriangle size={16} className="text-amber-500" />
                                    <span className="text-amber-700">Advisory / Caution</span>
                                    <span className="page-section__count">{advisoryMetrics.length}</span>
                                </h3>
                            </div>
                            <div className="grid-metrics">
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
                            className="page-section"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.35 }}
                        >
                            <div className="page-section__header">
                                <h3 className="page-section__title">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <span className="text-emerald-700">Normal</span>
                                    <span className="page-section__count">{okMetrics.length}</span>
                                </h3>
                            </div>
                            <div className="grid-metrics">
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
                </>
            )}
        </>
    );
}
