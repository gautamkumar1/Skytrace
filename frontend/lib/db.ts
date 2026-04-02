/**
 * Database access for Next.js API routes: Snowflake (default) or PostgreSQL when DATABASE_BACKEND=postgres.
 * Reads config from process.env and .env files (fs) so it works with Next.js 16 / Turbopack.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { Pool } from "pg";
import { Snowflake } from "snowflake-promise";

export type DbBackend = "snowflake" | "postgres";

let pgPool: Pool | null = null;

function getTryEnvPaths(): string[] {
    const cwd = process.cwd();
    const pwd = process.env.PWD || cwd;
    const root = findProjectRoot();
    return [
        path.join(root, ".env"),
        path.join(root, ".env.local"),
        path.join(root, "frontend", ".env"),
        path.join(root, "frontend", ".env.local"),
        path.join(cwd, ".env"),
        path.join(cwd, ".env.local"),
        path.join(cwd, "frontend", ".env"),
        path.join(cwd, "frontend", ".env.local"),
        path.join(pwd, ".env"),
        path.join(pwd, ".env.local"),
        path.join(pwd, "frontend", ".env"),
        path.join(pwd, "frontend", ".env.local"),
        path.resolve(cwd, "..", ".env"),
        path.resolve(cwd, "..", "frontend", ".env"),
        path.resolve(cwd, "..", "frontend", ".env.local"),
    ];
}

/** Load DATABASE_BACKEND / DATABASE_URL from process.env and .env files. */
export function getDbBackend(): DbBackend {
    loadDotenv({ path: path.join(process.cwd(), ".env"), override: true });
    loadDotenv({ path: path.join(process.cwd(), ".env.local"), override: true });
    let b = (process.env.DATABASE_BACKEND || "snowflake").trim().toLowerCase();
    if (b === "postgres" || b === "postgresql") return "postgres";
    for (const p of getTryEnvPaths()) {
        try {
            if (!fs.existsSync(p)) continue;
            const parsed = parseEnvFile(fs.readFileSync(p, "utf8"));
            const raw = (parsed.DATABASE_BACKEND || "").trim().toLowerCase();
            if (raw === "postgres" || raw === "postgresql") {
                if (parsed.DATABASE_URL) process.env.DATABASE_URL = parsed.DATABASE_URL;
                return "postgres";
            }
        } catch {
            // ignore
        }
    }
    if (b === "postgres" || b === "postgresql") return "postgres";
    return "snowflake";
}

function getPostgresUrl(): string {
    const url = (process.env.DATABASE_URL || "").trim();
    if (url) return url;
    for (const p of getTryEnvPaths()) {
        try {
            if (!fs.existsSync(p)) continue;
            const parsed = parseEnvFile(fs.readFileSync(p, "utf8"));
            if (parsed.DATABASE_URL) return parsed.DATABASE_URL;
        } catch {
            // ignore
        }
    }
    return "";
}

function getPgPool(): Pool {
    if (pgPool) return pgPool;
    const url = getPostgresUrl();
    if (!url) {
        throw new Error("DATABASE_URL is required when DATABASE_BACKEND=postgres. Set it in frontend/.env or frontend/.env.local.");
    }
    pgPool = new Pool({ connectionString: url, max: 10 });
    return pgPool;
}

/** Column name for finding_feedback.note text (reserved in Snowflake as COMMENT). */
export function feedbackCommentColumn(): string {
    return getDbBackend() === "snowflake" ? '"comment"' : "comment";
}

let connectionPromise: Promise<any> | null = null;

/** Cached Snowflake config from .env (avoids relying on process.env in Turbopack). */
let snowflakeConfig: Record<string, string> | null = null;

function parseEnvFile(content: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1).replace(/\\n/g, "\n");
        }
        out[key] = val;
    }
    return out;
}

function findProjectRoot(): string {
    const candidates: string[] = [process.cwd()];
    // When running from Turbopack bundle, bundle lives under .next; walk up to find project root
    if (process.cwd().includes(".next")) {
        let d = process.cwd();
        while (d.includes(".next")) {
            d = path.dirname(d);
            candidates.push(d);
        }
    }
    try {
        if (typeof import.meta !== "undefined" && import.meta.url) {
            const thisDir = path.dirname(fileURLToPath(import.meta.url));
            candidates.push(thisDir);
        }
    } catch {
        // ignore
    }
    for (const start of candidates) {
        let dir = start;
        for (let i = 0; i < 15; i++) {
            if (fs.existsSync(path.join(dir, "next.config.js")) || fs.existsSync(path.join(dir, "next.config.ts")) || fs.existsSync(path.join(dir, "next.config.mjs"))) {
                return dir;
            }
            if (fs.existsSync(path.join(dir, "package.json")) && fs.existsSync(path.join(dir, ".env"))) {
                return dir;
            }
            if (fs.existsSync(path.join(dir, "package.json"))) {
                return dir;
            }
            const parent = path.dirname(dir);
            if (parent === dir) break;
            dir = parent;
        }
    }
    return process.cwd();
}

