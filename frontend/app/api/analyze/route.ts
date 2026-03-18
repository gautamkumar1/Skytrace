import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

const ALLOWED_EXTENSIONS = new Set([".pdf", ".txt", ".csv", ".json", ".docx", ".xlsx", ".xls"]);
const MAX_FILE_SIZE_MB = 50;

function getExtension(name: string): string {
    const base = path.basename(name);
    const i = base.lastIndexOf(".");
    return i >= 0 ? base.slice(i).toLowerCase() : "";
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const caseId = formData.get("case_id") as string;
        const registration = formData.get("registration") as string;
        const rawAircraftType = (formData.get("aircraft_type") as string) || "";
        const rawEngineType = (formData.get("engine_type") as string) || "";
        const files = formData.getAll("files") as File[];

        // "auto" or blank means let the backend detect
        const aircraftType = rawAircraftType && rawAircraftType.toLowerCase() !== "auto" ? rawAircraftType : "";
        const engineType = rawEngineType && rawEngineType.toLowerCase() !== "auto" ? rawEngineType : "";

        if (!caseId || !registration || !files.length) {
            return NextResponse.json(
                { error: "Missing required fields or files" },
                { status: 400 }
            );
        }

        const rejected: string[] = [];
        const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
        for (const file of files) {
            const ext = getExtension(file.name);
            if (!ALLOWED_EXTENSIONS.has(ext)) {
                rejected.push(`${file.name} (type not supported)`);
            } else if (file.size > maxBytes) {
                rejected.push(`${file.name} (over ${MAX_FILE_SIZE_MB}MB)`);
            } else if (file.size === 0) {
                rejected.push(`${file.name} (empty)`);
            }
        }
        if (rejected.length > 0) {
            return NextResponse.json(
                { error: "Some files were rejected", rejected, allowed: "PDF, TXT, CSV, JSON, DOCX, XLSX, XLS" },
                { status: 400 }
            );
        }

        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `aviation-ai-${caseId}-`));

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const safeName = path.basename(file.name).replace(/\.\./g, "");
            const filePath = path.join(tempDir, safeName);
            await fs.writeFile(filePath, buffer);
        }

        // 2. Spawn Python analysis
        // We use the absolute path to the venv python and main.py
        const projectRoot = process.env.PROJECT_ROOT || "/home/nbuck/aircraft-leasing-poc";
        const pythonPath = path.join(projectRoot, ".venv", "bin", "python3");
        const scriptPath = path.join(projectRoot, "main.py");

        const args = [
            scriptPath,
            "--case", caseId,
            "--reg", registration,
            ...(aircraftType ? ["--type", aircraftType] : []),
            ...(engineType ? ["--engine", engineType] : []),
            "--docs", tempDir
        ];

        console.log(`Executing: ${pythonPath} ${args.join(" ")}`);

        // Use a Promise to wait for the process to complete
        const analyzeProcess = spawn(pythonPath, args, {
            cwd: projectRoot,
            env: { ...process.env, PYTHONPATH: projectRoot }
        });

        let output = "";
        let errorOutput = "";

        analyzeProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        analyzeProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        const exitCode = await new Promise((resolve) => {
            analyzeProcess.on("close", resolve);
        });

        // 3. Cleanup temp files
        // We keep them for a moment if we want to debug, but ideally cleanup
        await fs.rm(tempDir, { recursive: true, force: true });

        if (exitCode !== 0) {
            console.error("Analysis failed:", errorOutput);
            return NextResponse.json(
                { error: "Analysis failed", details: errorOutput },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            case_id: caseId,
            output: output.split("\n").filter(l => l.includes("Seeded") || l.includes("Ingested") || l.includes("REPORT")).join("\n")
        });

    } catch (err: any) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
