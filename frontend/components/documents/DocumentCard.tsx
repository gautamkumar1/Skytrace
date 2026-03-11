"use client";

import Link from "next/link";
import type { Document } from "@/lib/types";
import { FileText, Download, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DocumentCardProps {
    doc: Document;
}

export default function DocumentCard({ doc }: DocumentCardProps) {
    const ext = doc.filename.split(".").pop()?.toUpperCase() || "FILE";

    return (
        <div className="flex items-center gap-3.5 bg-white border border-slate-900/[0.06] rounded-xl p-[14px_18px] shadow-sm transition-all duration-250 animate-[slideUp_0.3s_ease-out] hover:border-slate-900/[0.18] hover:shadow-md" id={`doc-${doc.id}`}>
            <div className="flex flex-col items-center gap-[3px] text-[#1e4d8a] shrink-0">
                <FileText size={24} />
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.05em] uppercase">{ext}</span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-[13.5px] font-semibold text-[#0c1d36] m-[0_0_3px] whitespace-nowrap overflow-hidden text-overflow-ellipsis" title={doc.filename}>
                    {doc.filename}
                </h4>
                <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 mb-0.5">
                    <span>{doc.page_count} pages</span>
                    <span className="text-slate-200">·</span>
                    <span>{formatDate(doc.created_at)}</span>
                </div>
                
            </div>
        </div>
    );
}
