import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import { ensureArchiveDir, getArchiveDir } from "@/lib/storage";
import {
  isAllowedVideoMime,
  validateVideoDuration,
} from "@/lib/video-validation";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const video = formData.get("video") as File | null;
    let sessionId = formData.get("sessionId") as string | null;

    if (!video) {
      return NextResponse.json(
        { success: false, error: "No video file provided" },
        { status: 400 },
      );
    }

    if (!sessionId) {
      sessionId = randomUUID();
    }

    // Validate MIME type
    if (!isAllowedVideoMime(video.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported video format: ${video.type}. Accepted: MP4, MOV, WebM, AVI.`,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (video.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large (${(video.size / 1024 / 1024).toFixed(1)} MB). Maximum is 50 MB.`,
        },
        { status: 400 },
      );
    }

    const archiveDir = await ensureArchiveDir(sessionId);

    // Remove any existing video in this session (one video per session)
    try {
      const existingFiles = await readdir(archiveDir);
      for (const file of existingFiles) {
        await unlink(path.join(archiveDir, file));
      }
    } catch {
      // Directory may be empty or not exist yet — fine
    }

    // Write the video file
    const buffer = Buffer.from(await video.arrayBuffer());
    const safeFileName = video.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(archiveDir, safeFileName);
    await writeFile(filePath, buffer);

    // Validate duration via ffprobe (server-side)
    const validation = await validateVideoDuration(filePath);
    if (!validation.valid) {
      // Remove the file if duration check fails
      await unlink(filePath);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json(
      {
        success: true,
        sessionId,
        fileName: safeFileName,
        url: `${baseUrl}/api/files/${sessionId}/${encodeURIComponent(safeFileName)}`,
        duration: validation.duration,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload video" },
      { status: 500 },
    );
  }
};
