import { NextRequest, NextResponse } from "next/server";
import { getFilesInArchive } from "@/lib/storage";

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const fileUrls = files.map((fileName) => {
      return {
        fileName: fileName,
        fullPath: `${id}/${fileName}`,
        url: `${baseUrl}/api/files/${id}/${encodeURIComponent(fileName)}`,
      };
    });

    return NextResponse.json(
      {
        archiveId: id,
        files: fileUrls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving files:", error);
    return NextResponse.json(
      { error: "Failed to retrieve files" },
      { status: 500 }
    );
  }
};
