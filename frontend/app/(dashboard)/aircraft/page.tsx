"use client";

import React, { useState, useEffect } from "react";
import AirplaneCanvas from "@/components/models/AirplaneModel";
import EngineFocusView from "@/components/models/EngineFocusView";
import { FileText, Cpu, AlertTriangle, CheckCircle, ShieldAlert, Plane, Activity, ChevronRight, X, ChevronDown, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
}

interface EngineMetric {
    metric_name: string;
    metric_value: string | number;
    unit: string;
    status: string;
}

interface CaseDetail {
    case_id: string;
    registration: string;
    findings: Finding[];
    engine_data: EngineMetric[];
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
                const res = await fetch(`/api/cases/${selectedCaseId}`);
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

            {/* ═══ Center: 3D Digital Twin ═══ */}
            <div className="flex-1 flex flex-col bg-white relative min-w-0">
                {/* Mobile top bar */}
                <div className="flex lg:hidden items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <button onClick={() => setMobilePanel("fleet")} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                        <Plane className="w-3.5 h-3.5" />
                        {activeAircraft?.registration || "Fleet"}
                    </button>
                    <button onClick={() => setMobilePanel("findings")} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Findings
                    </button>
                </div>

                {/* Header overlay */}
                <div className="hidden lg:flex absolute top-0 left-0 right-0 z-10 px-5 py-4 xl:px-6 xl:py-5 items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center backdrop-blur-sm">
                            <Plane className="w-4.5 h-4.5 xl:w-5 xl:h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#f8fafc] border border-slate-200 rounded-lg">
                                    <Plane className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">Active Fleet</span>
                                    <span className="text-slate-300">|</span>
                                    <FleetDropdown
                                        fleet={fleet}
                                        selectedCaseId={selectedCaseId}
                                        onSelect={setSelectedCaseId}
                                    />
                                </div>
                                <h1 className="text-sm xl:text-base font-semibold text-slate-900 tracking-tight leading-tight m-0 opacity-40">
                                    Digital Twin
                                </h1>
                            </div>
                            <p className="text-[9px] xl:text-[10px] font-mono text-slate-500 uppercase tracking-[0.12em] mt-0.5 pl-1">
                                Operational Status Verification <span className="text-slate-300 mx-1">•</span> Select aircraft for diagnostic
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3D Canvas - Slightly padded to make the airplane appear smaller as requested */}
                <div className="flex-1 relative min-h-0 p-12">
                    <AirplaneCanvas
                        status={currentStatuses}
                        onPartClick={(part: string) => setActivePart(part === "fuselage" ? null : part)}
                        activePart={activePart}
                    />

                    {/* Engine Focus View in place of Telemetry (Right Panel) or overlay */}
                    <div className="hidden">
                        {/* Hidden since it's now in the findings panel */}
                    </div>

                    {/* Interaction hint */}
                    {!activePart && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none z-10">
                            Navigate with Mouse · Zoom with Scroll
                        </div>
                    )}
                </div>

                {/* Bottom Metrics Bar */}
                <div className="h-14 xl:h-[68px] border-t border-slate-100 bg-white flex items-center px-4 xl:px-6 gap-4 xl:gap-6 shrink-0">
                    <div className="flex flex-col gap-0.5 min-w-[130px] xl:min-w-[160px]">
                        <span className="text-[8px] xl:text-[9px] font-mono text-slate-400 uppercase tracking-[0.1em]">System Status</span>
                        <div className="flex items-center gap-2 text-[11px] xl:text-xs font-bold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Diagnostics Active
                        </div>
                    </div>
                    <div className="w-px h-7 bg-slate-100" />
                    <div className="flex-1 flex gap-5 xl:gap-8 overflow-x-auto no-scrollbar">
                        {caseDetail?.engine_data.slice(0, 4).map((metric, i) => (
                            <div key={i} className="flex flex-col gap-0.5 min-w-[80px] xl:min-w-[90px]">
                                <span className="text-[8px] xl:text-[9px] font-mono text-slate-400 uppercase tracking-wider truncate">{metric.metric_name}</span>
                                <div>
                                    <span className="text-sm xl:text-[14px] font-black text-slate-800 tracking-tight">{metric.metric_value}</span>
                                    <span className="text-[9px] xl:text-[10px] text-slate-400 ml-1">{metric.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Right Panel: Findings & Details ═══ */}
            {/* Desktop: always visible | Mobile: slide-over */}
            <div className="hidden lg:flex flex-col w-[240px] min-w-[240px] xl:w-[270px] xl:min-w-[270px] bg-white border-l border-slate-200/80">
                <FindingsPanel
                    activePart={activePart}
                    setActivePart={setActivePart}
                    currentStatuses={currentStatuses}
                    caseDetail={caseDetail}
                    selectedFindingId={selectedFindingId}
                    setSelectedFindingId={setSelectedFindingId}
                />
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

            <div className="flex-1 overflow-y-auto p-3 xl:p-4">
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
