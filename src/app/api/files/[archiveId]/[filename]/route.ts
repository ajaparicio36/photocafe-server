import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getArchiveDir } from "@/lib/storage";
import { lookup } from "mime-types";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ archiveId: string; filename: string }> }
) => {
  try {
    const { archiveId, filename } = await params;

    if (!archiveId || !filename) {
      return NextResponse.json(
        { error: "Archive ID and filename are required" },
        { status: 400 }
      );
    }

    const filePath = path.join(getArchiveDir(archiveId), filename);

    try {
      const buffer = await readFile(filePath);
      const mimeType = lookup(filename) || "application/octet-stream";

      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": mimeType,
          "Content-Length": buffer.length.toString(),
        },
      });
    } catch (fileError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
};
