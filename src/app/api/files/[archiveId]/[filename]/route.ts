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

    console.log("File request:", { archiveId, filename });

    if (!archiveId || !filename) {
      return NextResponse.json(
        { error: "Archive ID and filename are required" },
        { status: 400 }
      );
    }

    const decodedFilename = decodeURIComponent(filename);
    const archiveDir = getArchiveDir(archiveId);
    const filePath = path.join(archiveDir, decodedFilename);

    console.log("Attempting to read file:", filePath);

    try {
      const buffer = await readFile(filePath);
      const mimeType = lookup(decodedFilename) || "application/octet-stream";

      console.log("File read successfully:", {
        filename: decodedFilename,
        size: buffer.length,
        mimeType,
      });

      // Convert Buffer to Uint8Array for Response compatibility
      const uint8Array = new Uint8Array(buffer);

      // Special handling for images to ensure proper preview
      const isImage = /^image\//i.test(mimeType);

      const headers: Record<string, string> = {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      };

      // Add CORS headers for cross-origin requests
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "GET";
      headers["Access-Control-Allow-Headers"] = "Content-Type";

      // For images, ensure they can be displayed inline
      if (isImage) {
        headers[
          "Content-Disposition"
        ] = `inline; filename="${decodedFilename}"`;
      }

      return new Response(uint8Array, { headers });
    } catch (fileError) {
      console.error("File not found:", filePath, fileError);
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
