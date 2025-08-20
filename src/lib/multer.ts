import multer from "multer";
import path from "path";
import { ensureArchiveDir } from "./storage";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const archiveId = req.body.archiveId || req.headers["x-archive-id"];
      if (!archiveId) {
        return cb(new Error("Archive ID is required"), "");
      }
      const dir = await ensureArchiveDir(archiveId);
      cb(null, dir);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});
