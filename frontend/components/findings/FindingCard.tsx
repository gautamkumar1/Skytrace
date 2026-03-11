"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Finding } from "@/lib/types";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import { formatConfidence, formatDate, apiFetch } from "@/lib/utils";
import { ThumbsUp, Flag, X, MessageSquare, CheckCircle2 } from "lucide-react";

interface FindingCardProps {
    finding: Finding;
    index?: number;
}

export default function FindingCard({ finding, index = 0 }: FindingCardProps) {
    const [feedbackState, setFeedbackState] = useState<string | null>(null);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showComment, setShowComment] = useState(false);

    const submitFeedback = async (feedback: "approve" | "flag" | "reject") => {
        setSubmitting(true);
        try {
            await apiFetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    finding_id: finding.id,
                    case_id: finding.case_id,
                    feedback,
                    comment: comment || undefined,
                }),
            });
            setFeedbackState(feedback);
        } catch (err) {
            console.error("Feedback error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            className="bg-white border border-slate-900/[0.06] rounded-xl p-[20px_24px] shadow-sm transition-all duration-250 animate-[slideUp_0.3s_ease-out] hover:border-slate-900/[0.18] hover:shadow-md"
            id={`finding-${finding.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
        >
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                    <SeverityBadge severity={finding.severity} size="sm" />
                    <span className="text-[12.5px] font-semibold text-slate-500">{finding.category}</span>
                </div>
                <span className="text-xs font-medium text-slate-400">
                    {formatConfidence(finding.confidence)} confidence
                </span>
            </div>

            <h4 className="m-[0_0_6px] text-[15px] font-semibold leading-[1.45] text-[#0c1d36]">{finding.title}</h4>
            <p className="m-[0_0_12px] text-[13px] leading-[1.6] text-slate-500">{finding.evidence}</p>

            <div className="flex flex-wrap gap-2.5 pb-3 mb-3 border-b border-slate-900/[0.06] text-[11.5px] text-slate-400">
                <span>Agent: {finding.agent_name}</span>
                {finding.source_doc_id && <span>Source: {finding.source_doc_id}</span>}
                {finding.source_page && <span>Page: {finding.source_page}</span>}
                <span>Iteration: {finding.iteration}</span>
                <span>{formatDate(finding.created_at)}</span>
            </div>

            {/* Feedback Section */}
            <div className="flex flex-col gap-2">
                <AnimatePresence mode="wait">
                    {feedbackState ? (
                        <motion.div
                            className="flex items-center gap-[7px] p-[8px_12px] rounded-md bg-emerald-50 text-[13px] font-medium text-emerald-600"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25 }}
                        >
                            <CheckCircle2 size={16} />
                            <span>
                                Feedback recorded: <strong className="capitalize">{feedbackState}</strong>
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="flex flex-wrap gap-1.5">
                                <motion.button
                                    className="inline-flex items-center gap-[5px] p-[6px_14px] rounded-md border border-slate-900/10 bg-white text-xs font-semibold text-emerald-600 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-wait hover:not-disabled:bg-emerald-50 hover:not-disabled:border-emerald-600"
                                    onClick={() => submitFeedback("approve")}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <ThumbsUp size={14} />
                                    <span>Approve</span>
                                </motion.button>
                                <motion.button
                                    className="inline-flex items-center gap-[5px] p-[6px_14px] rounded-md border border-slate-900/10 bg-white text-xs font-semibold text-amber-500 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-wait hover:not-disabled:bg-amber-50 hover:not-disabled:border-amber-500"
                                    onClick={() => submitFeedback("flag")}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Flag size={14} />
                                    <span>Flag</span>
                                </motion.button>
                                <motion.button
                                    className="inline-flex items-center gap-[5px] p-[6px_14px] rounded-md border border-slate-900/10 bg-white text-xs font-semibold text-rose-500 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-wait hover:not-disabled:bg-rose-50 hover:not-disabled:border-rose-500"
                                    onClick={() => submitFeedback("reject")}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <X size={14} />
                                    <span>Reject</span>
                                </motion.button>
                                <motion.button
                                    className="inline-flex items-center gap-[5px] p-[6px_14px] rounded-md border border-slate-900/10 bg-white text-xs font-semibold text-slate-400 transition-all duration-150 cursor-pointer hover:bg-[#f0f3f7] hover:text-slate-500"
                                    onClick={() => setShowComment(!showComment)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <MessageSquare size={14} />
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {showComment && (
                                    <motion.input
                                        type="text"
                                        className="w-full mt-2 p-[8px_12px] rounded-md border border-slate-900/10 bg-[#f0f3f7] text-[13px] text-[#1a2233] outline-none transition-colors duration-150 placeholder:text-slate-400 focus:bg-white focus:border-[#2563a8]"
                                        placeholder="Add a comment (optional)..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
