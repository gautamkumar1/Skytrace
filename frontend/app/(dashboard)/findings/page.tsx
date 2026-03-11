"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import FindingCard from "@/components/findings/FindingCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/utils";
import type { FleetSummaryRow, Finding, FindingSeverity } from "@/lib/types";
import { AlertTriangle, Filter } from "lucide-react";

export default function FindingsPage() {
    const [fleet, setFleet] = useState<FleetSummaryRow[]>([]);
    const [selectedCase, setSelectedCase] = useState<string>("");
    const [findings, setFindings] = useState<Finding[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingFindings, setLoadingFindings] = useState(false);
    const [severityFilter, setSeverityFilter] = useState<FindingSeverity | "ALL">("ALL");

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
        setLoadingFindings(true);
        apiFetch<{ findings: Finding[] }>(`/api/cases/${encodeURIComponent(selectedCase)}`)
            .then((data) => setFindings(data.findings || []))
            .catch(console.error)
            .finally(() => setLoadingFindings(false));
    }, [selectedCase]);

    const filtered =
        severityFilter === "ALL"
            ? findings
            : findings.filter((f) => f.severity === severityFilter);

    if (loading) return <LoadingSpinner text="Loading findings..." />;

    return (
        <>
            <Header
                title="AI Findings"
                subtitle="Review and provide feedback on AI-generated findings"
            />

            {/* Filters */}
            <motion.div
                className="flex flex-wrap items-center gap-3 mb-6 mt-10 px-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-2">
                    <Filter size={15} className="text-slate-400" />
                    <select
                        value={selectedCase}
                        onChange={(e) => setSelectedCase(e.target.value)}
                        id="findings-case-select"
                        className="bg-white border border-slate-200 rounded-lg text-slate-700 px-3 py-2 text-sm outline-none cursor-pointer min-w-[200px] focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                    >
                        {fleet.map((c) => (
                            <option key={c.case_id} value={c.case_id}>
                                {c.registration} — {c.case_id}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-1.5">
                    {(["ALL", "STOP", "FLAG", "ADVISORY", "CLEAR"] as const).map((sev) => (
                        <motion.button
                            key={sev}
                            onClick={() => setSeverityFilter(sev)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${severityFilter === sev
                                ? "bg-blue-50 border-blue-300 text-blue-700"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                }`}
                        >
                            {sev}
                        </motion.button>
                    ))}
                </div>

                <span className="ml-auto text-sm text-slate-400">
                    {filtered.length} finding{filtered.length !== 1 ? "s" : ""}
                </span>
            </motion.div>

            {/* Findings List */}
            {loadingFindings ? (
                <LoadingSpinner text="Loading findings..." />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={<AlertTriangle size={28} />}
                    title="No Findings"
                    description={
                        findings.length === 0
                            ? "No findings have been generated for this case yet."
                            : "No findings match the selected filter."
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                    {filtered.map((finding, i) => (
                        <FindingCard key={finding.id} finding={finding} index={i} />
                    ))}
                </div>
            )}
        </>
    );
}
