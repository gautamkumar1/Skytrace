"use client";

import { formatMetricName, metricStatusColor } from "@/lib/utils";
import type { EngineMetric } from "@/lib/types";
import { Activity } from "lucide-react";

interface MetricCardProps {
    metric: EngineMetric;
}

export default function MetricCard({ metric }: MetricCardProps) {
    const statusColor = metricStatusColor(metric.status);
    const statusBg =
        metric.status === "ok"
            ? "bg-emerald-50"
            : metric.status === "advisory"
                ? "bg-amber-50"
                : "bg-rose-50";

    return (
        <div className="bg-white border border-slate-900/[0.06] rounded-xl p-[16px_20px] shadow-sm transition-all duration-250 animate-[slideUp_0.3s_ease-out] hover:border-slate-900/[0.18] hover:shadow-md hover:-translate-y-[1px]">
            <div className="flex items-center gap-1.5 mb-2.5">
                <Activity size={14} className={statusColor} />
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.05em]">
                    {formatMetricName(metric.metric_name)}
                </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-[22px] font-extrabold leading-none tracking-[-0.01em] text-[#0c1d36]">
                    {metric.metric_value ?? "—"}
                </span>
                {metric.unit && (
                    <span className="text-[12.5px] text-slate-400 font-medium">{metric.unit}</span>
                )}
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
                <span
                    className={`w-1.5 h-1.5 rounded-full ${metric.status === "ok"
                        ? "bg-emerald-500"
                        : metric.status === "advisory"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                />
                <span className="font-medium">
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                </span>
            </div>
        </div>
    );
}
