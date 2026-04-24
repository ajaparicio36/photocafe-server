import { NextResponse } from "next/server";
import { getFilesInArchive } from "@/lib/storage";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) => {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { ready: false, error: "Session ID is required" },
        { status: 400 },
      );
    }

    const files = await getFilesInArchive(sessionId);
    const videoFile = files.find((f) =>
      /\.(mp4|mov|webm|avi|mkv|3gp)$/i.test(f),
    );

    if (videoFile) {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return NextResponse.json({
        ready: true,
        fileName: videoFile,
        url: `${baseUrl}/api/files/${sessionId}/${encodeURIComponent(videoFile)}`,
      });
    }

    return NextResponse.json({ ready: false });
  } catch (error) {
    console.error("Error checking upload status:", error);
    return NextResponse.json(
      { ready: false, error: "Failed to check status" },
      { status: 500 },
    );
  }
};
