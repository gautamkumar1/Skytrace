"use client";

import Link from "next/link";
import type { FleetSummaryRow } from "@/lib/types";
import { Plane, FileText, AlertTriangle, Gauge, ArrowRight } from "lucide-react";

interface FleetTableProps {
    data: FleetSummaryRow[];
}

function getSeverityIndicator(findingCount: number) {
    if (findingCount === 0) return "bg-emerald-50 text-emerald-600";
    if (findingCount <= 2) return "bg-sky-50 text-sky-500";
    if (findingCount <= 5) return "bg-amber-50 text-amber-500";
    return "bg-rose-50 text-rose-500";
}

export default function FleetTable({ data }: FleetTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-900/[0.06] bg-white shadow-sm">
            <table className="w-full border-collapse text-[13.5px]">
                <thead className="bg-[#f0f3f7]">
                    <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-slate-900/10 whitespace-nowrap">Case ID</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-slate-900/10 whitespace-nowrap">Registration</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-slate-900/10 whitespace-nowrap">Aircraft Type</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-slate-900/10 whitespace-nowrap">Engine Type</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-slate-900/10 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                                <FileText size={13} /> Docs
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-slate-900/10 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                                <AlertTriangle size={13} /> Findings
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] border-b border-slate-900/10 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                                <Gauge size={13} /> Metrics
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left border-b border-slate-900/10"></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={row.case_id} className={`transition-colors hover:bg-[#f0f9ff] group ${idx === data.length - 1 ? '' : 'border-b border-slate-900/[0.06]'}`}>
                            <td className="px-4 py-[13px] text-slate-700">
                                <Link
                                    href={`/cases/${row.case_id}`}
                                    className="text-[#1e4d8a] no-underline font-semibold font-mono text-[12.5px] transition-colors hover:text-[#2563a8] hover:underline"
                                >
                                    {row.case_id}
                                </Link>
                            </td>
                            <td className="px-4 py-[13px] text-slate-700">
                                <div className="flex items-center gap-[7px]">
                                    <Plane size={14} className="text-[#1e4d8a]" />
                                    <span className="font-semibold text-[#1a2233]">{row.registration}</span>
                                </div>
                            </td>
                            <td className="px-4 py-[13px] text-slate-700">{row.aircraft_type}</td>
                            <td className="px-4 py-[13px] text-slate-500">{row.engine_type}</td>
                            <td className="px-4 py-[13px] text-slate-700">
                                <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-[7px] rounded-md font-semibold text-[12.5px] bg-[#f0f3f7] text-slate-600">{row.doc_count}</span>
                            </td>
                            <td className="px-4 py-[13px] text-slate-700">
                                <span
                                    className={`inline-flex items-center justify-center min-w-[26px] h-[26px] px-[7px] rounded-md font-semibold text-[12.5px] ${getSeverityIndicator(
                                        row.finding_count
                                    )}`}
                                >
                                    {row.finding_count}
                                </span>
                            </td>
                            <td className="px-4 py-[13px] text-slate-700">
                                <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-[7px] rounded-md font-semibold text-[12.5px] bg-[#f0f3f7] text-slate-600">
                                    {row.engine_metric_count}
                                </span>
                            </td>
                            <td className="px-4 py-[13px] text-slate-700">
                                <Link
                                    href={`/cases/${row.case_id}`}
                                    className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-md text-slate-400 transition-all hover:bg-[#f0f9ff] hover:text-[#1e4d8a]"
                                >
                                    <ArrowRight size={16} />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
