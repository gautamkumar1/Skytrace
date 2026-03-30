"use client";

import DroneBatchTraceView from "@/components/drone/DroneBatchTraceView";
import { getMockDroneBatches, type BatchOriginInfo } from "@/lib/droneLookup";
import {
    Shield,
    Info,
    AlertTriangle,
    ArrowUpRight,
    Search,
    Download,
    RefreshCw,
    Filter,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function DroneCompliancePage() {
    const [query, setQuery] = useState("");
    const [complianceFilter, setComplianceFilter] = useState<"all" | "eu" | "non-eu">("all");
    const [refreshKey, setRefreshKey] = useState(0);

    const allBatches = useMemo(() => {
        // refreshKey intentionally used to allow “Refresh” without a backend
        void refreshKey;
        return getMockDroneBatches();
    }, [refreshKey]);

    const filteredBatches = useMemo(() => {
        const q = query.trim().toLowerCase();
        return allBatches.filter((b) => {
            const matchesQuery =
                q.length === 0 ||
                b.batchId.toLowerCase().includes(q) ||
                b.partName.toLowerCase().includes(q) ||
                b.originSource.toLowerCase().includes(q);

            const matchesCompliance =
                complianceFilter === "all" ||
                (complianceFilter === "eu" && b.isEUApproved) ||
                (complianceFilter === "non-eu" && !b.isEUApproved);

            return matchesQuery && matchesCompliance;
        });
    }, [allBatches, complianceFilter, query]);

    const stats = useMemo(() => {
        const total = allBatches.length;
        const eu = allBatches.filter((b) => b.isEUApproved).length;
        const nonEu = total - eu;
        const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
        return {
            total,
            eu,
            nonEu,
            euPct: pct(eu),
            nonEuPct: pct(nonEu),
        };
    }, [allBatches]);

    const exportCsv = () => {
        const rows = filteredBatches;
        const header = ["batchId", "partName", "quantity", "originSource", "isEUApproved", "verificationDate"];
        const escape = (v: unknown) => {
            const s = String(v ?? "");
            const needsQuotes = /[",\n]/.test(s);
            const safe = s.replaceAll('"', '""');
            return needsQuotes ? `"${safe}"` : safe;
        };
        const csv = [
            header.join(","),
            ...rows.map((r) =>
                [
                    r.batchId,
                    r.partName,
                    r.quantity,
                    r.originSource,
                    r.isEUApproved ? "true" : "false",
                    r.verificationDate,
                ]
                    .map(escape)
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `drone-batches-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const onViewSourceCert = (batch: BatchOriginInfo) => {
        alert(`Source cert viewer (demo)\n\n${batch.partName}\n${batch.batchId}`);
    };

    return (
        <div className="p-8 max-w-[1200px] mx-auto min-h-screen bg-[#f8fbff]/30">
            <div className="mb-10 flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                            <Shield className="w-3 h-3" />
                            Targeting EU Regulatory Compliance (Mid-2026)
                        </div>
                        <h1 className="text-[32px] font-extrabold text-[#1a2a3a] tracking-tight leading-none mb-3">
                            Drone Origin Trace & Compliance
                        </h1>
                        <p className="text-[15px] font-medium text-slate-500 max-w-[720px] leading-relaxed">
                            End-to-end traceability for UAV components. Automated verification of EU-approved sources with immutable evidence chains for regulatory audits.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={exportCsv}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            type="button"
                            onClick={() => setRefreshKey((k) => k + 1)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Batches monitored</div>
                        <div className="text-[28px] font-extrabold text-[#1a2a3a] leading-none">{stats.total}</div>
                        <div className="mt-3 text-[12px] font-semibold text-slate-500">Live demo dataset</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">EU compliant</div>
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {stats.euPct}%
                            </div>
                        </div>
                        <div className="text-[28px] font-extrabold text-[#1a2a3a] leading-none">{stats.eu}</div>
                        <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${stats.euPct}%` }} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Review required</div>
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                                <XCircle className="w-3.5 h-3.5" /> {stats.nonEuPct}%
                            </div>
                        </div>
                        <div className="text-[28px] font-extrabold text-[#1a2a3a] leading-none">{stats.nonEu}</div>
                        <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${stats.nonEuPct}%` }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
                    <div className="flex-1 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Search className="w-4.5 h-4.5 text-slate-500" />
                        </div>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search batch ID, part name, origin source…"
                            className="w-full text-[14px] font-semibold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                            <Filter className="w-3.5 h-3.5" /> Filter
                        </div>
                        {[
                            { id: "all" as const, label: "All" },
                            { id: "eu" as const, label: "EU compliant" },
                            { id: "non-eu" as const, label: "Review required" },
                        ].map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setComplianceFilter(f.id)}
                                className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                                    complianceFilter === f.id
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                        <div className="text-[12px] font-semibold text-slate-500 px-2">
                            Showing <span className="font-extrabold text-slate-800">{filteredBatches.length}</span> of{" "}
                            <span className="font-extrabold text-slate-800">{allBatches.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                <div className="lg:col-span-3">
                    <DroneBatchTraceView batches={filteredBatches} showHeader={false} onViewSourceCert={onViewSourceCert} />
                </div>
                
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#1a2a3a] mb-5">Origin Statistics</h3>
                        <div className="space-y-4">
                            {[
                                { label: "EU Sources", val: `${stats.euPct}%`, color: "bg-emerald-500" },
                                { label: "Review required", val: `${stats.nonEuPct}%`, color: "bg-amber-400" },
                            ].map(stat => (
                                <div key={stat.label}>
                                    <div className="flex items-center justify-between text-[13px] font-bold text-[#1a2a3a] mb-2">
                                        <span>{stat.label}</span>
                                        <span>{stat.val}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${stat.color}`} style={{ width: stat.val }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1a5276] p-6 rounded-2xl text-white relative overflow-hidden group cursor-pointer shadow-lg shadow-blue-900/10">
                         <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                             <Info className="w-12 h-12" />
                         </div>
                         <h4 className="text-[15px] font-bold mb-2">Compliance Alert</h4>
                         <p className="text-[12px] font-medium text-white/70 leading-relaxed mb-4">
                             New EASA regulation draft v3.2 requires extra validation for battery batches starting June 2026.
                         </p>
                         <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-200">
                             Learn More <ArrowUpRight className="w-3 h-3" />
                         </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[15px] font-bold text-[#1a2a3a]">Queue</h3>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today</div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[13px] font-extrabold text-[#1a2a3a] leading-tight">
                                        {stats.nonEu} batches need review
                                    </div>
                                    <div className="text-[12px] font-semibold text-slate-500 leading-relaxed">
                                        Prioritize non‑EU origin sources for evidence collection & approval.
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setComplianceFilter("non-eu")}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-all"
                            >
                                Review queue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
