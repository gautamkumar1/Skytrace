import type { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: ReactNode;
    trend?: { value: string; positive: boolean };
    variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    variant = "default",
}: StatCardProps) {
    return (
        <div className={`stat-card stat-card--${variant}`}>
            <div className="stat-card__header">
                <span className="stat-card__title">{title}</span>
                <div className={`stat-card__icon stat-card__icon--${variant}`}>
                    {icon}
                </div>
            </div>
            <div className="stat-card__body">
                <span className="stat-card__value">{value}</span>
                {trend && (
                    <span
                        className={`stat-card__trend ${trend.positive
                                ? "stat-card__trend--positive"
                                : "stat-card__trend--negative"
                            }`}
                    >
                        {trend.positive ? "↑" : "↓"} {trend.value}
                    </span>
                )}
            </div>
            {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
        </div>
    );
}
