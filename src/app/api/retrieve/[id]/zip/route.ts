import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getArchiveDir, getFilesInArchive } from "@/lib/storage";
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

    const files = await getFilesInArchive(id);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Archive not found or empty" },
        { status: 404 }
      );
    }

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const stream = new ReadableStream({
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
        Promise.all(
          files.map(async (fileName) => {
            try {
              const filePath = path.join(getArchiveDir(id), fileName);
              const buffer = await readFile(filePath);
              archive.append(buffer, { name: fileName });
            } catch (err) {
              console.error(`Error adding file ${fileName} to archive:`, err);
            }
          })
        )
          .then(() => {
            archive.finalize();
          })
          .catch((err) => {
            controller.error(err);
          });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${id}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error creating ZIP:", error);
    return NextResponse.json(
      { error: "Failed to create ZIP file" },
      { status: 500 }
    );
  }
};
