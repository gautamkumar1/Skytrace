"use client";

import Link from "next/link";
import type { FleetSummaryRow } from "@/lib/types";
import { Plane, FileText, AlertTriangle, Gauge, ArrowRight } from "lucide-react";

interface FleetTableProps {
    data: FleetSummaryRow[];
    groupBy: "aircraft_type" | "engine_type";
}

function getSeverityIndicator(findingCount: number) {
    if (findingCount === 0) return "bg-emerald-50 text-emerald-600";
    if (findingCount <= 2) return "bg-sky-50 text-sky-500";
    if (findingCount <= 5) return "bg-amber-50 text-amber-500";
    return "bg-rose-50 text-rose-500";
}

export default function FleetTable({ data, groupBy }: FleetTableProps) {
    const groups = data.reduce((acc, row) => {
        const key = row[groupBy] || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
    }, {} as Record<string, FleetSummaryRow[]>);

    const groupKeys = Object.keys(groups).sort();

    return (
        <div className="flex flex-col gap-10">
            {groupKeys.map((groupTitle) => (
                <div key={groupTitle} className="space-y-4">
                    <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-100">
                                {groupBy === "aircraft_type" ? "Asset Category" : "Engine Series"}
                            </span>
                            <h4 className="text-[16px] font-semibold tracking-tight">{groupTitle}</h4>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold uppercase tracking-widest">
                           {groups[groupTitle].length} Assets
                        </div>
                    </div>
                    
                    <div className="overflow-hidden rounded-2xl border border-blue-50 bg-white">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-50/30 border-b border-blue-50">
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Identity</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Registration</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Metrics</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Findings</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Health Score</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups[groupTitle].map((row, idx) => (
                                    <tr key={row.case_id} className="group hover:bg-blue-50/20 transition-all border-b last:border-0 border-blue-50/50">
                                        <td className="px-6 py-5">
                                            <Link href={`/cases/${row.case_id}`} className="text-blue-600 font-semibold font-mono text-[13px] hover:text-blue-700">
                                                {row.case_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-400"><Plane size={14} /></div>
                                                <span className="text-[14px] font-semibold text-slate-900">{row.registration}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                               <div className="flex items-center gap-1.5">
                                                  <FileText size={12} className="text-slate-300" />
                                                  <span className="text-[12px] font-semibold text-slate-500">{row.doc_count}</span>
                                               </div>
                                               <div className="flex items-center gap-1.5">
                                                  <Gauge size={12} className="text-slate-300" />
                                                  <span className="text-[12px] font-semibold text-slate-500">{row.engine_metric_count}</span>
                                               </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-widest ${
                                                row.finding_count === 0 ? "bg-emerald-50 text-emerald-600" :
                                                row.finding_count < 3 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                            }`}>
                                                {row.finding_count} Issues
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 max-w-[80px] h-1.5 bg-blue-50 rounded-full overflow-hidden">
                                                   <div 
                                                     className={`h-full rounded-full ${row.finding_count === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                                     style={{ width: `${Math.max(10, 100 - row.finding_count * 10)}%` }} 
                                                   />
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-400">{Math.max(0, 100 - row.finding_count * 10)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link href={`/cases/${row.case_id}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                Report <ArrowRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

