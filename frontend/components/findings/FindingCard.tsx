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
            className="finding-card"
            id={`finding-${finding.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
            whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
        >
            <div className="finding-card__header">
                <div className="finding-card__header-left">
                    <SeverityBadge severity={finding.severity} size="sm" />
                    <span className="finding-card__category">{finding.category}</span>
                </div>
                <span className="finding-card__confidence">
                    {formatConfidence(finding.confidence)} confidence
                </span>
            </div>

            <h4 className="finding-card__title">{finding.title}</h4>
            <p className="finding-card__evidence">{finding.evidence}</p>

            <div className="finding-card__meta">
                <span>Agent: {finding.agent_name}</span>
                {finding.source_doc_id && <span>Source: {finding.source_doc_id}</span>}
                {finding.source_page && <span>Page: {finding.source_page}</span>}
                <span>Iteration: {finding.iteration}</span>
                <span>{formatDate(finding.created_at)}</span>
            </div>

            {/* Feedback Section */}
            <div className="finding-card__feedback">
                <AnimatePresence mode="wait">
                    {feedbackState ? (
                        <motion.div
                            className="finding-card__feedback-done"
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
                            <div className="finding-card__feedback-actions">
                                <motion.button
                                    className="finding-card__feedback-btn finding-card__feedback-btn--approve"
                                    onClick={() => submitFeedback("approve")}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <ThumbsUp size={14} />
                                    <span>Approve</span>
                                </motion.button>
                                <motion.button
                                    className="finding-card__feedback-btn finding-card__feedback-btn--flag"
                                    onClick={() => submitFeedback("flag")}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Flag size={14} />
                                    <span>Flag</span>
                                </motion.button>
                                <motion.button
                                    className="finding-card__feedback-btn finding-card__feedback-btn--reject"
                                    onClick={() => submitFeedback("reject")}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <X size={14} />
                                    <span>Reject</span>
                                </motion.button>
                                <motion.button
                                    className="finding-card__feedback-btn finding-card__feedback-btn--comment"
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
                                        className="finding-card__comment-input mt-2"
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
