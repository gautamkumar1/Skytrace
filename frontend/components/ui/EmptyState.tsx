import type { ReactNode } from "react";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-16 text-center premium-card bg-slate-50/20 border-dashed border-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-slate-300 mb-6 shadow-sm">
                {icon}
            </div>
            <h3 className="text-[17px] font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
            <p className="text-[14px] font-medium text-slate-400 max-w-[320px] leading-relaxed mb-8">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}

