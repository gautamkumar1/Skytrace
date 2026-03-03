"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import DocumentCard from "@/components/documents/DocumentCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/utils";
import type { FleetSummaryRow, Document } from "@/lib/types";
import { FileText, Filter } from "lucide-react";

export default function DocumentsPage() {
    const [fleet, setFleet] = useState<FleetSummaryRow[]>([]);
    const [selectedCase, setSelectedCase] = useState<string>("");
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState(false);

    useEffect(() => {
        apiFetch<FleetSummaryRow[]>("/api/fleet")
            .then((data) => {
                setFleet(data);
                if (data.length > 0) setSelectedCase(data[0].case_id);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedCase) return;
        setLoadingDocs(true);
        apiFetch<{ documents: Document[] }>(`/api/cases/${encodeURIComponent(selectedCase)}`)
            .then((data) => setDocuments(data.documents || []))
            .catch(console.error)
            .finally(() => setLoadingDocs(false));
    }, [selectedCase]);

    const totalPages = documents.reduce((sum, d) => sum + d.page_count, 0);

    if (loading) return <LoadingSpinner text="Loading documents..." />;

    return (
        <>
            <Header title="Documents" subtitle="Ingested PDF documents for each case" />

            <motion.div
                className="flex flex-wrap items-center gap-3 mb-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Filter size={15} className="text-slate-400" />
                <select
                    value={selectedCase}
                    onChange={(e) => setSelectedCase(e.target.value)}
                    id="documents-case-select"
                    className="bg-white border border-slate-200 rounded-lg text-slate-700 px-3 py-2 text-sm outline-none cursor-pointer min-w-[260px] focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                >
                    {fleet.map((c) => (
                        <option key={c.case_id} value={c.case_id}>
                            {c.registration} — {c.case_id} ({c.doc_count} docs)
                        </option>
                    ))}
                </select>
                {documents.length > 0 && (
                    <span className="text-sm text-slate-400">
                        {documents.length} document{documents.length !== 1 ? "s" : ""} •{" "}
                        {totalPages} total pages
                    </span>
                )}
            </motion.div>

            {loadingDocs ? (
                <LoadingSpinner text="Loading documents..." />
            ) : documents.length === 0 ? (
                <EmptyState
                    icon={<FileText size={28} />}
                    title="No Documents"
                    description="No PDF documents have been ingested for this case."
                />
            ) : (
                <motion.div
                    className="page-section"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <div className="page-section__header">
                        <h3 className="page-section__title">
                            Ingested Files
                            <span className="page-section__count">{documents.length}</span>
                        </h3>
                    </div>
                    <div className="grid-documents">
                        {documents.map((doc, i) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                            >
                                <DocumentCard doc={doc} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </>
    );
}
