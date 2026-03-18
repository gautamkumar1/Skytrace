"use client";

import type { LLPPart, LLPBtbStatus } from "@/lib/types";
import { ShieldCheck, Clock, AlertCircle, FileQuestion, Plane, Hash, MapPin } from "lucide-react";

interface LLPTableProps {
    parts: LLPPart[];
}

function formatRemaining(part: LLPPart): string {
    if (part.life_limit <= 0) return "—";
    const remaining = part.life_limit - part.current_used;
    const pct = Math.round((remaining / part.life_limit) * 100);
    const unit = part.life_unit === "FH" ? "FH" : part.life_unit === "FC" ? "FC" : "yr";
    return `${Math.max(0, remaining).toLocaleString()} ${unit} (${pct}%)`;
}

function btbBadge(status: LLPBtbStatus) {
    const config: Record<
        LLPBtbStatus,
        { label: string; className: string; icon: typeof ShieldCheck }
    > = {
        verified: {
            label: "Verified",
            className: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: ShieldCheck,
        },
        pending_review: {
            label: "Pending review",
            className: "bg-amber-50 text-amber-700 border-amber-200",
            icon: Clock,
        },
        gap: {
            label: "BTB gap",
            className: "bg-sky-50 text-sky-700 border-sky-200",
            icon: FileQuestion,
        },
        overdue: {
            label: "Overdue",
            className: "bg-rose-50 text-rose-700 border-rose-200",
            icon: AlertCircle,
        },
    };
    const { label, className, icon: Icon } = config[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${className}`}
        >
            <Icon size={12} />
            {label}
        </span>
    );
}

export default function LLPTable({ parts }: LLPTableProps) {
    if (parts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                    <ShieldCheck size={28} />
                </div>
                <p className="text-[14px] font-semibold text-slate-600">No LLP records</p>
                <p className="text-[12px] text-slate-400 mt-1">Add parts or run a BTB audit to populate data.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto -mx-px">
            <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Part / Serial
                        </th>
                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Aircraft
                        </th>
                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Position
                        </th>
                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Life (used / limit)
                        </th>
                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Remaining
                        </th>
                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            BTB status
                        </th>
                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Next inspection
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {parts.map((p) => (
                        <tr
                            key={p.id}
                            className="group border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors"
                        >
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                                        <Hash size={14} />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[13px] font-semibold text-slate-900 font-mono">
                                            {p.part_number}
                                        </span>
                                        <span className="text-[11px] text-slate-500">{p.part_name}</span>
                                        <span className="text-[11px] font-mono text-slate-400">SN {p.serial_number}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5">
                                    <Plane size={12} className="text-slate-300 shrink-0" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[13px] font-semibold text-slate-900">{p.registration}</span>
                                        <span className="text-[11px] text-slate-500">{p.aircraft_type}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5 text-[12px] font-mono text-slate-600">
                                    <MapPin size={12} className="text-slate-300 shrink-0" />
                                    {p.position}
                                </div>
                            </td>
                            <td className="px-5 py-4 text-[12px] font-medium text-slate-700">
                                {p.current_used.toLocaleString()} / {p.life_limit.toLocaleString()} {p.life_unit}
                            </td>
                            <td className="px-5 py-4">
                                <span
                                    className={
                                        p.life_limit - p.current_used <= 0
                                            ? "text-rose-600 font-semibold"
                                            : (p.life_limit - p.current_used) / p.life_limit < 0.2
                                              ? "text-amber-600 font-semibold"
                                              : "text-slate-700"
                                    }
                                >
                                    {formatRemaining(p)}
                                </span>
                            </td>
                            <td className="px-5 py-4">{btbBadge(p.btb_status)}</td>
                            <td className="px-5 py-4 text-[12px] text-slate-600">
                                {p.next_inspection_date
                                    ? new Date(p.next_inspection_date).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                      })
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
