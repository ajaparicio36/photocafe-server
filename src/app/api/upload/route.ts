import { storage } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

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

    const bucket = storage.bucket();
    const uploadPromises = files.map(async (file) => {
      const fileName = `${archiveId}/${file.name}`;
      const fileRef = bucket.file(fileName);
      const buffer = Buffer.from(await file.arrayBuffer());

      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
        // five minutes in milliseconds
        timeout: 5 * 60 * 1000,
      });

      // Make file publicly accessible and get URL
      await fileRef.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      return {
        fileName: file.name,
        url: publicUrl,
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
