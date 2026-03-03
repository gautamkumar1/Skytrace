/**
 * Node-only: loads .env into process.env. Imported from instrumentation.ts only when NEXT_RUNTIME === "nodejs".
 */
import path from "node:path";
import { config as loadEnv } from "dotenv";

const cwd = process.cwd();
const envPaths = [
  path.join(cwd, ".env"),
  path.join(cwd, ".env.local"),
  path.join(cwd, "frontend", ".env"),
  path.join(cwd, "frontend", ".env.local"),
];
for (const p of envPaths) {
  loadEnv({ path: p, override: true });
}
