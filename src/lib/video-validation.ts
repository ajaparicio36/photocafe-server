import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const MAX_DURATION_SECONDS = 7.5;
const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "video/3gpp",
];

export interface VideoValidationResult {
  valid: boolean;
  duration?: number;
  error?: string;
}

export function isAllowedVideoMime(mimeType: string): boolean {
  return ALLOWED_VIDEO_MIMES.includes(mimeType);
}

export async function validateVideoDuration(
  filePath: string,
): Promise<VideoValidationResult> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_entries",
      "format=duration",
      filePath,
    ]);

    const parsed: { format?: { duration?: string } } = JSON.parse(stdout);
    const duration = parseFloat(parsed.format?.duration ?? "0");

    if (isNaN(duration) || duration <= 0) {
      return { valid: false, error: "Could not determine video duration" };
    }

    if (duration > MAX_DURATION_SECONDS) {
      return {
        valid: false,
        duration,
        error: `Video is ${duration.toFixed(1)}s long. Maximum allowed is ${MAX_DURATION_SECONDS}s.`,
      };
    }

    return { valid: true, duration };
  } catch {
    // ffprobe not available — fall back to accepting the file
    // (client-side validation is always enforced)
    console.warn(
      "ffprobe not available, skipping server-side duration validation",
    );
    return { valid: true };
  }
}
