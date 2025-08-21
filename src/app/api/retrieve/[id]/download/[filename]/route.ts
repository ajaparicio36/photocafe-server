import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getArchiveDir } from "@/lib/storage";
import { lookup } from "mime-types";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) => {
  try {
    const { id, filename } = await params;

    if (!id || !filename) {
      return NextResponse.json(
        { error: "Archive ID and filename are required" },
        { status: 400 }
      );
    }

    const decodedFilename = decodeURIComponent(filename);
    const filePath = path.join(getArchiveDir(id), decodedFilename);

    try {
      const buffer = await readFile(filePath);
      const mimeType = lookup(decodedFilename) || "application/octet-stream";

      // Convert Buffer to Uint8Array for Response compatibility
      const uint8Array = new Uint8Array(buffer);

      return new Response(uint8Array, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${decodedFilename}"`,
          "Content-Length": buffer.length.toString(),
        },
      });
    } catch (fileError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
};
