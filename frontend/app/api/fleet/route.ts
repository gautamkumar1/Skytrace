/**
 * GET /api/fleet — Fleet summary (mirrors database.fleet_summary()).
 */
import { NextResponse } from "next/server";
import { qual, query } from "@/lib/db";
import type { FleetSummaryRow } from "@/lib/types";

export async function GET() {
    try {
        const rows = await query<FleetSummaryRow>(`
      SELECT
        c.case_id,
        c.registration,
        c.aircraft_type,
        c.engine_type,
        COUNT(DISTINCT d.id) AS doc_count,
        COUNT(DISTINCT f.id) AS finding_count,
        COUNT(DISTINCT e.id) AS engine_metric_count
      FROM ${qual("cases")} c
      LEFT JOIN ${qual("documents")} d ON d.case_id = c.case_id
      LEFT JOIN ${qual("findings")} f ON f.case_id = c.case_id
      LEFT JOIN ${qual("engine_data")} e ON e.case_id = c.case_id
      GROUP BY c.case_id, c.registration, c.aircraft_type, c.engine_type
      ORDER BY c.case_id
    `);
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Fleet summary error:", err);
        return NextResponse.json(
            { error: "Failed to fetch fleet summary" },
            { status: 500 }
        );
    }
}
