/**
 * GET /api/stats — Dashboard aggregate statistics.
 */
import path from "node:path";
import { NextResponse } from "next/server";
import { config as loadEnv } from "dotenv";
import { qual, query, queryOne } from "@/lib/db";

export const runtime = "nodejs";

/** Load .env so Snowflake vars are in process.env (Turbopack often doesn't expose them). */
function ensureEnv() {
    const cwd = process.cwd();
    loadEnv({ path: path.join(cwd, ".env"), override: true });
    loadEnv({ path: path.join(cwd, ".env.local"), override: true });
}

export async function GET() {
    ensureEnv();
    try {
        const [casesCount, findingsCount, docsCount, engineCount] = await Promise.all([
            queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM ${qual("cases")}`),
            queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM ${qual("findings")}`),
            queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM ${qual("documents")}`),
            queryOne<{ count: number }>(`SELECT COUNT(*)::int AS count FROM ${qual("engine_data")}`),
        ]);

        const severityRows = await query<{ severity: string; count: number }>(
            `SELECT severity, COUNT(*)::int AS count
       FROM ${qual("findings")}
       GROUP BY severity
       ORDER BY severity`
        );

        const severityCounts: Record<string, number> = {};
        for (const row of severityRows) {
            severityCounts[row.severity] = row.count;
        }

        const recentFindings = await query(
            `SELECT f.id, f.case_id, f.severity, f.category, f.title, f.confidence,
              f.created_at AS created_at, c.registration, c.aircraft_type
       FROM ${qual("findings")} f
       JOIN ${qual("cases")} c ON c.case_id = f.case_id
       ORDER BY f.created_at DESC
       LIMIT 10`
        );

        return NextResponse.json({
            total_cases: casesCount?.count ?? 0,
            total_findings: findingsCount?.count ?? 0,
            total_documents: docsCount?.count ?? 0,
            total_engine_metrics: engineCount?.count ?? 0,
            severity_counts: severityCounts,
            recent_findings: recentFindings,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        const code = (err as { code?: number })?.code;
        const response = (err as { response?: { status?: number; statusText?: string; data?: unknown; config?: { url?: string } } })?.response;
        console.error("Stats error:", message, "code:", code, "url:", response?.config?.url, stack ?? "");
        const body: { error: string; detail?: string; snowflakeCode?: number; snowflakeStatus?: number; snowflakeUrl?: string } = { error: "Failed to fetch stats" };
        if (process.env.NODE_ENV === "development") {
            body.detail = message;
            if (code !== undefined) body.snowflakeCode = code;
            if (response?.status !== undefined) body.snowflakeStatus = response.status;
            if (response?.config?.url) body.snowflakeUrl = response.config.url;
        }
        return NextResponse.json(body, { status: 500 });
    }
}
