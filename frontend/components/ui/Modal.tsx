"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
    open,
    title,
    children,
    onClose,
}: {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    const modal = useMemo(() => {
        if (!open) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-[92vw] max-w-[720px] max-h-[86vh] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="min-w-0">
                            <h3 className="m-0 text-sm font-bold text-slate-900 truncate">{title}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500"
                            aria-label="Close modal"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-5 overflow-auto max-h-[calc(86vh-64px)]">{children}</div>
                </div>
            </div>
        );
    }, [children, onClose, open, title]);

    if (!mounted || !modal) return null;
    return createPortal(modal, document.body);
}

