"use client";

import { motion } from "framer-motion";
import { Box, MapPin, Calendar, Layers, ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import OriginComplianceBadge from "./OriginComplianceBadge";
import type { BatchOriginInfo } from "@/lib/droneLookup";

type DroneBatchTraceViewProps = {
    batches: BatchOriginInfo[];
    showHeader?: boolean;
    onViewSourceCert?: (batch: BatchOriginInfo) => void;
};

export default function DroneBatchTraceView({ batches, showHeader = true, onViewSourceCert }: DroneBatchTraceViewProps) {

    return (
        <div className="space-y-6">
            {showHeader && (
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-extrabold text-[#1a2a3a] tracking-tight mb-1 flex items-center gap-2">
                            <Layers className="w-6 h-6 text-blue-600" />
                            Drone Parts Batch Tracking
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">EU Regulatory Compliance — 2026 Origin Readiness</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                            Live Tracking Active
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {batches.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
                        <div className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">No results</div>
                        <div className="text-[18px] font-extrabold text-[#1a2a3a] tracking-tight mb-2">No batches match your filters</div>
                        <p className="text-[14px] text-slate-500 font-medium max-w-[560px] leading-relaxed">
                            Try clearing search, switching the compliance filter, or expanding the date range.
                        </p>
                    </div>
                )}
                {batches.map((batch, index) => (
                    <motion.div
                        key={batch.batchId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-200 transition-all group"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${batch.isEUApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                    <Box className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <h3 className="text-[17px] font-bold text-[#1a2a3a] tracking-tight">{batch.partName}</h3>
                                        <OriginComplianceBadge isEUApproved={batch.isEUApproved} showLabel={false} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5"><strong className="text-slate-900 uppercase text-[11px] tracking-wider">Batch:</strong> {batch.batchId}</span>
                                        <span className="flex items-center gap-1.5"><strong className="text-slate-900 uppercase text-[11px] tracking-wider">Qty:</strong> {batch.quantity}</span>
                                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{batch.originSource}</span>
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{batch.verificationDate}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                                <span className={`text-[12px] font-bold uppercase tracking-wider ${batch.isEUApproved ? "text-emerald-600" : "text-amber-600"}`}>
                                    {batch.isEUApproved ? "EU COMPLIANT" : "NON-EU SOURCE"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onViewSourceCert?.(batch)}
                                    className="px-4 py-2 rounded-lg bg-[#f8fbff] border border-blue-100 text-blue-600 text-[13px] font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                    View Source Cert
                                </button>
                            </div>
                        </div>

                        {/* Progress Stepper for Origin Path */}
                        <div className="mt-5 pt-5 border-t border-dashed border-slate-100">
                             <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#2980b9] mb-4">
                                 <span>Origin Evidence Trail</span>
                                 <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> All Points Verified</span>
                             </div>
                             <div className="flex items-center gap-4 px-2">
                                 <div className="h-1 bg-emerald-500 flex-1 rounded-full relative">
                                     <div className="absolute -top-1.5 left-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Manufacturer" />
                                 </div>
                                 <div className={`h-1 flex-1 rounded-full relative ${batch.isEUApproved ? "bg-emerald-500" : "bg-amber-400"}`}>
                                     <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm ${batch.isEUApproved ? "bg-emerald-500" : "bg-amber-400"}`} title="Logistics Hub" />
                                 </div>
                                 <div className="h-1 bg-slate-200 flex-1 rounded-full relative">
                                     <div className="absolute -top-1.5 right-0 w-4 h-4 rounded-full bg-white border-2 border-slate-300 shadow-sm" title="Final Destination" />
                                 </div>
                             </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
