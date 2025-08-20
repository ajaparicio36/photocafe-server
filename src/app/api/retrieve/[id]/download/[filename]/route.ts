import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase/admin";

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

    const bucket = storage.bucket();
    const filePath = `${id}/${filename}`;
    const file = bucket.file(filePath);

    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const [buffer] = await file.download();
    const [metadata] = await file.getMetadata();

    return new Response(buffer, {
      headers: {
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
};
