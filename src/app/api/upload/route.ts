import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { ensureArchiveDir } from "@/lib/storage";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    let archiveId = formData.get("archiveId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Generate archive ID if not provided
    if (!archiveId) {
      archiveId = randomUUID();
    }

    const archiveDir = await ensureArchiveDir(archiveId);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(archiveDir, file.name);

      await writeFile(filePath, buffer);

      return {
        fileName: file.name,
        url: `${baseUrl}/api/files/${archiveId}/${encodeURIComponent(
          file.name
        )}`,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return NextResponse.json(
      {
        message: "Files uploaded successfully",
        archiveId,
        files: uploadedFiles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
};
