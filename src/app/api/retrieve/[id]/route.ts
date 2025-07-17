import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase/admin";

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

    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({
      prefix: `${id}/`,
    });

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Archive not found or empty" },
        { status: 404 }
      );
    }

    const fileUrls = files.map((file) => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      return {
        fileName: file.name.split("/").pop(), // Get just the filename without folder path
        fullPath: file.name,
        url: publicUrl,
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
