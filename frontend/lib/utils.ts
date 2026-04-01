/**
 * Shared utility functions for the frontend dashboard.
 */
import type { FindingSeverity } from "./types";

/** Map severity to color scheme tokens (light aviation theme) */
export function severityColor(severity: FindingSeverity): {
    bg: string;
    text: string;
    border: string;
    dot: string;
} {
    const map: Record<FindingSeverity, { bg: string; text: string; border: string; dot: string }> = {
        STOP: {
            bg: "bg-rose-50",
            text: "text-rose-700",
            border: "border-rose-200",
            dot: "bg-rose-500",
        },
        FLAG: {
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200",
            dot: "bg-amber-500",
        },
        ADVISORY: {
            bg: "bg-sky-50",
            text: "text-sky-700",
            border: "border-sky-200",
            dot: "bg-sky-500",
        },
        CLEAR: {
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            border: "border-emerald-200",
            dot: "bg-emerald-500",
        },
    };
    return map[severity] ?? map.ADVISORY;
}

/** Map engine metric status to color */
export function metricStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case "ok":
        case "normal":
            return "text-emerald-600";
        case "advisory":
        case "caution":
            return "text-amber-600";
        case "warning":
        case "critical":
        case "danger":
            return "text-rose-600";
        default:
            return "text-slate-500";
    }
}

/** Format a metric name for display */
export function formatMetricName(name: string): string {
    const specialMappings: Record<string, string> = {
        ASSET_PRIMARY_ID: "Asset Primary ID",
        TOTAL_TIME_SINCE_NEW: "Total Time Since New",
        FORM_1_8130_3_LINKAGE: "Form 1 / 8130-3 Linkage",
        CSLSV: "Cycles Since Last Shop Visit",
        TSLSV: "Time Since Last Shop Visit",
    };

    if (specialMappings[name]) return specialMappings[name];

    return name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format a date string for display */
export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

/** Format confidence as percentage */
export function formatConfidence(confidence: number): string {
    // UI policy: never display more than 95% confidence
    const capped = Math.min(Math.max(confidence, 0), 0.95);
    return `${(capped * 100).toFixed(0)}%`;
}

/** Truncate text to a max length */
export function truncate(text: string, maxLen: number = 100): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1) + "…";
}

/** Generate a simple unique ID (for feedback) */
export function generateId(): string {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 10)
    );
}

/** Base URL for API requests. From env NEXT_PUBLIC_API_URL; if unset, same origin (relative URL). */
function getApiBase(): string {
    const base = typeof process.env.NEXT_PUBLIC_API_URL === "string"
        ? process.env.NEXT_PUBLIC_API_URL.trim()
        : "";
    return base ? base.replace(/\/$/, "") : "";
}

/** Fetch JSON from an API route with error handling. URL is relative (e.g. /api/stats) or absolute; base from NEXT_PUBLIC_API_URL when set. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const base = getApiBase();
    const fullUrl = base ? `${base}${url.startsWith("/") ? url : `/${url}`}` : url;
    const res = await fetch(fullUrl, init);
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`API error ${res.status}: ${body}`);
    }
    return res.json();
}
