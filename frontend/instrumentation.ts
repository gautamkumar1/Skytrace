/**
 * Runs once when the server starts. In Node, loads .env via instrumentation-node (so SNOWFLAKE_* are available to API routes).
 * This file must stay Edge-safe (no Node APIs, no node: imports).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  await import("./instrumentation-node");
}
