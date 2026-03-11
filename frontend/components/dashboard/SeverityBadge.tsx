import type { FindingSeverity } from "@/lib/types";
import { severityColor } from "@/lib/utils";

interface SeverityBadgeProps {
    severity: FindingSeverity;
    size?: "sm" | "md" | "lg";
}

export default function SeverityBadge({
    severity,
    size = "md",
}: SeverityBadgeProps) {
    const colors = severityColor(severity);
    const sizeClasses = {
        sm: "text-[10.5px] px-2 py-0.5",
        md: "text-[11px] px-2.5 py-[3px]",
        lg: "text-[13px] px-[14px] py-[5px]",
    };

    return (
        <span
            className={`inline-flex items-center gap-[5px] rounded-full font-semibold tracking-[0.03em] border border-solid ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
            {severity}
        </span>
    );
}
