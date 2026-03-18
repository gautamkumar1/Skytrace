"use client";

import { formatMetricName, metricStatusColor } from "@/lib/utils";
import type { EngineMetric } from "@/lib/types";
import { Activity } from "lucide-react";

interface MetricCardProps {
    metric: EngineMetric;
}

export default function MetricCard({ metric }: MetricCardProps) {
    const severityColor = 
        metric.status === "ok" ? "#10b981" : 
        metric.status === "advisory" ? "#f59e0b" : "#e11d48";

    return (
        <div 
            className="bg-white border text-left shadow-sm overflow-hidden flex flex-col relative"
            style={{ borderLeft: `3px solid ${severityColor}` }}
        >
            <div className="bg-slate-50/50 px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {formatMetricName(metric.metric_name)}
                </span>
                <Activity size={10} className="text-slate-300" />
            </div>

            <div className="p-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                        {metric.metric_value ?? "—"}
                    </span>
                    {metric.unit && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{metric.unit}</span>
                    )}
                </div>
            </div>
            
            <div className="mt-auto px-4 py-2 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    metric.status === 'ok' ? 'bg-emerald-50 text-emerald-700' : 
                    metric.status === 'advisory' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                }`}>
                    {metric.status}
                </span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Verified</span>
            </div>
        </div>
    );
}

