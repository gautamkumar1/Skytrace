import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { queryOne } from "@/lib/db";
import type { Document } from "@/lib/types";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ docId: string }> }
) {
    const { docId } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "view";

    try {
        // 1. Fetch document metadata from DB
        const doc = await queryOne<Document>(
            `SELECT id, case_id, filename, storage_key 
             FROM "Aircraft Leasing POC"."PUBLIC".documents 
             WHERE id = $1`,
            [docId]
        );

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // 2. Determine file path
        // The projectRoot logic from db.ts is robust, but for simplicity here we assume the root is the parent of frontend/
        const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
        const filePath = path.join(projectRoot, "data", "storage", doc.storage_key);

        // 3. Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            console.error(`File not found on disk: ${filePath}`);
            return NextResponse.json({ error: "File not found on storage" }, { status: 404 });
        }

        // 4. Read file content
        const fileBuffer = await fs.readFile(filePath);
        const contentType = getContentType(doc.filename);

        // 5. Build response
        const headers = new Headers();
        headers.set("Content-Type", contentType);
        
        if (action === "download") {
            headers.set("Content-Disposition", `attachment; filename="${doc.filename}"`);
        } else {
            headers.set("Content-Disposition", `inline; filename="${doc.filename}"`);
        }

        return new NextResponse(fileBuffer, {
            status: 200,
            headers,
        });

    } catch (err) {
        console.error("Document retrieval error:", err);
        return NextResponse.json({ error: "Failed to retrieve document" }, { status: 500 });
    }
}

function getContentType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "pdf": return "application/pdf";
        case "png": return "image/png";
        case "jpg":
        case "jpeg": return "image/jpeg";
        case "txt": return "text/plain";
        default: return "application/octet-stream";
    }
}
