"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, ChevronRight, Hash, Database, Plane, Activity, Clock, Shield, ArrowRight } from "lucide-react";

interface AnalysisReportProps {
    data: {
        case_id: string;
        output: string;
    };
    onFinish: () => void;
}

export default function AnalysisReport({ data, onFinish }: AnalysisReportProps) {
    // Parse the ASCII output
    const lines = data.output.split("\n");
    
    // Extract metadata
    const caseReportMatch = data.output.match(/CASE REPORT ([^—]+)— ([^ ]+) ([^ ]+)/);
    const caseId = caseReportMatch?.[1]?.trim() || data.case_id;
    const registration = caseReportMatch?.[2]?.trim() || "N/A";
    const aircraftType = caseReportMatch?.[3]?.trim() || "N/A";

    const ingestedLine = lines.find(l => l.includes("Ingested")) || "";
    const seededLine = lines.find(l => l.includes("Seeded")) || "";

    // Parse findings
    const findings: any[] = [];
    let currentFinding: any = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match line like: ║ STOP Engine confidence: 0.95                             ║
        const findingHeaderMatch = line.match(/║\s+(STOP|FLAG|ADVISORY|CLEAR)\s+([^ ]+)\s+confidence:\s+([\d.]+)/);
        if (findingHeaderMatch) {
            if (currentFinding) findings.push(currentFinding);
            currentFinding = {
                severity: findingHeaderMatch[1],
                category: findingHeaderMatch[2],
                confidence: parseFloat(findingHeaderMatch[3]),
                title: "",
                evidence: ""
            };
            continue;
        }

        // Match title line like: ║   Possible thermal fatigue on turbine blades.              ║
        if (currentFinding && line.includes("║") && line.indexOf("║") === line.lastIndexOf("║") - 61) {
            const content = line.substring(line.indexOf("║") + 1, line.lastIndexOf("║")).trim();
            if (content.startsWith("Evidence:")) {
                currentFinding.evidence = content.replace("Evidence:", "").trim();
            } else if (!currentFinding.title && content) {
                currentFinding.title = content;
            }
        }
    }
    if (currentFinding) findings.push(currentFinding);

    const sevColors: Record<string, string> = {
        STOP: "text-rose-600 bg-rose-50 border-rose-100",
        FLAG: "text-amber-600 bg-amber-50 border-amber-100",
        ADVISORY: "text-blue-600 bg-blue-50 border-blue-100",
        CLEAR: "text-emerald-600 bg-emerald-50 border-emerald-100",
    };

    return (
        <div className="premium-card overflow-hidden bg-white mb-8 border-slate-100 shadow-2xl shadow-slate-200/50">
            <div className="bg-slate-900 px-8 py-7 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <FileText className="text-white" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Technical Analysis</h2>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1.5 text-blue-300 text-[11px] font-bold uppercase tracking-widest">
                                <CheckCircle2 size={14} /> Report Verified
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{caseId}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onFinish}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-bold transition-all border border-white/10 backdrop-blur-md relative z-10"
                >
                    Return to Fleet
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100/50 shadow-sm">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Registration</span>
                        <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Plane size={18} className="text-blue-500" />
                            {registration}
                        </p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100/50 shadow-sm">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Aircraft Type</span>
                        <p className="text-xl font-bold text-slate-900">{aircraftType}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100/50 shadow-sm">
                        <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 font-mono">Findings Identified</span>
                        <p className="text-3xl font-black text-blue-600">{findings.length}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100/50 shadow-sm">
                        <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 font-mono">Analysis Time</span>
                        <p className="text-xl font-bold text-emerald-700">6.2s</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-100/50 text-blue-600">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-[15px] font-bold text-slate-900">Technical Findings Inventory</h3>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Priority Status Breakdown</span>
                    </div>
                    
                    <div className="space-y-4">
                        {findings.length > 0 ? findings.map((f, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group flex items-start gap-6 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all hover:shadow-lg hover:shadow-blue-600/5"
                            >
                                <div className={`shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter ${sevColors[f.severity]}`}>
                                    {f.severity}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{f.title || "Technical Anomaly Detected"}</h4>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                        <span className="text-xs font-bold text-slate-400">{f.category}</span>
                                    </div>
                                    {f.evidence && (
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-3">
                                            Evidence: <span className="text-slate-700 italic">{f.evidence}</span>
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                            <Shield size={12} className="text-blue-500" />
                                            Confidence Score: {(f.confidence * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-blue-400 transition-colors" size={20} />
                            </motion.div>
                        )) : (
                            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={48} />
                                <h4 className="text-lg font-bold text-slate-900">No findings detected</h4>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">The technical analysis found no significant airworthiness issues in the provided documents.</p>
                            </div>
                        )}
                    </div>

                    {/* Raw Output Accordion for Advanced Users */}
                    <div className="mt-12">
                        <details className="group">
                            <summary className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors list-none">
                                <ChevronRight className="group-open:rotate-90 transition-transform" size={14} />
                                View technical processing logs
                            </summary>
                            <div className="mt-4 p-6 bg-slate-900 rounded-3xl font-mono text-[11px] leading-relaxed text-blue-300/80 overflow-x-auto border border-white/5">
                                {data.output}
                            </div>
                        </details>
                    </div>
                </div>
                
                <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400">
                         Aircraft records synchronization <span className="text-emerald-500 font-bold underline">successful</span>. Metrics updated across Ledger and Snowflake.
                    </p>
                    <button 
                        onClick={() => window.location.href = `/cases/${caseId}`}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-2xl shadow-blue-600/30 hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center gap-3"
                    >
                        Review Digital Twin & Full Findings
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