/** Get Snowflake config: process.env first, then .env files. Result is cached. */
function getSnowflakeConfig(): Record<string, string> {
    if (snowflakeConfig) return snowflakeConfig;
    const env: Record<string, string> = {};
    const fromProcess = [
        "SNOWFLAKE_ACCOUNT",
        "SNOWFLAKE_USER",
        "SNOWFLAKE_PASSWORD",
        "SNOWFLAKE_REGION",
        "SNOWFLAKE_DATABASE",
        "SNOWFLAKE_SCHEMA",
        "SNOWFLAKE_WAREHOUSE",
        "SNOWFLAKE_ROLE",
        "SNOWFLAKE_PRIVATE_KEY_PATH",
        "SNOWFLAKE_PRIVATE_KEY_PASSPHRASE",
    ] as const;
    for (const key of fromProcess) {
        const v = process.env[key];
        if (v !== undefined && v !== "") env[key] = v;
    }
    if (env.SNOWFLAKE_ACCOUNT?.trim() && env.SNOWFLAKE_USER?.trim()) {
        snowflakeConfig = env;
        return snowflakeConfig;
    }
    // Turbopack often doesn't expose .env to server; load into process.env then re-read
    try {
        const cwd = process.cwd();
        loadDotenv({ path: path.join(cwd, ".env"), override: true });
        loadDotenv({ path: path.join(cwd, ".env.local"), override: true });
        for (const key of fromProcess) {
            const v = process.env[key];
            if (v !== undefined && v !== "") env[key] = v;
        }
        if (env.SNOWFLAKE_ACCOUNT?.trim() && env.SNOWFLAKE_USER?.trim()) {
            snowflakeConfig = env;
            return snowflakeConfig;
        }
    } catch {
        // ignore
    }
    const cwd = process.cwd();
    const pwd = process.env.PWD || cwd;
    const root = findProjectRoot();
    const tryPaths = [
        path.join(root, ".env"),
        path.join(root, ".env.local"),
        path.join(root, "frontend", ".env"),
        path.join(root, "frontend", ".env.local"),
        path.join(cwd, ".env"),
        path.join(cwd, ".env.local"),
        path.join(cwd, "frontend", ".env"),
        path.join(cwd, "frontend", ".env.local"),
        path.join(pwd, ".env"),
        path.join(pwd, ".env.local"),
        path.join(pwd, "frontend", ".env"),
        path.join(pwd, "frontend", ".env.local"),
        path.resolve(cwd, "..", ".env"),
        path.resolve(cwd, "..", "frontend", ".env"),
    ];
    for (const p of tryPaths) {
        try {
            if (!fs.existsSync(p)) continue;
            const content = fs.readFileSync(p, "utf8");
            const parsed = parseEnvFile(content);
            for (const [k, v] of Object.entries(parsed)) {
                if (k.startsWith("SNOWFLAKE_") && v !== undefined && v !== "") env[k] = v;
            }
        } catch {
            // ignore
        }
    }
    // Only cache when we have required vars so we don't permanently cache empty (e.g. wrong cwd on first request)
    if ((env.SNOWFLAKE_ACCOUNT || "").trim() && (env.SNOWFLAKE_USER || "").trim()) {
        snowflakeConfig = env;
    }
    return env;
}

/** Clear cached connection (e.g. after auth/404 failure so next request can try with current env). */
export function clearConnectionCache(): void {
    connectionPromise = null;
}

const PLACEHOLDER_ACCOUNT = "your-account-identifier";

function getAccount(cfg: Record<string, string>): string {
    const account = (cfg.SNOWFLAKE_ACCOUNT || "").trim();
    const region = (cfg.SNOWFLAKE_REGION || "").trim();
    if (!account || account === PLACEHOLDER_ACCOUNT || account.toLowerCase().includes("your-account")) {
        return "";
    }
    return region ? `${account}.${region}` : account;
}

