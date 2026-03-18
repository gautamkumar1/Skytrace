"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Header from "@/components/layout/Header";
import { ShieldCheck, Clock, History, AlertCircle, Search, Loader2, X, FileCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/utils";
import type { LLPPart, LLPStats, LLPBtbStatus } from "@/lib/types";
import LLPTable from "@/components/llp/LLPTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

type BtbFilter = "all" | LLPBtbStatus;

export default function LLPPage() {
    const [parts, setParts] = useState<LLPPart[]>([]);
    const [stats, setStats] = useState<LLPStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [btbFilter, setBtbFilter] = useState<BtbFilter>("all");
    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [auditRunning, setAuditRunning] = useState(false);
    const [auditResult, setAuditResult] = useState<{
        run_at: string;
        total_parts: number;
        verified: number;
        pending_review: number;
        gap: number;
        overdue: number;
        items_flagged: { part_number: string; serial_number: string; registration: string; reason: string }[];
    } | null>(null);

    const fetchLLP = useCallback(async () => {
        setError(null);
        try {
            const res = await apiFetch<{ parts: LLPPart[]; stats: LLPStats }>("/api/llp");
            setParts(res.parts);
            setStats(res.stats);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLLP();
    }, [fetchLLP]);

    const runBtbAudit = useCallback(async () => {
        setAuditRunning(true);
        setAuditResult(null);
        setAuditModalOpen(true);
        try {
            const result = await fetch("/api/llp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "run_btb_audit" }),
            }).then((r) => r.json());
            if (result.error) throw new Error(result.error);
            setAuditResult(result);
        } catch (e) {
            setAuditResult({
                run_at: new Date().toISOString(),
                total_parts: 0,
                verified: 0,
                pending_review: 0,
                gap: 0,
                overdue: 0,
                items_flagged: [],
            });
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setAuditRunning(false);
        }
    }, []);

    const filteredParts = useMemo(() => {
        let list = parts;
        if (btbFilter !== "all") {
            list = list.filter((p) => p.btb_status === btbFilter);
        }
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            list = list.filter(
                (p) =>
                    p.part_number.toLowerCase().includes(q) ||
                    p.serial_number.toLowerCase().includes(q) ||
                    p.registration.toLowerCase().includes(q) ||
                    p.part_name.toLowerCase().includes(q)
            );
        }
        return list;
    }, [parts, btbFilter, searchQuery]);

    if (loading && parts.length === 0) {
        return (
            <>
                <Header
                    title="Life Limited Parts (LLP)"
                    subtitle="EASA Compliance & Back-to-Birth (BTB) Traceability Tracking"
                />
                <LoadingSpinner text="Loading LLP data..." />
            </>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header
                title="Life Limited Parts (LLP)"
                subtitle="EASA Compliance & Back-to-Birth (BTB) Traceability Tracking"
            >
                <button
                    onClick={runBtbAudit}
                    disabled={auditRunning}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a5276] text-white rounded-xl text-sm font-semibold hover:bg-[#154360] disabled:opacity-50 transition-all"
                >
                    {auditRunning ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <FileCheck size={16} />
                    )}
                    Initialize BTB Audit
                </button>
            </Header>

            <div className="flex-1 p-6 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto space-y-6"
                >
                    {/* Compliance Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-amber-900">
                                EASA Part M.A.305 / M.A.503 Compliance
                            </h3>
                            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                Continuous tracking of service life (FH, FC, or Calendar) is mandatory. Full
                                &quot;Back to Birth&quot; history is required for all hardware. Missing
                                documentation results in immediate grounding of the aircraft.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle size={20} className="text-rose-600 shrink-0" />
                            <p className="text-sm text-rose-800 flex-1">{error}</p>
                            <button
                                onClick={() => { setError(null); fetchLLP(); }}
                                className="text-xs font-semibold text-rose-700 hover:text-rose-900"
                            >
                                Retry
                            </button>
                        </motion.div>
                    )}

                    {/* Stats from API */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="premium-card p-6 relative overflow-hidden group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <Clock size={22} />
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">
                                            {stats.active_tracking}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Active tracking
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card p-6 relative overflow-hidden group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <History size={22} />
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">
                                            {stats.pending_btb_review}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Pending BTB review
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card p-6 relative overflow-hidden group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">
                                            {stats.compliance_rate_percent}%
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Compliance rate
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card p-6 relative overflow-hidden group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        <AlertCircle size={22} />
                                    </div>
                                    <div>
                                        <span className="block text-2xl font-semibold text-slate-900 leading-none tracking-tight mb-1">
                                            {stats.overdue_count}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Overdue
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters + Table */}
                    <div className="premium-card overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
                            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                                LLP register
                            </h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative flex-1 sm:max-w-[220px]">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Part, serial, registration..."
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg">
                                    {(["all", "verified", "pending_review", "gap", "overdue"] as const).map(
                                        (f) => (
                                            <button
                                                key={f}
                                                onClick={() => setBtbFilter(f)}
                                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                                                    btbFilter === f
                                                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                                        : "text-slate-500 hover:text-slate-700"
                                                }`}
                                            >
                                                {f === "all" ? "All" : f.replace("_", " ")}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        {parts.length === 0 ? (
                            <div className="p-12">
                                <EmptyState
                                    icon={<ShieldCheck size={28} />}
                                    title="No LLP data"
                                    description="LLP records will appear here once linked to cases or after running a BTB audit."
                                />
                            </div>
                        ) : (
                            <LLPTable parts={filteredParts} />
                        )}
                    </div>
                </motion.div>
            </div>

            {/* BTB Audit modal */}
            <AnimatePresence>
                {auditModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !auditRunning && setAuditModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900">BTB Audit Result</h3>
                                <button
                                    onClick={() => !auditRunning && setAuditModalOpen(false)}
                                    disabled={auditRunning}
                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="px-6 py-4 overflow-y-auto flex-1">
                                {auditRunning ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <Loader2 size={40} className="text-[#1a5276] animate-spin" />
                                        <p className="text-sm font-medium text-slate-600">Running BTB audit...</p>
                                    </div>
                                ) : auditResult ? (
                                    <div className="space-y-6">
                                        <p className="text-xs text-slate-500">
                                            Run at{" "}
                                            {new Date(auditResult.run_at).toLocaleString(undefined, {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-xl bg-slate-50">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total parts</span>
                                                <p className="text-xl font-bold text-slate-900 mt-0.5">{auditResult.total_parts}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-emerald-50">
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verified</span>
                                                <p className="text-xl font-bold text-emerald-800 mt-0.5">{auditResult.verified}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-amber-50">
                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending review</span>
                                                <p className="text-xl font-bold text-amber-800 mt-0.5">{auditResult.pending_review}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-rose-50">
                                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Gap / Overdue</span>
                                                <p className="text-xl font-bold text-rose-800 mt-0.5">{auditResult.gap + auditResult.overdue}</p>
                                            </div>
                                        </div>
                                        {auditResult.items_flagged.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                    Flagged items ({auditResult.items_flagged.length})
                                                </h4>
                                                <ul className="space-y-2 max-h-48 overflow-y-auto">
                                                    {auditResult.items_flagged.map((item, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex flex-wrap gap-2 text-[12px] p-2 rounded-lg bg-slate-50 border border-slate-100"
                                                        >
                                                            <span className="font-mono font-semibold text-slate-800">{item.part_number}</span>
                                                            <span className="text-slate-500">SN {item.serial_number}</span>
                                                            <span className="text-slate-600">{item.registration}</span>
                                                            <span className="text-amber-700 text-[11px]">{item.reason}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setAuditModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
