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
        <div className={`metric-card`}>
            <div className="metric-card__header">
                <Activity size={14} className={statusColor} />
                <span className="metric-card__name">
                    {formatMetricName(metric.metric_name)}
                </span>
            </div>
            <div className="metric-card__value-row">
                <span className={`metric-card__value`}>
                    {metric.metric_value ?? "—"}
                </span>
                {metric.unit && (
                    <span className="metric-card__unit">{metric.unit}</span>
                )}
            </div>
            <div className="metric-card__status">
                <span
                    className={`metric-card__status-dot ${metric.status === "ok"
                            ? "bg-emerald-500"
                            : metric.status === "advisory"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                        }`}
                />
                <span className="metric-card__status-label">
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                </span>
            </div>
        </div>
    );
}
