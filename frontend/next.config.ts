import type { NextConfig } from "next";

// .env is loaded by instrumentation.ts when the Node server starts (before API routes run).
// Do not load dotenv here — it can cause "exports is not defined in ES module scope" when Next compiles the config.

const nextConfig: NextConfig = {};

export default nextConfig;
