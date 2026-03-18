"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Finding } from "@/lib/types";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import { formatConfidence, formatDate, apiFetch } from "@/lib/utils";
import { ThumbsUp, Flag, X, MessageSquare, CheckCircle2, Save, Link as LinkIcon, AlertTriangle } from "lucide-react";

interface FindingCardProps {
    finding: Finding;
    index?: number;
}

export default function FindingCard({ finding, index = 0 }: FindingCardProps) {
    const [feedbackState, setFeedbackState] = useState<string | null>(finding.user_feedback || null);
    const [comment, setComment] = useState(finding.feedback_comment || "");
    const [submitting, setSubmitting] = useState(false);
    const [showComment, setShowComment] = useState(!!finding.feedback_comment);
    const [savedComment, setSavedComment] = useState(finding.feedback_comment || "");

    const submitFeedback = async (feedback: "approve" | "flag" | "reject" | "comment") => {
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
            if (comment) setSavedComment(comment);
        } catch (err) {
            console.error("Feedback error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            className="bg-white border-l-4 border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
            id={`finding-${finding.id}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            style={{ 
                borderLeftColor: 
                    finding.severity === "STOP" ? "#e11d48" : 
                    finding.severity === "FLAG" ? "#f59e0b" : "#2563eb" 
            }}
        >
            <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">F-ID:</span>
                    <span className="text-[10px] font-bold text-slate-600 font-mono tracking-tight">{finding.id.slice(0, 8).toUpperCase()}</span>
                </div>
                {finding.metadata_json?.aviation_reference && (
                    <div className="flex items-center gap-1.5 opacity-80">
                         <LinkIcon size={10} className="text-slate-400" />
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{finding.metadata_json.aviation_reference}</span>
                    </div>
                )}
            </div>

            <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{finding.category}</span>
                        </div>
                        <h4 className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight uppercase">{finding.title}</h4>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <CheckCircle2 size={10} className="text-emerald-500" />
                            Technical Observation
                        </p>
                        <div className="bg-slate-50 p-3 rounded border border-slate-100 italic">
                            <p className="text-[12px] leading-relaxed text-slate-700 font-medium">
                                &ldquo;{finding.evidence}&rdquo;
                            </p>
                        </div>
                    </div>

                    {finding.metadata_json?.reasoning && (
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <AlertTriangle size={10} className="text-amber-500" />
                                Audit Domain Logic
                            </p>
                            <p className="text-[12px] leading-relaxed text-slate-800 font-bold border-l-2 border-slate-200 pl-3 py-1">
                                {finding.metadata_json.reasoning}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50/30 px-5 py-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confidence</span>
                        <span className={`text-[13px] font-black tracking-tight ${
                            finding.confidence >= 0.9 ? 'text-emerald-600' : 
                            finding.confidence >= 0.7 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                            {formatConfidence(finding.confidence)}
                        </span>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recorded</span>
                        <span className="text-[11px] font-bold text-slate-500">{formatDate(finding.created_at)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => submitFeedback("approve")}
                        disabled={submitting}
                        className={`p-1.5 rounded-md transition-all border shrink-0 ${feedbackState === 'approve' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100'}`}
                        title="Approve"
                    >
                        <ThumbsUp size={14} />
                    </button>
                    <button
                        onClick={() => submitFeedback("flag")}
                        disabled={submitting}
                        className={`p-1.5 rounded-md transition-all border shrink-0 ${feedbackState === 'flag' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-100'}`}
                        title="Flag"
                    >
                        <Flag size={14} />
                    </button>
                    <button
                        onClick={() => submitFeedback("reject")}
                        disabled={submitting}
                        className={`p-1.5 rounded-md transition-all border shrink-0 ${feedbackState === 'reject' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100'}`}
                        title="Reject"
                    >
                        <X size={14} />
                    </button>
                    <button
                        onClick={() => setShowComment(!showComment)}
                        className={`p-1.5 rounded-md transition-all border shrink-0 ${showComment ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-100'}`}
                        title="Add note"
                    >
                        <MessageSquare size={14} />
                    </button>
                </div>
            </div>

            {/* Expansible Comment/Note Area */}
            <AnimatePresence>
                {(showComment || savedComment || finding.feedback_comment) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                    >
                        <div className="p-4 space-y-3">
                            {(savedComment || finding.feedback_comment) && (
                                <div className="p-3 rounded bg-white border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stored Comment</p>
                                    <p className="text-[12px] text-slate-700 font-medium">{savedComment || finding.feedback_comment}</p>
                                </div>
                            )}

                            {showComment && (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full p-3 rounded border border-slate-200 bg-white text-[12px] text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all resize-none font-medium"
                                        placeholder="Add internal technical notes..."
                                        rows={2}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => submitFeedback("comment")}
                                            disabled={submitting}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                        >
                                            <Save size={12} />
                                            SAVE AUDIT NOTE
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowComment(false)}
                                            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider"
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

