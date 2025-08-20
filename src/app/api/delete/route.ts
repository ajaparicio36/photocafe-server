import { NextRequest, NextResponse } from "next/server";
import { deleteOldFiles } from "@/lib/storage";

export const GET = async (req: NextRequest) => {
  try {
    const { deleted, failed } = await deleteOldFiles();

    if (deleted.length === 0 && failed.length === 0) {
      return NextResponse.json(
        { message: "No archives older than 8 hours found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Cleanup completed",
        deleted: deleted.length,
        failed: failed.length,
        deletedArchives: deleted,
        failedArchives: failed,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete files";
    console.error("Error deleting files:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  return GET(req);
};
