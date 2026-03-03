/**
 * GET /api/debug-env — Development only. Returns which SNOWFLAKE_* vars are set (no values).
 * Remove or restrict in production.
 */
import { NextResponse } from "next/server";

const KEYS = [
  "SNOWFLAKE_ACCOUNT",
  "SNOWFLAKE_USER",
  "SNOWFLAKE_PASSWORD",
  "SNOWFLAKE_DATABASE",
  "SNOWFLAKE_SCHEMA",
  "SNOWFLAKE_WAREHOUSE",
  "SNOWFLAKE_PRIVATE_KEY_PATH",
] as const;

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const env: Record<string, boolean> = {};
  for (const key of KEYS) {
    const v = process.env[key];
    env[key] = v !== undefined && v !== "" && !String(v).includes("your-account");
  }
  return NextResponse.json({
    cwd: process.env.NODE_ENV === "development" ? process.cwd() : undefined,
    env,
    ok: env.SNOWFLAKE_ACCOUNT && env.SNOWFLAKE_USER,
  });
}
