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
        <div className="bg-white border text-left shadow-sm overflow-hidden flex flex-col relative h-full group" id={`doc-${doc.id}`}>
            <div className="bg-slate-50/50 px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <FileText size={10} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {ext} ARC_DOC
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => window.open(`/api/documents/${doc.id}?action=download`, '_blank')}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all"
                        title="Download"
                    >
                        <Download size={10} />
                    </button>
                    <button 
                        onClick={() => window.open(`/api/documents/${doc.id}?action=view`, '_blank')}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all"
                        title="View"
                    >
                        <ExternalLink size={10} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1">
                <h4 className="text-[12px] font-bold text-slate-900 leading-tight mb-3 uppercase tracking-tight line-clamp-2 min-h-[2.4em]" title={doc.filename}>
                    {doc.filename}
                </h4>
            </div>
            
            <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between mt-auto">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Technical Record</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                    {formatDate(doc.created_at)}
                </span>
            </div>
        </div>
    );
}

