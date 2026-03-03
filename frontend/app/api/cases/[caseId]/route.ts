/**
 * GET /api/cases/[caseId] — Get case detail with findings, documents, engine data.
 */
import { NextResponse } from "next/server";
import { qual, query, queryOne } from "@/lib/db";
import type { Case, Finding, Document, EngineMetric } from "@/lib/types";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ caseId: string }> }
) {
    const { caseId } = await params;
    try {
        const caseRow = await queryOne<Case>(
            `SELECT case_id, registration, aircraft_type, engine_type,
              created_at AS created_at
       FROM ${qual("cases")} WHERE case_id = $1`,
            [caseId]
        );

        if (!caseRow) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 });
        }

        const [findings, documents, engineData] = await Promise.all([
            query<Finding>(
                `SELECT id, case_id, agent_name, severity, category, title, evidence,
                confidence, source_doc_id, source_page, iteration,
                metadata_json, created_at AS created_at
         FROM ${qual("findings")} WHERE case_id = $1
         ORDER BY created_at`,
                [caseId]
            ),
            query<Document>(
                `SELECT id, case_id, filename, content_hash, storage_key, page_count,
                metadata_json, created_at AS created_at
         FROM ${qual("documents")} WHERE case_id = $1
         ORDER BY created_at`,
                [caseId]
            ),
            query<EngineMetric>(
                `SELECT id, case_id, registration, aircraft_type, engine_type,
                metric_name, COALESCE(metric_value, metric_value_numeric::text) AS metric_value,
                unit, status, metadata_json, created_at AS created_at
         FROM ${qual("engine_data")} WHERE case_id = $1
         ORDER BY metric_name`,
                [caseId]
            ),
        ]);

        return NextResponse.json({
            ...caseRow,
            findings,
            documents,
            engine_data: engineData,
        });
    } catch (err) {
        console.error("Case detail error:", err);
        return NextResponse.json(
            { error: "Failed to fetch case detail" },
            { status: 500 }
        );
    }
}
