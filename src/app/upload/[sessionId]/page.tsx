"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, Film } from "lucide-react";

const MAX_DURATION = 7;

type UploadStep = "select" | "preview" | "uploading" | "success" | "error";

export default function UploadVideoPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [sessionId, setSessionId] = useState<string>("");
  const [step, setStep] = useState<UploadStep>("select");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id));
  }, [params]);

  const resetState = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl("");
    setDuration(0);
    setErrorMessage("");
    setUploadProgress("");
    setStep("select");
  }, [videoUrl]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check MIME type
      const allowedTypes = [
        "video/mp4",
        "video/quicktime",
        "video/webm",
        "video/x-msvideo",
        "video/x-matroska",
        "video/3gpp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(
          "Unsupported format. Please use MP4, MOV, WebM, or AVI.",
        );
        setStep("error");
        return;
      }

      // Check file size (50 MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage("File is too large. Maximum size is 50 MB.");
        setStep("error");
        return;
      }

      // Validate duration via HTML5 video element
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > MAX_DURATION + 0.5) {
          setErrorMessage(
            `Video is ${video.duration.toFixed(1)}s long. Maximum is ${MAX_DURATION} seconds.`,
          );
          URL.revokeObjectURL(url);
          setStep("error");
          return;
        }
        setDuration(video.duration);
        setVideoFile(file);
        setVideoUrl(url);
        setStep("preview");
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        setErrorMessage("Could not read this video file. Please try another.");
        setStep("error");
      };
      video.src = URL.createObjectURL(file);
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!videoFile || !sessionId) return;

    setStep("uploading");
    setUploadProgress("Uploading video...");

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("sessionId", sessionId);

      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/upload-video`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Upload failed. Please try again.");
        setStep("error");
        return;
      }

      setStep("success");
    } catch {
      setErrorMessage("Network error. Please check your connection and retry.");
      setStep("error");
    }
  }, [videoFile, sessionId]);

  return (
    <div className="min-h-dvh brand-bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl font-bold brand-text-light"
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            Click Click
          </h1>
          <p className="text-sm brand-text-light opacity-80 mt-1">
            Upload your flipbook video
          </p>
        </div>

        {/* Card */}
        <div className="brand-card rounded-2xl p-6 shadow-lg">
          {/* SELECT */}
          {step === "select" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[var(--brand-primary)] bg-opacity-10 flex items-center justify-center">
                <Film className="w-10 h-10 text-[var(--brand-primary)]" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold brand-text-dark">
                  Select a video
                </h2>
                <p className="text-sm brand-text-dark opacity-70 mt-1">
                  Record or choose a video up to {MAX_DURATION} seconds long
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="brand-button-primary w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Choose Video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* PREVIEW */}
          {step === "preview" && videoUrl && (
            <div className="flex flex-col items-center gap-4">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full rounded-xl bg-black"
                controls
                playsInline
                preload="auto"
              />
              <p className="text-sm brand-text-dark opacity-70">
                Duration: {duration.toFixed(1)}s
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={resetState}
                  className="brand-button-secondary flex-1 py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  Choose Another
                </button>
                <button
                  onClick={handleUpload}
                  className="brand-button-primary flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Use This Video
                </button>
              </div>
            </div>
          )}

          {/* UPLOADING */}
          {step === "uploading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-12 h-12 text-[var(--brand-primary)] animate-spin" />
              <p className="text-base font-semibold brand-text-dark">
                {uploadProgress}
              </p>
              <p className="text-sm brand-text-dark opacity-60">
                Please wait...
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold brand-text-dark">
                  Video Uploaded!
                </h2>
                <p className="text-sm brand-text-dark opacity-70 mt-1">
                  Return to the booth to continue with your flipbook.
                </p>
              </div>
            </div>
          )}

          {/* ERROR */}
          {step === "error" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold brand-text-dark">
                  Something went wrong
                </h2>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>
              <button
                onClick={resetState}
                className="brand-button-primary w-full py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs brand-text-light opacity-50 mt-4">
          Session: {sessionId?.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}
