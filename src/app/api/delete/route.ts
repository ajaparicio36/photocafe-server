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
      try {
        const [metadata] = await file.getMetadata();

        if (!metadata.timeCreated) {
          continue; // Skip files without creation time
        }

        const createdTime = new Date(metadata.timeCreated);

        if (createdTime < eightHoursAgo) {
          filesToDelete.push(file);
        }
      } catch (metadataError) {
        console.error(
          `Failed to get metadata for ${file.name}:`,
          metadataError
        );
        continue;
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
        return {
          success: true,
          fileName: file.name.replace(/[\x00-\x1f\x7f-\x9f]/g, ""), // Remove control characters
        };
      } catch (e) {
        const sanitizedFileName = file.name.replace(
          /[\x00-\x1f\x7f-\x9f]/g,
          ""
        );
        const errorMessage =
          e instanceof Error
            ? e.message.replace(/[\x00-\x1f\x7f-\x9f]/g, "")
            : "Unknown error";
        console.error(`Failed to delete file ${sanitizedFileName}:`, e);
        return {
          success: false,
          fileName: sanitizedFileName,
          error: errorMessage,
        };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        message: "Cleanup completed",
        deleted: successCount,
        failed: failCount,
        details: results,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message.replace(/[\x00-\x1f\x7f-\x9f]/g, "")
        : "Failed to delete files";
    console.error("Error deleting files:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  return GET(req);
};
