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
        sm: "severity-badge--sm",
        md: "severity-badge--md",
        lg: "severity-badge--lg",
    };

    return (
        <span
            className={`severity-badge ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
        >
            <span className={`severity-badge__dot ${colors.dot}`} />
            {severity}
        </span>
    );
}
