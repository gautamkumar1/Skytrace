"use client";

import React, { useState, useEffect } from "react";
import AirplaneCanvas from "@/components/models/AirplaneModel";
import EngineFocusView from "@/components/models/EngineFocusView";
import { FileText, Cpu, AlertTriangle, CheckCircle, ShieldAlert, Plane, Activity, ChevronRight, X, ChevronDown, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MaintenanceTimeline, { type TimelineEvent } from "@/components/aircraft/MaintenanceTimeline";

type PartStatus = "green" | "amber" | "red";

interface FleetAircraft {
    case_id: string;
    registration: string;
    aircraft_type: string;
    engine_type: string;
    doc_count: number;
    finding_count: number;
    engine_metric_count: number;
}

interface Finding {
    id: string;
    category: string;
    severity: string;
    title: string;
    evidence: string;
    created_at?: string | null;
}

interface EngineMetric {
    metric_name: string;
    metric_value: string | number;
    unit: string;
    status: string;
    created_at?: string | null;
}

interface DocumentRow {
    id: string;
    filename: string;
    created_at?: string | null;
    metadata_json?: Record<string, unknown> | null;
}

interface CaseDetail {
    case_id: string;
    registration: string;
    findings: Finding[];
    engine_data: EngineMetric[];
    documents?: DocumentRow[];
    created_at?: string | null;
}

const StatusIcon = ({ status }: { status: PartStatus }) => {
    switch (status) {
        case "green":
            return <CheckCircle className="w-5 h-5" />;
        case "amber":
            return <AlertTriangle className="w-5 h-5" />;
        case "red":
            return <ShieldAlert className="w-5 h-5" />;
    }
};

const mapFindingsToStatus = (findings: Finding[]) => {
    const status = {
        undercarriage: "green" as PartStatus,
        wings: "green" as PartStatus,
        engines: "green" as PartStatus,
    };

    findings.forEach(f => {
        const cat = f.category.toLowerCase();
        let targetPart: keyof typeof status | null = null;

        if (cat.includes("engine")) targetPart = "engines";
        else if (cat.includes("wing") || cat.includes("flap") || cat.includes("slat")) targetPart = "wings";
        else if (cat.includes("undercarriage") || cat.includes("gear") || cat.includes("landing")) targetPart = "undercarriage";

        if (targetPart) {
            const newSeverity = f.severity.toUpperCase();
            if (newSeverity === "STOP" || newSeverity === "FLAG") status[targetPart] = "red";
            else if (newSeverity === "ADVISORY" && status[targetPart] !== "red") status[targetPart] = "amber";
        }
    });

    return status;
};

function FleetDropdown({ fleet, selectedCaseId, onSelect }: {
    fleet: FleetAircraft[];
    selectedCaseId: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="relative inline-flex items-center">
            <select
                value={selectedCaseId || ""}
                onChange={(e) => onSelect(e.target.value)}
                className="
                    appearance-none bg-white/50 border border-[#2563a8]/20 rounded-lg px-3 py-1 pr-8
                    text-[12px] xl:text-[13px] font-bold text-[#1a5276] cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-[#2563a8]/20 focus:border-[#2563a8]/40
                    transition-all backdrop-blur-sm
                    hover:bg-white hover:border-[#2563a8]/40
                "
            >
                {fleet.map((ac) => (
                    <option key={ac.case_id} value={ac.case_id} className="text-slate-900 bg-white">
                        {ac.registration} ({ac.aircraft_type})
                    </option>
                ))}
            </select>
            <div className="absolute right-2 px-1 pointer-events-none text-[#2563a8]/60">
                <ChevronDown size={14} />
            </div>
        </div>
    );
}

const severityStyles: Record<string, string> = {
    STOP: "bg-rose-100 text-rose-700",
    FLAG: "bg-rose-100 text-rose-700",
    ADVISORY: "bg-amber-100 text-amber-700",
};

const statusCardStyles: Record<PartStatus, string> = {
    green: "border-l-emerald-600 bg-white hover:bg-emerald-50/50",
    amber: "border-l-amber-500 bg-amber-50/60 hover:bg-amber-50",
    red: "border-l-rose-500 bg-rose-50/60 hover:bg-rose-50",
};

const statusIconBg: Record<PartStatus, string> = {
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-rose-100 text-rose-600",
};

const statusLabelColor: Record<PartStatus, string> = {
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-rose-600",
};

const getStatusLabel = (status: PartStatus) => {
    switch (status) {
        case "green": return "NOMINAL";
        case "amber": return "ATTENTION";
        case "red": return "CRITICAL";
    }
};

const filterFindings = (findings: Finding[], part: string) => {
    return findings.filter(f => {
        const cat = f.category.toLowerCase();
        if (part === "engines") return cat.includes("engine");
        if (part === "wings") return cat.includes("wing") || cat.includes("flap") || cat.includes("slat");
        if (part === "undercarriage") return cat.includes("gear") || cat.includes("landing") || cat.includes("undercarriage");
        return false;
    });
};

export default function AircraftPage() {
    const [fleet, setFleet] = useState<FleetAircraft[]>([]);
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
    const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
    const [activePart, setActivePart] = useState<string | null>(null);
    const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobilePanel, setMobilePanel] = useState<"fleet" | "findings" | null>(null);

    useEffect(() => {
        const fetchFleet = async () => {
            try {
                const res = await fetch("/api/fleet");
                const data = await res.json();
                setFleet(data);
                if (data.length > 0) setSelectedCaseId(data[0].case_id);
            } catch (err) {
                console.error("Failed to fetch fleet:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFleet();
    }, []);

    useEffect(() => {
        if (!selectedCaseId) return;
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/cases/${encodeURIComponent(selectedCaseId)}`);
                const data = await res.json();
                setCaseDetail(data);
                setActivePart(null);
            } catch (err) {
                console.error("Failed to fetch case detail:", err);
            }
        };
        fetchDetail();
    }, [selectedCaseId]);

    const activeAircraft = fleet.find(a => a.case_id === selectedCaseId);
    const timelineEvents = React.useMemo((): TimelineEvent[] => {
        if (!caseDetail) return [];
        const events: TimelineEvent[] = [];

        if (caseDetail.created_at) {
            events.push({
                id: `case-${caseDetail.case_id}`,
                date: caseDetail.created_at,
                kind: "ownership",
                title: "Acquired / Case opened",
                subtitle: caseDetail.registration,
                detail: "Start of record traceability",
            });
        }

        // Add dummy maintenance event for zig-zag demo
        events.push({
            id: `maint-demo-1`,
            date: new Date(new Date(caseDetail.created_at || Date.now()).getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            kind: "maintenance",
            title: "Scheduled A-Check",
            subtitle: "Routine Inspection",
            detail: "All systems verified nominal.",
        });

        for (const d of caseDetail.documents ?? []) {
            if (!d?.created_at) continue;
            events.push({
                id: `doc-${d.id}`,
                date: d.created_at,
                kind: "document",
                title: d.filename,
                subtitle: "Document ingested",
            });
        }

        for (const f of caseDetail.findings ?? []) {
            if (!f?.created_at) continue;
            events.push({
                id: `finding-${f.id}`,
                date: f.created_at,
                kind: "finding",
                title: f.category || "Finding",
                subtitle: f.title || "Technical issue",
                detail: f.evidence,
                severity: (f.severity?.toUpperCase?.() as any) ?? "ADVISORY",
            });
        }

        if (events.length <= 2) {
            events.push({
                id: `case-${caseDetail.case_id}-fallback`,
                date: new Date().toISOString(),
                kind: "ownership",
                title: "Timeline active",
                subtitle: "Awaiting further records",
            });
        }

        return events;
    }, [caseDetail]);
    const currentStatuses = React.useMemo(() => {
        if (!caseDetail) return { undercarriage: "green" as PartStatus, wings: "green" as PartStatus, engines: "green" as PartStatus };
        return mapFindingsToStatus(caseDetail.findings);
    }, [caseDetail]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-slate-900 font-sans font-semibold text-sm tracking-wide">
                Initializing System Telemetry…
            </div>
        );
    }

    return (
        <div className="flex h-full w-full overflow-hidden bg-white font-sans">
            {/* Mobile fleet overlay */}
            <AnimatePresence>
                {mobilePanel === "fleet" && (
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl border-r border-slate-200 lg:hidden"
                    >
                        <div className="flex items-center justify-between px-4 pt-4">
                            <span className="text-sm font-semibold text-slate-900">Fleet</span>
                            <button onClick={() => setMobilePanel(null)} className="p-1 rounded-md hover:bg-slate-100">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-4 border-b border-slate-100 mb-2">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Active Fleet Selection</span>
                        </div>
                        <div className="px-4">
                            <FleetDropdown
                                fleet={fleet}
                                selectedCaseId={selectedCaseId}
                                onSelect={(id: string) => { setSelectedCaseId(id); setMobilePanel(null); }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile backdrop */}
            {mobilePanel && (
                <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setMobilePanel(null)} />
            )}

            {/* ═══ Main Unified Column ═══ */}
            <div className="flex-1 flex flex-col bg-white relative min-w-0 overflow-y-auto overflow-x-hidden modern-scrollbar">
                {/* Mobile top bar */}
                <div className="flex lg:hidden items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <button onClick={() => setMobilePanel("fleet")} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                        <Plane className="w-3.5 h-3.5" />
                        {activeAircraft?.registration || "Fleet"}
                    </button>
                    {/* Mobile findings button removed as findings are now in main column */}
                </div>

                {/* Page header – single line, no overlap */}
                <div className="hidden lg:flex items-center gap-3 px-5 py-3 xl:px-6 xl:py-4 border-b border-slate-100 bg-white shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Plane className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">Active Fleet</span>
                        <FleetDropdown
                            fleet={fleet}
                            selectedCaseId={selectedCaseId}
                            onSelect={setSelectedCaseId}
                        />
                        <span className="text-slate-300 text-sm">·</span>
                        <h1 className="text-sm font-semibold text-slate-900 truncate">Digital Twin</h1>
                    </div>
                </div>

                {/* Row-based Layout: max-width for widescreen dashboard feel */}
                <div className="flex-1 relative min-h-0 p-6 xl:p-8">
                    <div className="max-w-5xl mx-auto space-y-8">
                        
                        {/* ─── Row 1: 65 / 35 ─── */}
                        <div className="flex flex-col lg:flex-row gap-6 max-w-full">
                            {/* 1. Aircraft Locator */}

                            <div className="lg:w-[65%] min-w-0 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <h2 className="text-[13px] font-bold text-slate-900 m-0">System Findings</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {(Object.entries(currentStatuses) as [string, PartStatus][]).map(([part, status]) => (
                                        <div
                                            key={part}
                                            className={`flex-1 flex items-center justify-between p-3 rounded-xl border border-l-[3px] transition-all duration-150 hover:shadow-md group ${statusCardStyles[status]} shadow-sm`}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[12px] xl:text-[13px] font-bold text-slate-900 capitalize">{part}</span>
                                                <span className={`text-[9px] xl:text-[10px] font-bold uppercase tracking-wider ${statusLabelColor[status]}`}>
                                                    {getStatusLabel(status)}
                                                </span>
                                            </div>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusIconBg[status]}`}>
                                                <StatusIcon status={status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="premium-card p-4 bg-blue-50/20 border-blue-100/40">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <AlertTriangle className="w-3 h-3 text-blue-600" />
                                        <span className="text-[9px] font-bold text-blue-900 uppercase tracking-widest">Digital Twin Status</span>
                                    </div>
                                    <p className="text-[10px] text-blue-800/70 leading-relaxed font-medium">
                                        Technical telemetry is synchronized with the latest record extraction.
                                    </p>
                                </div>
                            </div>
                            <div className="lg:w-[35%] min-w-0 space-y-5 overflow-hidden">
                                <div className="premium-card border border-slate-200/70 overflow-hidden h-full">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                <Plane className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[11px] font-bold text-slate-900 truncate">Aircraft locator</div>
                                                <div className="text-[9px] text-slate-400 truncate">Drag to rotate · Scroll to zoom</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[320px] p-2 bg-slate-50/50">
                                        <AirplaneCanvas
                                            status={currentStatuses}
                                            onPartClick={(part: string) => setActivePart(part === "fuselage" ? null : part)}
                                            activePart={activePart}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Findings Overview */}
                            
                        </div>

                        {/* ─── Row 2: Maintenance History (Full Width) ─── */}
                        <div className="w-full min-w-0 overflow-hidden">
                            <MaintenanceTimeline
                                title="Maintenance History"
                                subtitle="Traceability timeline of all records and changes"
                                events={timelineEvents}
                            />
                        </div>

                        {/* ─── Row 3: Engine Diagnostics (Right-Aligned) ─── */}
                        <div className="flex justify-end w-full">
                            <div className="lg:w-[35%] min-w-0">
                                <div className="premium-card border border-slate-200/70 p-6 h-full flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <Activity className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 m-0">Engine Diagnostics</h3>
                                    </div>
                                    
                                    <div className="flex-1 min-h-[280px] relative bg-slate-50/30 rounded-2xl border border-slate-100 mb-4 overflow-hidden">
                                        <EngineFocusView
                                            status={currentStatuses.engines}
                                            highlightedParts={[]}
                                        />
                                    </div>
                                    
                                    <div className="space-y-3">
                                         <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500 italic leading-relaxed">
                                            High-fidelity turbine core visualization synced with engine findings.
                                         </div>
                                         <p className="text-[11px] text-slate-400 font-medium px-1">
                                            Click on engine to inspect discrepancies.
                                         </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status bar – no engine metrics */}
                <div className="h-11 border-t border-slate-100 bg-white flex items-center px-4 xl:px-6 shrink-0">
                    <span className="text-[8px] xl:text-[9px] font-mono text-slate-400 uppercase tracking-[0.1em]">System Status</span>
                    <div className="flex items-center gap-2 text-[11px] xl:text-xs font-bold text-emerald-600 ml-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Diagnostics Active
                    </div>
                </div>
            </div>


            {/* Mobile findings overlay */}
            <AnimatePresence>
                {mobilePanel === "findings" && (
                    <motion.div
                        initial={{ x: 280 }}
                        animate={{ x: 0 }}
                        exit={{ x: 280 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-50 w-[300px] bg-white shadow-2xl border-l border-slate-200 lg:hidden"
                    >
                        <div className="flex items-center justify-between px-4 pt-4 pb-2">
                            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-amber-500" /> Findings
                            </span>
                            <button onClick={() => setMobilePanel(null)} className="p-1 rounded-md hover:bg-slate-100">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <FindingsPanel
                            activePart={activePart}
                            setActivePart={setActivePart}
                            currentStatuses={currentStatuses}
                            caseDetail={caseDetail}
                            selectedFindingId={selectedFindingId}
                            setSelectedFindingId={setSelectedFindingId}
                            hideHeader
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}




function FindingsPanel({ activePart, setActivePart, currentStatuses, caseDetail, selectedFindingId, setSelectedFindingId, hideHeader }: {
    activePart: string | null;
    setActivePart: (p: string | null) => void;
    currentStatuses: Record<string, PartStatus>;
    caseDetail: CaseDetail | null;
    selectedFindingId: string | null;
    setSelectedFindingId: (id: string | null) => void;
    hideHeader?: boolean;
}) {
    const getHighlightedParts = (finding: Finding | null) => {
        if (!finding) return [];
        const parts: string[] = [];
        const text = (finding.category + " " + finding.title + " " + finding.evidence).toLowerCase();

        if (text.includes("blade")) parts.push("blades", "fanWheel");
        if (text.includes("case") || text.includes("casing")) parts.push("casing");
        if (text.includes("intake")) parts.push("Intake");
        if (text.includes("nacelle")) parts.push("Nacelle");
        if (text.includes("exhaust") || text.includes("nozzle")) parts.push("exhaust", "Nozzle");
        if (text.includes("pylon")) parts.push("Pylon");
        if (text.includes("core")) parts.push("Core");
        if (text.includes("shroud")) parts.push("shroud");

        // If it's an engine finding but no specific part found, highlight general engine
        if (parts.length === 0 && text.includes("engine")) parts.push("EngineL");

        return parts;
    };

    const activeFinding = caseDetail?.findings.find(f => f.id === selectedFindingId) || null;
    const engineHighlights = getHighlightedParts(activeFinding);

    return (
        <>
            {!hideHeader && (
                <div className="px-4 xl:px-5 pt-4 xl:pt-5 pb-3 xl:pb-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-[13px] xl:text-sm font-bold text-slate-900 flex items-center gap-2 m-0">
                        <ShieldAlert className="w-4 h-4 xl:w-[18px] xl:h-[18px] text-amber-500" />
                        Findings
                    </h2>
                    {activePart && (
                        <button
                            onClick={() => setActivePart(null)}
                            className="text-[10px] xl:text-[11px] font-semibold text-[#2563a8] bg-sky-50 border border-[#2563a8]/15 px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-md cursor-pointer transition-all duration-150 hover:bg-[#2563a8]/10 hover:border-[#2563a8]"
                        >
                            ← Overview
                        </button>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-2.5 xl:p-3">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePart || "overview"}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {activePart ? (
                            /* ── Detail View ── */
                            <div>
                                <div className="flex items-center gap-2 mb-3 xl:mb-4">
                                    <div className={`w-8 h-8 xl:w-9 xl:h-9 rounded-lg flex items-center justify-center border ${currentStatuses[activePart] === "green"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                                        : currentStatuses[activePart] === "amber"
                                            ? "bg-amber-50 text-amber-600 border-amber-200/60"
                                            : "bg-rose-50 text-rose-600 border-rose-200/60"
                                        }`}>
                                        <StatusIcon status={currentStatuses[activePart]} />
                                    </div>
                                    <span className="text-sm xl:text-base font-bold text-slate-900 capitalize">{activePart} Telemetry</span>
                                </div>

                                <div className="flex flex-col gap-2 xl:gap-2.5">
                                    {filterFindings(caseDetail?.findings || [], activePart).map((f, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedFindingId(f.id === selectedFindingId ? null : f.id)}
                                            className={`p-3 xl:p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${selectedFindingId === f.id
                                                    ? "border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-500/20"
                                                    : "border-slate-100 bg-white hover:border-slate-200"
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1.5 xl:mb-2">
                                                <span className={`text-[9px] xl:text-[10px] font-bold px-1.5 xl:px-2 py-0.5 rounded-full uppercase tracking-wider ${severityStyles[f.severity.toUpperCase()] || "bg-sky-100 text-sky-700"
                                                    }`}>
                                                    {f.severity}
                                                </span>
                                                <span className="text-[9px] xl:text-[10px] font-mono text-slate-400 tracking-wide">{f.category}</span>
                                            </div>
                                            <h4 className="text-[12px] xl:text-[13px] font-bold text-slate-900 mb-1 xl:mb-1.5 leading-snug">{f.title}</h4>
                                            <AnimatePresence>
                                                {selectedFindingId === f.id ? (
                                                    <motion.p
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="text-[11px] xl:text-xs text-slate-600 leading-relaxed italic pl-2 xl:pl-2.5 border-l-2 border-amber-400 overflow-hidden"
                                                    >
                                                        &ldquo;{f.evidence}&rdquo;
                                                    </motion.p>
                                                ) : (
                                                    <p className="text-[11px] xl:text-xs text-slate-500 leading-relaxed italic pl-2 xl:pl-2.5 border-l-2 border-slate-200 truncate">
                                                        &ldquo;{f.evidence.slice(0, 60)}…&rdquo;
                                                    </p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                    {filterFindings(caseDetail?.findings || [], activePart).length === 0 && (
                                        <div className="text-center py-8 xl:py-10 flex flex-col items-center gap-2.5">
                                            <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-emerald-50 border border-emerald-200/40 flex items-center justify-center text-emerald-600">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <p className="text-[12px] xl:text-[13px] text-slate-500">No active findings.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ── Overview ── */
                            <div>
                                <div className="flex flex-col gap-2 xl:gap-2.5">
                                    {(Object.entries(currentStatuses) as [string, PartStatus][]).map(([part, status]) => (
                                        <button
                                            key={part}
                                            onClick={() => setActivePart(part)}
                                            className={`w-full text-left flex items-center justify-between p-3 xl:p-3.5 rounded-xl border border-l-[3px] transition-all duration-150 hover:shadow-sm cursor-pointer group ${statusCardStyles[status]}`}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[12px] xl:text-[13px] font-bold text-slate-900 capitalize">{part}</span>
                                                <span className={`text-[10px] xl:text-[11px] font-semibold uppercase tracking-wider ${statusLabelColor[status]}`}>
                                                    {getStatusLabel(status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 xl:gap-2">
                                                <div className={`w-7 h-7 xl:w-8 xl:h-8 rounded-lg flex items-center justify-center ${statusIconBg[status]}`}>
                                                    <StatusIcon status={status} />
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Telemetry - Commented out as requested */}
                                {/* 
                                <div className="mt-4 xl:mt-5 pt-3 xl:pt-4 border-t border-slate-100">
                                    <h3 className="text-[12px] xl:text-[13px] font-bold text-slate-900 flex items-center gap-2 mb-2.5 xl:mb-3 m-0">
                                        <Activity className="w-3.5 h-3.5 xl:w-[15px] xl:h-[15px] text-[#2563a8]" />
                                        Live Telemetry
                                    </h3>
                                    <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                        {caseDetail?.engine_data.slice(0, 6).map((metric, i) => (
                                            <div key={i} className="p-2.5 xl:p-3 rounded-lg border border-slate-100 bg-slate-50/60">
                                                <div className="text-[8px] xl:text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 truncate">{metric.metric_name}</div>
                                                <div>
                                                    <span className="text-[13px] xl:text-[15px] font-bold text-slate-900">{metric.metric_value}</span>
                                                    <span className="text-[9px] xl:text-[10px] text-slate-400 ml-0.5">{metric.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                */}

                                {/* Engine 3D Model in place of Telemetry */}
                                <div className="mt-4 xl:mt-5 pt-3 xl:pt-4 border-t border-slate-100">
                                    <h3 className="text-[12px] xl:text-[13px] font-bold text-slate-900 flex items-center gap-2 mb-2.5 xl:mb-3 m-0">
                                        <Activity className="w-3.5 h-3.5 xl:w-[15px] xl:h-[15px] text-[#2563a8]" />
                                        Interactive Engine View
                                    </h3>
                                    <div className="flex justify-center mt-2 h-[220px] relative">
                                        <EngineFocusView
                                            status={currentStatuses.engines}
                                            highlightedParts={engineHighlights}
                                        />
                                        {activeFinding && (
                                            <div className="absolute top-0 right-0 z-10 p-2 bg-amber-500 rounded-bl-lg shadow-sm animate-pulse">
                                                <AlertTriangle className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center mt-2 italic">
                                        Click a finding above to highlight damaged components
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
}
