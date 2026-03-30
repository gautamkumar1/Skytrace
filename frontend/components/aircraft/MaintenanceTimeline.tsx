"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Wrench, Flag } from "lucide-react";
import Modal from "@/components/ui/Modal";

export type TimelineKind = "ownership" | "maintenance" | "finding" | "document";

export interface TimelineEvent {
    id: string;
    date: string; // ISO or parseable date
    kind: TimelineKind;
    title: string;
    subtitle?: string;
    detail?: string;
    severity?: "STOP" | "FLAG" | "ADVISORY" | "CLEAR";
}

function toDay(date: string): string {
    try {
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return date;
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return date;
    }
}

function sortByDateAsc(events: TimelineEvent[]): TimelineEvent[] {
    return [...events].sort((a, b) => {
        const ta = new Date(a.date).getTime();
        const tb = new Date(b.date).getTime();
        return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
    });
}

function Marker({ kind, severity }: { kind: TimelineKind; severity?: TimelineEvent["severity"] }) {
    const base = "w-6 h-6 rounded-full flex items-center justify-center border shadow-sm";
    if (kind === "ownership") {
        // Triangle marker
        return (
            <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-blue-600 drop-shadow-sm" />
            </div>
        );
    }
    if (kind === "finding") {
        const sev = (severity || "ADVISORY").toUpperCase();
        const cls =
            sev === "STOP"
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : sev === "FLAG"
                  ? "bg-amber-50 border-amber-200 text-amber-600"
                  : sev === "CLEAR"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "bg-sky-50 border-sky-200 text-sky-600";
        return (
            <div className={`${base} ${cls}`}>
                {sev === "STOP" ? <AlertTriangle size={14} /> : <Flag size={14} />}
            </div>
        );
    }
    if (kind === "maintenance") {
        return (
            <div className={`${base} bg-slate-50 border-slate-200 text-slate-600`}>
                <Wrench size={14} />
            </div>
        );
    }
    return (
        <div className={`${base} bg-white border-slate-200 text-slate-500`}>
            <FileText size={14} />
        </div>
    );
}

export default function MaintenanceTimeline({
    title = "Maintenance History",
    subtitle = "Events extracted from records",
    events,
}: {
    title?: string;
    subtitle?: string;
    events: TimelineEvent[];
}) {
    const sorted = useMemo(() => sortByDateAsc(events), [events]);
    const [selected, setSelected] = useState<TimelineEvent | null>(null);
    const [isXl, setIsXl] = useState(false);

    useLayoutEffect(() => {
        const mq = window.matchMedia('(min-width: 1280px)');
        setIsXl(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsXl(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    if (!sorted.length) {
        return (
            <div className="p-6 mt-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider m-0">{title}</h3>
                        <p className="text-[11px] text-slate-400 font-medium m-0 mt-0.5">{subtitle}</p>
                    </div>
                </div>
                <div className="mt-6 text-center text-sm text-slate-500">
                    No timeline events yet.
                </div>
            </div>
        );
    }

    const colW = isXl ? 240 : 200;

    return (
        <div className="p-6 mt-2 bg-slate-100 border border-slate-400/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider m-0">{title}</h3>
                    <p className="text-[11px] text-slate-400 font-medium m-0 mt-1">{subtitle}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.14em]">
                    {sorted.length} events
                </div>
            </div>

            {/* Horizontal zig-zag timeline – one column per event */}
            <div className="mt-8 overflow-x-auto pb-4 modern-scrollbar">
                <div className="inline-block min-w-full relative pt-4">
                    {/* SVG Zig-Zag Path */}
                    <svg 
                        className="absolute top-[28px] left-0 pointer-events-none z-0 overflow-visible" 
                        width={sorted.length * colW} 
                        height="120"
                    >
                        {sorted.length > 1 && (
                            <path
                                d={sorted.map((e, i) => {
                                    const x = (i * colW) + (colW / 2);
                                    const y = (e.kind === 'ownership' ? 0 : e.kind === 'maintenance' ? 30 : e.kind === 'document' ? 60 : 90) + 12;
                                    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </svg>
                    
                    <div className="relative flex items-start gap-0 z-10">
                        {sorted.map((e, i) => (
                            <div
                                key={e.id}
                                className="flex flex-col items-center text-center shrink-0 w-[200px] xl:w-[240px] px-2 pb-2 cursor-pointer rounded-xl hover:bg-slate-50/60 group"
                                onClick={() => setSelected(e)}
                            >
                                <div className="relative mb-4 flex w-full h-[110px] items-start justify-center">
                                    <div 
                                        className="absolute transition-all duration-300"
                                        style={{ top: `${e.kind === 'ownership' ? 0 : e.kind === 'maintenance' ? 30 : e.kind === 'document' ? 60 : 90}px` }}
                                    >
                                        <Marker kind={e.kind} severity={e.severity} />
                                    </div>
                                </div>
                                <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                    {toDay(e.date)}
                                </div>
                                <div className="mt-1 text-[11px] xl:text-[12px] font-semibold text-slate-900 leading-snug line-clamp-2 px-1">
                                    {e.title}
                                </div>
                                {e.subtitle && (
                                    <div className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">
                                        {e.subtitle}
                                    </div>
                                )}
                                {e.detail && (
                                    <div className="mt-1 text-[9px] text-slate-400 italic line-clamp-2 max-w-full">
                                        {e.detail}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <p className="mt-6 text-[10px] text-slate-400 font-medium">
                Triangles = ownership/procurement. Dots = maintenance / documents / findings.
            </p>

            <Modal
                open={!!selected}
                title={selected ? `${selected.kind.toUpperCase()} event` : "Event"}
                onClose={() => setSelected(null)}
            >
                {selected && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">
                                    {toDay(selected.date)}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</div>
                                <div className="mt-1 text-sm font-semibold text-slate-900 capitalize">
                                    {selected.kind}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="text-sm font-semibold text-slate-900">{selected.title}</div>
                            {selected.subtitle && (
                                <div className="mt-1 text-xs text-slate-500">{selected.subtitle}</div>
                            )}
                            {selected.detail && (
                                <div className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {selected.detail}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

