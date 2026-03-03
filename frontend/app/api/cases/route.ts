/**
 * GET /api/cases — List all cases.
 */
import { NextResponse } from "next/server";
import { qual, query } from "@/lib/db";
import type { Case } from "@/lib/types";

export async function GET() {
    try {
        const rows = await query<Case>(`
      SELECT case_id, registration, aircraft_type, engine_type,
             created_at AS created_at
      FROM ${qual("cases")}
      ORDER BY created_at DESC
    `);
        return NextResponse.json(rows);
    } catch (err) {
        console.error("List cases error:", err);
        return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
    }
}
