/**
 * POST /api/feedback — Submit finding feedback (approve/flag/reject).
 * Mirrors dashboard/callbacks.py capture_finding_feedback().
 */
import { NextResponse } from "next/server";
import { getConnection, qual } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { finding_id, case_id, feedback, comment } = body;

        if (!finding_id || !case_id || !feedback) {
            return NextResponse.json(
                { error: "finding_id, case_id, and feedback are required" },
                { status: 400 }
            );
        }

        const feedbackId =
            Date.now().toString(36) + Math.random().toString(36).substring(2, 10);

        const conn = await getConnection();
        await conn.execute({
            sqlText: `INSERT INTO ${qual("finding_feedback")} (id, finding_id, case_id, actor, feedback, comment)
         VALUES (?, ?, ?, ?, ?, ?)`,
            binds: [feedbackId, finding_id, case_id, "dashboard-ui", feedback, comment || null]
        });

        return NextResponse.json({ success: true, feedback_id: feedbackId });
    } catch (err) {
        console.error("Feedback error:", err);
        return NextResponse.json(
            { error: "Failed to submit feedback" },
            { status: 500 }
        );
    }
}
