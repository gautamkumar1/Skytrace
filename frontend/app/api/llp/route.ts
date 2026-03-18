/**
 * GET /api/llp — Life Limited Parts list and stats.
 * Reads from Snowflake table llp_parts (same DB/schema as cases). Returns empty when
 * DB is unavailable, table does not exist, or table is empty.
 *
 * Expected table: AVIATION_AI.POC.llp_parts — see scripts/create_llp_parts.sql
 *
 * POST /api/llp — Run BTB audit against current parts from DB.
 */
import { NextRequest, NextResponse } from "next/server";
import { query, qual } from "@/lib/db";
import type { LLPPart, LLPStats } from "@/lib/types";

function computeStats(parts: LLPPart[]): LLPStats {
    const active = parts.length;
    const pending = parts.filter((p) => p.btb_status === "pending_review").length;
    const overdue = parts.filter((p) => p.btb_status === "overdue").length;
    const verified = parts.filter((p) => p.btb_status === "verified").length;
    const complianceRate = active === 0 ? 100 : Math.round((verified / active) * 100);
    return {
        active_tracking: active,
        pending_btb_review: pending,
        compliance_rate_percent: complianceRate,
        overdue_count: overdue,
    };
}

/** Row from Snowflake (lowercase keys). */
type LLPRow = Record<string, unknown>;

function rowToPart(row: LLPRow): LLPPart {
    const str = (v: unknown) => (v != null ? String(v) : "");
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
    const date = (v: unknown) => (v != null && (typeof v === "string" || v instanceof Date) ? new Date(v as string).toISOString().slice(0, 10) : null);
    const btb = (v: unknown) => {
        const s = str(v).toLowerCase().replace(/-/g, "_");
        if (["verified", "pending_review", "gap", "overdue"].includes(s)) return s as LLPPart["btb_status"];
        return "pending_review";
    };
    const lifeUnit = (v: unknown) => {
        const s = String(v || "").toUpperCase();
        if (["FH", "FC", "CAL"].includes(s)) return s as LLPPart["life_unit"];
        return "FC";
    };
    return {
        id: str(row.id),
        case_id: str(row.case_id),
        registration: str(row.registration),
        aircraft_type: str(row.aircraft_type),
        part_number: str(row.part_number),
        part_name: str(row.part_name),
        serial_number: str(row.serial_number),
        position: str(row.position),
        life_unit: lifeUnit(row.life_unit),
        current_used: num(row.current_used),
        life_limit: num(row.life_limit),
        btb_status: btb(row.btb_status),
        next_inspection_date: date(row.next_inspection_date),
        last_btb_verified_at: date(row.last_btb_verified_at),
        notes: row.notes != null ? str(row.notes) || null : null,
    };
}

/** Fetch parts from DB; returns empty array if table missing or query fails. */
async function getLLPParts(): Promise<LLPPart[]> {
    try {
        const rows = await query<LLPRow>(
            `SELECT id, case_id, registration, aircraft_type, part_number, part_name, serial_number,
             position, life_unit, current_used, life_limit, btb_status, next_inspection_date,
             last_btb_verified_at, notes
             FROM ${qual("llp_parts")}
             ORDER BY registration, position, part_number`
        );
        return rows.map(rowToPart);
    } catch (err) {
        console.warn("LLP: llp_parts unavailable, returning empty.", err);
        return [];
    }
}

export async function GET() {
    try {
        const parts = await getLLPParts();
        const stats = computeStats(parts);
        return NextResponse.json({ parts, stats });
    } catch (err) {
        console.error("LLP API error:", err);
        return NextResponse.json(
            { error: "Failed to fetch LLP data" },
            { status: 500 }
        );
    }
}

export interface BTBAuditResult {
    run_at: string;
    total_parts: number;
    verified: number;
    pending_review: number;
    gap: number;
    overdue: number;
    items_flagged: { part_number: string; serial_number: string; registration: string; reason: string }[];
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const action = (body.action as string) || "";
        if (action !== "run_btb_audit") {
            return NextResponse.json(
                { error: "Invalid action. Use { \"action\": \"run_btb_audit\" }" },
                { status: 400 }
            );
        }
        const parts = await getLLPParts();
        const verified = parts.filter((p) => p.btb_status === "verified").length;
        const pending_review = parts.filter((p) => p.btb_status === "pending_review").length;
        const gap = parts.filter((p) => p.btb_status === "gap").length;
        const overdue = parts.filter((p) => p.btb_status === "overdue").length;
        const items_flagged = parts
            .filter((p) => p.btb_status !== "verified")
            .map((p) => ({
                part_number: p.part_number,
                serial_number: p.serial_number,
                registration: p.registration,
                reason: p.btb_status === "overdue" ? "Life limit exceeded or BTB overdue" : p.btb_status === "gap" ? "BTB documentation gap" : "BTB pending review",
            }));
        const result: BTBAuditResult = {
            run_at: new Date().toISOString(),
            total_parts: parts.length,
            verified,
            pending_review,
            gap,
            overdue,
            items_flagged,
        };
        return NextResponse.json(result);
    } catch (err) {
        console.error("LLP audit error:", err);
        return NextResponse.json(
            { error: "Failed to run BTB audit" },
            { status: 500 }
        );
    }
}
