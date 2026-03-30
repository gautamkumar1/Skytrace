"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";

type Severity = "CLEAR" | "ADVISORY" | "FLAG" | "STOP";
type EventType = "event" | "document" | "finding";

type LaneId = "aircraft" | "event" | "mro";

interface TimelineEvent {
    id: string;
    date: string; // ISO
    lane: LaneId;
    type: EventType;
    label: string;
    severity?: Severity;
    docBadge?: string;
    // detail payload for modal
    docId?: string;
    filename?: string;
    findingId?: string;
    category?: string;
    evidence?: string;
}

function safeTime(d?: string | null): number | null {
    if (!d) return null;
    const t = new Date(d).getTime();
    return Number.isNaN(t) ? null : t;
}

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

function monthTick(t: number): string {
    return new Date(t).toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase();
}

function monthKeyFromTime(t: number): string {
    const d = new Date(t);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthStartUtc(key: string): number {
    const [y, m] = key.split("-").map(Number);
    return Date.UTC(y, (m || 1) - 1, 1, 0, 0, 0, 0);
}

function docBadgeFromFilename(filename: string): string | undefined {
    const up = filename.toUpperCase();
    if (up.includes("8130")) return "8130-3";
    if (up.includes("EASA") && up.includes("FORM")) return "EASA FORM";
    if (up.includes("8130-3")) return "8130-3";
    return undefined;
}

function compareSeverities(a: Severity, b: Severity): Severity {
    const order: Record<Severity, number> = { "STOP": 3, "FLAG": 2, "ADVISORY": 1, "CLEAR": 0 };
    return order[a] >= order[b] ? a : b;
}

function severityColor(sev?: Severity) {
    const s = (sev || "CLEAR").toUpperCase() as Severity;
    if (s === "STOP" || s === "FLAG") return { dot: "#e11d48", text: "#9f1239", path: "#fb7185" }; // Rose 600 / Rose 400 path
    if (s === "ADVISORY") return { dot: "#f59e0b", text: "#92400e", path: "#fbbf24" }; // Amber 500 / Amber 400 path
    return { dot: "#10b981", text: "#065f46", path: "#34d399" }; // Emerald 500 / Emerald 400 path
}

function typeColor(t: EventType) {
    if (t === "document") return { dot: "#2563eb", text: "#1e40af", path: "#2563eb" };
    if (t === "event") return { dot: "#0891b2", text: "#0e7490", path: "#0891b2" };
    return null;
}

function bezierPath(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
    const c1 = { x: a.x + dx, y: a.y };
    const c2 = { x: b.x - dx, y: b.y };
    return `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
}

export default function EngineForensicSvgTimeline({
    registration,
    engineLabel,
    documents,
    findings,
}: {
    registration: string;
    engineLabel?: string;
    documents: { id: string; filename: string; created_at?: string | null }[];
    findings: { id: string; category: string; title: string; severity?: string; evidence?: string; created_at?: string | null }[];
}) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    useLayoutEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const r = entries[0]?.contentRect;
            if (!r) return;
            setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const { events, allRegistrations } = useMemo(() => {
        const evs: TimelineEvent[] = [];
        const regs = new Set<string>();
        if (registration) regs.add(registration);

        for (const d of documents) {
            const t = safeTime(d.created_at);
            if (!t || !d.created_at) continue;
            const badge = docBadgeFromFilename(d.filename);
            const isMro = d.filename.toUpperCase().includes("SHOP");
            evs.push({
                id: `doc-${d.id}`,
                date: d.created_at,
                lane: isMro ? "mro" : "event",
                type: "document",
                label: "Document",
                docBadge: badge,
                docId: d.id,
                filename: d.filename,
            });
        }

        for (const f of findings) {
            const t = safeTime(f.created_at);
            if (!t || !f.created_at) continue;
            
            // Map to lanes based on content for demo impact
            let lane: LaneId = "event";
            const upTitle = f.title?.toUpperCase() || "";
            const upCat = f.category?.toUpperCase() || "";
            
            // Extract registration if mentioned
            let foundReg: string | undefined = undefined;
            const regMatch = upTitle.match(/(?:TRANSFERRED TO|INSTALLED ON|ON)\s+([A-Z0-9-]+)/);
            if (regMatch) {
                foundReg = regMatch[1];
                regs.add(foundReg);
            }

            if (upTitle.includes("LOCATION") || upCat.includes("AIRCRAFT") || upTitle.includes("TRANSFER") || foundReg) {
                lane = "aircraft";
            } else if (upTitle.includes("SHOP") || upTitle.includes("MRO") || upTitle.includes("OVERHAUL")) {
                lane = "mro";
            }

            evs.push({
                id: `finding-${f.id}`,
                date: f.created_at,
                lane,
                type: "finding",
                label: f.title || f.category || "Finding",
                severity: (f.severity?.toUpperCase?.() as Severity) || "ADVISORY",
                findingId: f.id,
                category: f.category,
                evidence: f.evidence,
            });
        }

        evs.sort((a, b) => (safeTime(a.date) || 0) - (safeTime(b.date) || 0));

        return { events: evs, allRegistrations: Array.from(regs).sort() };
    }, [documents, findings, registration]);

    const title = engineLabel
        ? `Life-trace events of ${engineLabel}`
        : `Life-trace events`;

    const monthBuckets = useMemo(() => {
        const buckets: Record<
            string,
            {
                key: string;
                startUtc: number;
                documents: TimelineEvent[];
                findings: TimelineEvent[];
                worst: Severity;
                activeReg?: string;
                isMro: boolean;
            }
        > = {};

        let currentReg = registration;
        let inMro = false;

        // Sort events to process chronologically
        const sortedEvents = [...events].sort((a, b) => (safeTime(a.date) || 0) - (safeTime(b.date) || 0));

        for (const e of sortedEvents) {
            const t = safeTime(e.date);
            if (!t) continue;

            const upTitle = e.label?.toUpperCase() || "";
            const regMatch = upTitle.match(/(?:TRANSFERRED TO|INSTALLED ON|ON)\s+([A-Z0-9-]+)/);
            if (regMatch) {
                currentReg = regMatch[1];
                inMro = false;
            } else if (upTitle.includes("SHOP") || upTitle.includes("MRO") || upTitle.includes("INDUCTION") || e.lane === "mro") {
                inMro = true;
            }

            const key = monthKeyFromTime(t);
            if (!buckets[key]) {
                buckets[key] = {
                    key,
                    startUtc: monthStartUtc(key),
                    documents: [],
                    findings: [],
                    worst: "CLEAR",
                    activeReg: currentReg,
                    isMro: inMro,
                };
            }
            // Update the bucket level tracking if an event happens mid-month
            buckets[key].activeReg = currentReg;
            buckets[key].isMro = inMro;

            if (e.type === "document") buckets[key].documents.push(e);
            if (e.type === "finding") buckets[key].findings.push(e);

            const sev = (e.severity || "CLEAR").toUpperCase() as Severity;
            const cur = buckets[key].worst;
            const isWorse =
                (cur === "CLEAR" && (sev === "ADVISORY" || sev === "FLAG" || sev === "STOP")) ||
                (cur === "ADVISORY" && (sev === "FLAG" || sev === "STOP")) ||
                (cur === "FLAG" && sev === "STOP");
            if (isWorse) buckets[key].worst = sev;
        }

        return Object.values(buckets).sort((a, b) => a.startUtc - b.startUtc);
    }, [events, registration]);

    const selectedBucket = useMemo(() => {
        if (!selectedMonth) return null;
        return monthBuckets.find((b) => b.key === selectedMonth) || null;
    }, [selectedMonth, monthBuckets]);

    const w = Math.max(1, size.w);
    const h = Math.max(1, size.h);

    const pad = { top: 18, right: 18, bottom: 54, left: 150 };
    const plotW = Math.max(1, w - pad.left - pad.right);
    const plotH = Math.max(1, h - pad.top - pad.bottom);

    // Multi-registration lane mapping
    const regLanes = useMemo(() => {
        const mapping: Record<string, number> = {};
        allRegistrations.forEach((reg, i) => {
            // Distribute registrations in the top aircraft section (0% to 35% of plotH)
            const count = allRegistrations.length;
            const step = count > 1 ? (plotH * 0.3) / (count - 1) : 0;
            mapping[reg] = pad.top + plotH * 0.05 + i * step;
        });
        return mapping;
    }, [allRegistrations, plotH, pad.top]);

    const laneY: Record<LaneId, number> = {
        aircraft: pad.top + plotH * 0.18, // generic fallback
        event: pad.top + plotH * 0.5,
        mro: pad.top + plotH * 0.85,
    };

    // Compressed month scale: only show months that contain events (skips empty months).
    const monthKey = (t: number) => {
        const d = new Date(t);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    };

    const months = useMemo(() => monthBuckets.map((b) => b.key), [monthBuckets]);

    const monthIndex = useMemo(() => {
        const m = new Map<string, number>();
        months.forEach((k, i) => m.set(k, i));
        return m;
    }, [months]);

    const colCount = Math.max(1, months.length);
    const colW = colCount > 1 ? plotW / (colCount - 1) : 0;

    const xOf = (t: number, withinMonthOffset = 0) => {
        const key = monthKey(t);
        const idx = monthIndex.get(key) ?? 0;
        return pad.left + idx * colW + withinMonthOffset;
    };

    const monthNodes = useMemo(() => {
        return monthBuckets.map((b) => {
            const idx = monthIndex.get(b.key) ?? 0;
            const x = pad.left + idx * colW;
            
            // Determine Y based on location
            let y = laneY.event;
            if (b.isMro) {
                y = laneY.mro;
            } else if (b.activeReg && regLanes[b.activeReg]) {
                y = regLanes[b.activeReg];
            }

            const worst = b.worst;
            const color = severityColor(worst);
            return {
                key: b.key,
                startUtc: b.startUtc,
                x,
                y,
                worst,
                color,
                docCount: b.documents.length,
                findingCount: b.findings.length,
            };
        });
    }, [monthBuckets, monthIndex, colW, regLanes, laneY]);

    const mainPath = useMemo(() => {
        if (monthNodes.length < 2) return null;
        return monthNodes
            .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
            .join(" ");
    }, [monthNodes]);

    const ticks = useMemo(() => {
        return months.map((k) => monthStartUtc(k));
    }, [months]);

    if (!events.length) {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Forensic timeline</div>
                <div className="mt-2 text-sm text-slate-500">
                    No dated engine records yet for {registration}. Upload documents to build the timeline.
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">Forensic timeline</h3>
                    <p className="text-[11px] text-slate-500 m-0 mt-0.5">{title}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.14em]">Event flow</div>
            </div>

            <div ref={wrapRef} className="relative h-[460px] bg-slate-200">
                <svg width={w} height={h || 460} viewBox={`0 0 ${w} ${h || 460}`} className="absolute inset-0">
                    {/* subtle vertical grid */}
                    {ticks.map((t) => {
                        const x = xOf(t);
                        return (
                            <line
                                key={`grid-${t}`}
                                x1={x}
                                x2={x}
                                y1={pad.top - 8}
                                y2={pad.top + plotH + 10}
                                stroke="rgba(15,23,42,0.10)"
                            />
                        );
                    })}

                    {/* lane separators (MRO and Event) */}
                    {(["event", "mro"] as LaneId[]).map((lane) => (
                        <line
                            key={`lane-${lane}`}
                            x1={pad.left}
                            x2={pad.left + plotW}
                            y1={laneY[lane]}
                            y2={laneY[lane]}
                            stroke="rgba(15,23,42,0.08)"
                        />
                    ))}

                    {/* Registration tracks */}
                    {Object.entries(regLanes).map(([reg, y]) => (
                        <line
                            key={`reg-track-${reg}`}
                            x1={pad.left}
                            x2={pad.left + plotW}
                            y1={y}
                            y2={y}
                            stroke="rgba(15,23,42,0.06)"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Left lane labels */}
                    <g>
                        {Object.entries(regLanes).map(([reg, y]) => (
                            <text
                                key={`label-${reg}`}
                                x={22}
                                y={y + 4}
                                fill="rgba(15,23,42,0.85)"
                                fontSize="11"
                                fontWeight="800"
                                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                            >
                                {reg}
                            </text>
                        ))}
                        <text x={22} y={laneY.event + 4} fill="rgba(15,23,42,0.50)" fontSize="11" fontWeight="800">
                            GENERIC EVENT
                        </text>
                        <text x={22} y={laneY.mro + 4} fill="rgba(8,145,178,0.85)" fontSize="11" fontWeight="800">
                            MRO SHOP
                        </text>
                    </g>

                    {/* Dynamic event path segments */}
                    {monthNodes.map((p, i) => {
                        if (i === 0) return null;
                        const prev = monthNodes[i - 1];
                        const worstInSegment = compareSeverities(prev.worst, p.worst);
                        const color = severityColor(worstInSegment).path;

                        return (
                            <line
                                key={`path-seg-${i}`}
                                x1={prev.x}
                                y1={prev.y}
                                x2={p.x}
                                y2={p.y}
                                stroke={color}
                                strokeWidth={4}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                            />
                        );
                    })}

                    {/* Month overview nodes */}
                    {monthNodes.map((m) => {
                        const isSelected = selectedMonth === m.key;
                        const label = monthTick(m.startUtc);
                        const total = m.docCount + m.findingCount;
                        return (
                            <g
                                key={m.key}
                                onClick={() => setSelectedMonth(m.key)}
                                style={{ cursor: "pointer" }}
                            >
                                <circle
                                    cx={m.x}
                                    cy={m.y}
                                    r={isSelected ? 14 : 12}
                                    fill="white"
                                    stroke={m.color.dot}
                                    strokeWidth={isSelected ? 4 : 3}
                                />
                                <text
                                    x={m.x}
                                    y={m.y + 4}
                                    textAnchor="middle"
                                    fill="rgba(15,23,42,0.82)"
                                    fontSize="11"
                                    fontWeight="900"
                                    fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                                >
                                    {total}
                                </text>
                                <text
                                    x={m.x}
                                    y={m.y - 18}
                                    textAnchor="middle"
                                    fill="rgba(15,23,42,0.70)"
                                    fontSize="10"
                                    fontWeight="800"
                                >
                                    {label}
                                </text>
                                <text
                                    x={m.x}
                                    y={m.y + 26}
                                    textAnchor="middle"
                                    fill="rgba(15,23,42,0.60)"
                                    fontSize="10"
                                    fontWeight="800"
                                >
                                    {m.docCount} docs · {m.findingCount} findings
                                </text>
                            </g>
                        );
                    })}

                    {/* Bottom time axis */}
                    <g>
                        <line
                            x1={pad.left}
                            x2={pad.left + plotW}
                            y1={pad.top + plotH + 28}
                            y2={pad.top + plotH + 28}
                            stroke="rgba(15,23,42,0.14)"
                        />
                        {ticks.map((t) => {
                            const x = xOf(t);
                            return (
                                <g key={`tick-${t}`}>
                                    <line
                                        x1={x}
                                        x2={x}
                                        y1={pad.top + plotH + 24}
                                        y2={pad.top + plotH + 32}
                                        stroke="rgba(15,23,42,0.14)"
                                    />
                                    <text
                                        x={x}
                                        y={pad.top + plotH + 48}
                                        textAnchor="middle"
                                        fill="rgba(15,23,42,0.55)"
                                        fontSize="10"
                                        fontWeight="800"
                                        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                                    >
                                        {monthTick(t)}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            <Modal
                open={!!selectedBucket}
                title={selectedBucket ? `Month overview — ${monthTick(selectedBucket.startUtc)}` : "Month overview"}
                onClose={() => setSelectedMonth(null)}
            >
                {selectedBucket && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Documents</div>
                                <div className="mt-1 text-2xl font-black text-slate-900 tabular-nums">{selectedBucket.documents.length}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Findings</div>
                                <div className="mt-1 text-2xl font-black text-slate-900 tabular-nums">{selectedBucket.findings.length}</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Worst status</div>
                                <div className="mt-2">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                                        selectedBucket.worst === "STOP" || selectedBucket.worst === "FLAG"
                                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                                            : selectedBucket.worst === "ADVISORY"
                                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    }`}>
                                        {selectedBucket.worst}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Documents</div>
                            {selectedBucket.documents.length === 0 ? (
                                <div className="text-sm text-slate-500">No documents ingested this month.</div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedBucket.documents.map((d) => (
                                        <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-slate-900 truncate">{d.filename || "Document"}</div>
                                                    <div className="mt-1 text-xs text-slate-500">{new Date(d.date).toLocaleString("en-GB")}</div>
                                                </div>
                                                {d.docId && (
                                                    <div className="flex gap-2 shrink-0">
                                                        <a
                                                            className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                                                            href={`/api/documents/${encodeURIComponent(d.docId)}?action=view`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Open
                                                        </a>
                                                        <a
                                                            className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                                                            href={`/api/documents/${encodeURIComponent(d.docId)}?action=download`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Download
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Findings</div>
                            {selectedBucket.findings.length === 0 ? (
                                <div className="text-sm text-slate-500">No findings logged this month.</div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedBucket.findings.map((f) => (
                                        <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-slate-900">{f.label}</div>
                                                    {f.category && <div className="mt-1 text-xs text-slate-500">{f.category}</div>}
                                                    <div className="mt-2 text-xs text-slate-500">{new Date(f.date).toLocaleString("en-GB")}</div>
                                                </div>
                                                {f.severity && (
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${
                                                        f.severity === "STOP" || f.severity === "FLAG"
                                                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                            : f.severity === "ADVISORY"
                                                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    }`}>
                                                        {f.severity}
                                                    </span>
                                                )}
                                            </div>
                                            {f.evidence && (
                                                <div className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                    {f.evidence}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

