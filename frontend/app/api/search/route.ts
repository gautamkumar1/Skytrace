/**
 * GET /api/search?q=term — Global search across cases, findings, and engine data.
 */
import { NextRequest, NextResponse } from "next/server";
import { qual, query } from "@/lib/db";

interface SearchResult {
    type: "case" | "finding" | "engine";
    id: string;
    title: string;
    subtitle: string;
    href: string;
    severity?: string;
}

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    const pattern = `%${q}%`;

    try {
        const [cases, findings, engine] = await Promise.all([
            // Search cases by case_id, registration, aircraft_type, engine_type
            query<{
                case_id: string;
                registration: string;
                aircraft_type: string;
                engine_type: string;
            }>(
                `SELECT case_id, registration, aircraft_type, engine_type
                 FROM ${qual("cases")}
                 WHERE LOWER(case_id) LIKE LOWER(?)
                    OR LOWER(registration) LIKE LOWER(?)
                    OR LOWER(aircraft_type) LIKE LOWER(?)
                    OR LOWER(engine_type) LIKE LOWER(?)
                 LIMIT 5`,
                [pattern, pattern, pattern, pattern]
            ),
            // Search findings by title, category, severity
            query<{
                id: string;
                case_id: string;
                title: string;
                category: string;
                severity: string;
            }>(
                `SELECT id, case_id, title, category, severity
                 FROM ${qual("findings")}
                 WHERE LOWER(title) LIKE LOWER(?)
                    OR LOWER(category) LIKE LOWER(?)
                    OR LOWER(severity) LIKE LOWER(?)
                 LIMIT 5`,
                [pattern, pattern, pattern]
            ),
            // Search engine metrics by metric_name, status
            query<{
                id: string;
                case_id: string;
                metric_name: string;
                status: string;
                registration: string;
            }>(
                `SELECT e.id, e.case_id, e.metric_name, e.status, e.registration
                 FROM ${qual("engine_data")} e
                 WHERE LOWER(e.metric_name) LIKE LOWER(?)
                    OR LOWER(e.status) LIKE LOWER(?)
                    OR LOWER(e.registration) LIKE LOWER(?)
                 LIMIT 5`,
                [pattern, pattern, pattern]
            ),
        ]);

        const results: SearchResult[] = [];

        for (const c of cases) {
            results.push({
                type: "case",
                id: c.case_id,
                title: `${c.registration} — ${c.aircraft_type}`,
                subtitle: `Case: ${c.case_id} · ${c.engine_type}`,
                href: `/cases/${encodeURIComponent(c.case_id)}`,
            });
        }

        for (const f of findings) {
            results.push({
                type: "finding",
                id: f.id,
                title: f.title.length > 60 ? f.title.slice(0, 60) + "…" : f.title,
                subtitle: `${f.severity} · ${f.category}`,
                href: `/cases/${encodeURIComponent(f.case_id)}`,
                severity: f.severity,
            });
        }

        for (const e of engine) {
            results.push({
                type: "engine",
                id: String(e.id),
                title: `${e.metric_name} — ${e.registration}`,
                subtitle: `Status: ${e.status}`,
                href: `/engine-health`,
            });
        }

        return NextResponse.json(results.slice(0, 12));
    } catch (err) {
        console.error("Search error:", err);
        return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
        );
    }
}
