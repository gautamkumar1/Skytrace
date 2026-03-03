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
        <div className="document-card" id={`doc-${doc.id}`}>
            <div className="document-card__icon">
                <FileText size={24} />
                <span className="document-card__ext">{ext}</span>
            </div>
            <div className="document-card__info">
                <h4 className="document-card__filename" title={doc.filename}>
                    {doc.filename}
                </h4>
                <div className="document-card__meta">
                    <span>{doc.page_count} pages</span>
                    <span>•</span>
                    <span>{formatDate(doc.created_at)}</span>
                </div>
                <span className="document-card__hash" title={doc.content_hash}>
                    SHA-256: {doc.content_hash.substring(0, 12)}…
                </span>
            </div>
        </div>
    );
}
