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
        <div className={`relative overflow-hidden rounded-xl border border-slate-900/[0.06] bg-white p-[20px_22px] shadow-sm transition-all duration-250 hover:-translate-y-[1px] hover:border-slate-900/[0.18] hover:shadow-md before:absolute before:left-0 before:right-0 before:top-0 before:h-[3px] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-150 ${variant === "primary" ? "before:bg-[#2563a8] before:opacity-100" :
                variant === "success" ? "before:bg-[#059669] before:opacity-100" :
                    variant === "warning" ? "before:bg-[#d97706] before:opacity-100" :
                        variant === "danger" ? "before:bg-[#be123c] before:opacity-100" :
                            "before:bg-[#2563a8]"
            }`}>
            <div className="mb-3.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">{title}</span>
                <div className={`flex h-[38px] w-[38px] items-center justify-center rounded-lg ${variant === "success" ? "bg-[#ecfdf5] text-[#059669]" :
                        variant === "warning" ? "bg-[#fffbeb] text-[#d97706]" :
                            variant === "danger" ? "bg-[#fff1f2] text-[#be123c]" :
                                "bg-[#f0f9ff] text-[#2563a8]"
                    }`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-2.5">
                <span className="text-[30px] font-extrabold leading-none tracking-[-0.02em] text-[#0c1d36]">{value}</span>
                {trend && (
                    <span
                        className={`rounded-[6px] px-2 py-0.5 text-xs font-semibold ${trend.positive
                            ? "bg-[#ecfdf5] text-[#059669]"
                            : "bg-[#fff1f2] text-[#be123c]"
                            }`}
                    >
                        {trend.positive ? "↑" : "↓"} {trend.value}
                    </span>
                )}
            </div>
            {subtitle && <p className="mt-1.5 text-xs font-normal text-slate-400 m-0">{subtitle}</p>}
        </div>
    );
}
