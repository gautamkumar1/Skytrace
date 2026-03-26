/**
 * GET /api/engine/fleet-health — Per-case health for Global Fleet Health cards.
 * Returns health_pct, status label, and counts for circular gauges and risk display.
 */
import { NextResponse } from "next/server";
import { qual, query } from "@/lib/db";

export interface FleetHealthRow {
    case_id: string;
    registration: string;
    aircraft_type: string;
    engine_type: string;
    doc_count: number;
    finding_count: number;
    critical_count: number;
    advisory_count: number;
    clear_count: number;
    engine_metric_count: number;
}

export async function GET() {
    try {
        const casesTable = qual("cases");
        const documentsTable = qual("documents");
        const findingsTable = qual("findings");
        const engineDataTable = qual("engine_data");

        const rows = await query<FleetHealthRow>(`
      SELECT
        c.case_id,
        c.registration,
        c.aircraft_type,
        c.engine_type,
        COUNT(DISTINCT d.id) AS doc_count,
        COUNT(DISTINCT f.id) AS finding_count,
        SUM(CASE WHEN UPPER(COALESCE(f.severity,'')) IN ('STOP','FLAG') THEN 1 ELSE 0 END) AS critical_count,
        SUM(CASE WHEN UPPER(COALESCE(f.severity,'')) = 'ADVISORY' THEN 1 ELSE 0 END) AS advisory_count,
        SUM(CASE WHEN UPPER(COALESCE(f.severity,'')) = 'CLEAR' THEN 1 ELSE 0 END) AS clear_count,
        COUNT(DISTINCT e.id) AS engine_metric_count
      FROM ${casesTable} c
      LEFT JOIN ${documentsTable} d ON d.case_id = c.case_id
      LEFT JOIN ${findingsTable} f ON f.case_id = c.case_id
      LEFT JOIN ${engineDataTable} e ON e.case_id = c.case_id
      GROUP BY c.case_id, c.registration, c.aircraft_type, c.engine_type
      ORDER BY c.registration
    `);

        const withHealth = rows.map((r) => {
            const critical = Number(r.critical_count) || 0;
            const advisory = Number(r.advisory_count) || 0;
            const totalFindings = Number(r.finding_count) || 0;
            const docCount = Number(r.doc_count) || 0;

            let healthPct = 100;
            if (totalFindings > 0) {
                healthPct = Math.max(0, 100 - critical * 25 - advisory * 8);
            }
            if (docCount === 0 && totalFindings === 0) {
                healthPct = 85;
            }

            let status: "clean" | "missing_link" | "advisory" | "fraud_risk" = "clean";
            if (critical > 0) status = "fraud_risk";
            else if (advisory > 0) status = "advisory";
            else if (docCount === 0) status = "missing_link";

            return {
                case_id: String(r.case_id),
                registration: String(r.registration),
                aircraft_type: String(r.aircraft_type || ""),
                engine_type: String(r.engine_type || ""),
                doc_count: Number(r.doc_count) || 0,
                finding_count: Number(r.finding_count) || 0,
                critical_count: critical,
                advisory_count: advisory,
                clear_count: Number(r.clear_count) || 0,
                engine_metric_count: Number(r.engine_metric_count) || 0,
                health_pct: Math.round(healthPct),
                status,
            };
        });

        return NextResponse.json(withHealth);
    } catch (err) {
        console.error("Fleet health error:", err);
        return NextResponse.json(
            { error: "Failed to fetch fleet health" },
            { status: 500 }
        );
    }
}
