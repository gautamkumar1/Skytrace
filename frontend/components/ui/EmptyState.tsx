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
        <div className="flex flex-col items-center justify-center gap-[10px] px-5 py-[56px] text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#f0f3f7] text-slate-400 mb-1.5">
                {icon}
            </div>
            <h3 className="m-0 text-[17px] font-bold text-[#0c1d36]">{title}</h3>
            <p className="m-0 text-[13.5px] leading-[1.55] text-slate-500 max-w-[420px]">{description}</p>
            {action && <div className="mt-1.5">{action}</div>}
        </div>
    );
}
