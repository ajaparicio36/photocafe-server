import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase/admin";

export const GET = async (req: NextRequest) => {
  try {
    const bucket = storage.bucket();

    // Get all files in the bucket
    const [files] = await bucket.getFiles();

    if (files.length === 0) {
      return NextResponse.json(
        { message: "No files found to check" },
        { status: 200 }
      );
    }

    const eightHoursAgo = new Date();
    eightHoursAgo.setHours(eightHoursAgo.getHours() - 8);

    const filesToDelete = [];

    // Check each file's creation time
    for (const file of files) {
      const [metadata] = await file.getMetadata();

      if (!metadata.timeCreated) {
        continue; // Skip files without creation time
      }

      const createdTime = new Date(metadata.timeCreated);

      if (createdTime < eightHoursAgo) {
        filesToDelete.push(file);
      }
    }

    if (filesToDelete.length === 0) {
      return NextResponse.json(
        { message: "No files older than 8 hours found" },
        { status: 200 }
      );
    }

    // Delete old files
    const deletePromises = filesToDelete.map(async (file) => {
      try {
        await file.delete();
        return { success: true, fileName: file.name };
      } catch (e) {
        console.error(`Failed to delete file ${file.name}:`, e);
        const message = e instanceof Error ? e.message : "Unknown error";
        return { success: false, fileName: file.name, error: message };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        message: `Cleanup completed`,
        deleted: successCount,
        failed: failCount,
        details: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting files:", error);
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  return GET(req);
};
