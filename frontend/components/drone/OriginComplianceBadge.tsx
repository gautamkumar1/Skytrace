"use client";

import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

interface OriginComplianceBadgeProps {
    isEUApproved: boolean;
    showLabel?: boolean;
}

export default function OriginComplianceBadge({ isEUApproved, showLabel = true }: OriginComplianceBadgeProps) {
    if (isEUApproved) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {showLabel && <span>EU APPROVED SOURCE (2026)</span>}
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            {showLabel && <span>NON-EU SOURCE / UNVERIFIED</span>}
        </div>
    );
}