export async function getConnection(): Promise<any> {
    const cfg = getSnowflakeConfig();
    if (connectionPromise) {
        return connectionPromise;
    }

    const account = getAccount(cfg);
    const user = (cfg.SNOWFLAKE_USER || "").trim();
    const useKeyPair = (cfg.SNOWFLAKE_PRIVATE_KEY_PATH || "").trim().length > 0;

    if (!account || !user) {
        const hint = !cfg.SNOWFLAKE_ACCOUNT?.trim()
            ? " Set SNOWFLAKE_ACCOUNT (and optionally SNOWFLAKE_REGION) in frontend/.env or frontend/.env.local and restart the dev server."
            : " Check frontend/.env has SNOWFLAKE_ACCOUNT and SNOWFLAKE_USER (no placeholder like 'your-account-identifier').";
        throw new Error("SNOWFLAKE_ACCOUNT and SNOWFLAKE_USER are required in frontend .env." + hint);
    }
    if (!useKeyPair && !(cfg.SNOWFLAKE_PASSWORD || "").trim()) {
        throw new Error(
            "SNOWFLAKE_PASSWORD is required (or set SNOWFLAKE_PRIVATE_KEY_PATH for key-pair auth)"
        );
    }

    connectionPromise = (async () => {
        const opts: Record<string, unknown> = {
            account,
            username: user,
            database: cfg.SNOWFLAKE_DATABASE || "AVIATION_AI",
            schema: cfg.SNOWFLAKE_SCHEMA || "POC",
            warehouse: cfg.SNOWFLAKE_WAREHOUSE || "COMPUTE_WH",
        };
        if ((cfg.SNOWFLAKE_ROLE || "").trim()) {
            opts.role = cfg.SNOWFLAKE_ROLE.trim();
        }
        if (useKeyPair) {
            opts.authenticator = "SNOWFLAKE_JWT";
            const keyPath = cfg.SNOWFLAKE_PRIVATE_KEY_PATH!.trim();
            opts.privateKeyPath = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);
            const pass = (cfg.SNOWFLAKE_PRIVATE_KEY_PASSPHRASE || "").trim();
            if (pass) opts.privateKeyPass = pass;
        } else {
            opts.password = cfg.SNOWFLAKE_PASSWORD!;
        }

        const conn = new Snowflake(opts as any);
        try {
            await conn.connect();
            return conn;
        } catch (e) {
            connectionPromise = null;
            const status = (e as { response?: { status?: number } })?.response?.status;
            const code = (e as { code?: number })?.code;
            if (status === 404 || code === 401002) {
                throw new Error(
                    `Snowflake connection failed (${status ?? code}). Check SNOWFLAKE_ACCOUNT and SNOWFLAKE_REGION in frontend/.env - account must be your real account (e.g. HJDNNXN-AI77564), not a placeholder. Restart the dev server after changing .env.`
                );
            }
            throw e;
        }
    })();

    return connectionPromise;
}

/** Quote identifier for names with spaces/special chars. */
function quoteId(name: string): string {
    return '"' + String(name).replace(/"/g, '""') + '"';
}

/** Fully qualified table name (database.schema.table) for session-independent queries. */
export function qual(table: string): string {
    if (getDbBackend() === "postgres") {
        return table;
    }
    const cfg = getSnowflakeConfig();
    const db = (cfg.SNOWFLAKE_DATABASE || "AVIATION_AI").trim();
    const schema = (cfg.SNOWFLAKE_SCHEMA || "POC").trim();
    const tbl = table === "llp_parts" ? quoteId("llp_parts") : table;
    return `${quoteId(db)}.${quoteId(schema)}.${tbl}`;
}

/**
 * Execute a parameterized query and return rows.
 */
export async function query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
): Promise<T[]> {
    const binds = params ?? [];

    if (getDbBackend() === "postgres") {
        let text = sql;
        if (binds.length && sql.includes("?") && !/\$[0-9]+/.test(sql)) {
            let n = 0;
            text = sql.replace(/\?/g, () => `$${++n}`);
        }
        try {
            const pool = getPgPool();
            const res = await pool.query(text, binds);
            return res.rows as T[];
        } catch (err) {
            console.error("Query Error (postgres):", err, "SQL:", text, "Params:", binds);
            throw err;
        }
    }

    const conn = await getConnection();

    try {
        // Rewrite PostgreSQL positional parameters ($1, $2) to Snowflake bindings (?)
        let sfSql = sql.replace(/\$\d+/g, "?");

        // Remove PostgreSQL specific type casting syntax like `::text` and `::int`
        sfSql = sfSql.replace(/::text/g, "::string").replace(/::int/g, "::integer");

        // Snowflake promise execute(sqlText, binds) returns rows or undefined
        const result = (await conn.execute(sfSql, params)) ?? [];

        // Convert keys to lowercase since Snowflake returns ALL_CAPS keys
        return (Array.isArray(result) ? result : []).map((row: any) => {
            const newRow: Record<string, any> = {};
            for (const [key, val] of Object.entries(row)) {
                newRow[key.toLowerCase()] = val;
            }
            return newRow as unknown as T;
        });
    } catch (err) {
        console.error("Query Error:", err, "SQL:", sql, "Params:", params);
        throw err;
    }
}

/**
 * Execute a query and return the first row or null.
 */
export async function queryOne<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows[0] ?? null;
}
