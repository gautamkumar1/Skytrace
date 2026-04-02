/**
 * POST /api/feedback — Submit finding feedback (approve/flag/reject).
 * Mirrors dashboard/callbacks.py capture_finding_feedback().
 */
import { NextResponse } from "next/server";
import { feedbackCommentColumn, getDbBackend, qual, query } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { finding_id, case_id, feedback, comment } = body;

        if (!finding_id || !case_id) {
            return NextResponse.json(
                { error: "finding_id and case_id are required" },
                { status: 400 }
            );
        }
        const hasComment = comment != null && String(comment).trim() !== "";
        const validFeedback = feedback && ["approve", "flag", "reject", "comment"].includes(feedback);
        if (!validFeedback && !hasComment) {
            return NextResponse.json(
                { error: "feedback (approve/flag/reject/comment) or comment is required" },
                { status: 400 }
            );
        }
        const feedbackValue = validFeedback ? feedback : "comment";

        const feedbackId =
            Date.now().toString(36) + Math.random().toString(36).substring(2, 10);

        const commentCol = feedbackCommentColumn();
        // Optional Snowflake DDL (Postgres table comes from Python ensure_schema).
        if (getDbBackend() === "snowflake") {
            try {
                await query(
                    `CREATE TABLE IF NOT EXISTS ${qual("finding_feedback")} (
                    id VARCHAR(64) PRIMARY KEY,
                    finding_id VARCHAR(64) NOT NULL,
                    case_id VARCHAR(255) NOT NULL,
                    actor VARCHAR(128) DEFAULT 'dashboard-ui',
                    feedback VARCHAR(32) NOT NULL,
                    ${commentCol} VARCHAR(1000),
                    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
                )`
                );
            } catch {
                // Table might already exist
            }
        }

        await query(
            `INSERT INTO ${qual("finding_feedback")} (id, finding_id, case_id, actor, feedback, ${commentCol})
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [feedbackId, finding_id, case_id, "dashboard-ui", feedbackValue, comment != null && comment !== "" ? String(comment) : null]
        );

        return NextResponse.json({ success: true, feedback_id: feedbackId });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Feedback error:", message);
        return NextResponse.json(
            { error: "Failed to submit feedback", detail: process.env.NODE_ENV === "development" ? message : undefined },
            { status: 500 }
        );
    }
}
