import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { readdir, stat } from "fs/promises";
import path from "path";
import { getArchiveDir } from "@/lib/storage";
import archiver from "archiver";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Archive ID is required" },
        { status: 400 }
      );
    }

    const archiveDir = getArchiveDir(id);

    try {
      const stats = await stat(archiveDir);
      if (!stats.isDirectory()) {
        return NextResponse.json(
          { error: "Archive not found" },
          { status: 404 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    const files = await readdir(archiveDir);

    if (files.length === 0) {
      return NextResponse.json({ error: "Archive is empty" }, { status: 404 });
    }

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // Set up response headers
    const headers = new Headers({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${id}.zip"`,
    });

    // Create a readable stream for the response
    const readable = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        archive.on("end", () => {
          controller.close();
        });

        archive.on("error", (err) => {
          controller.error(err);
        });

        // Add files to archive
        files.forEach((fileName) => {
          const filePath = path.join(archiveDir, fileName);
          archive.file(filePath, { name: fileName });
        });

        archive.finalize();
      },
    });

    return new Response(readable, { headers });
  } catch (error) {
    console.error("Error creating ZIP:", error);
    return NextResponse.json(
      { error: "Failed to create ZIP archive" },
      { status: 500 }
    );
  }
};
