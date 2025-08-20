import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");

export const ensureStorageDir = async () => {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
};

export const getArchiveDir = (archiveId: string) => {
  return path.join(STORAGE_DIR, archiveId);
};

export const ensureArchiveDir = async (archiveId: string) => {
  const dir = getArchiveDir(archiveId);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  return dir;
};

export const getFilesInArchive = async (archiveId: string) => {
  const dir = getArchiveDir(archiveId);
  try {
    const files = await fs.readdir(dir);
    return files.filter((file) => !file.startsWith("."));
  } catch {
    return [];
  }
};

export const deleteOldFiles = async () => {
  try {
    await ensureStorageDir();
    const archives = await fs.readdir(STORAGE_DIR);
    const eightHoursAgo = new Date();
    eightHoursAgo.setHours(eightHoursAgo.getHours() - 8);

    const deletedFiles: string[] = [];
    const failedFiles: string[] = [];

    for (const archive of archives) {
      const archiveDir = path.join(STORAGE_DIR, archive);
      try {
        const stats = await fs.stat(archiveDir);
        if (stats.isDirectory() && stats.birthtime < eightHoursAgo) {
          await fs.rm(archiveDir, { recursive: true, force: true });
          deletedFiles.push(archive);
        }
      } catch (error) {
        console.error(`Failed to delete archive ${archive}:`, error);
        failedFiles.push(archive);
      }
    }

    return { deleted: deletedFiles, failed: failedFiles };
  } catch (error) {
    console.error("Error in deleteOldFiles:", error);
    throw error;
  }
};
