import React, { useState } from "react";

interface ArchiveFile {
  fileName: string;
  fullPath: string;
  url: string;
}

interface LightboxModalProps {
  file: ArchiveFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset loading states when file changes
  React.useEffect(() => {
    if (file && isOpen) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [file, isOpen]);

  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
  };

  const isVideo = (fileName: string) => {
    return /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(fileName);
  };

  const isPDF = (fileName: string) => {
    return /\.pdf$/i.test(fileName);
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="relative w-full h-full max-w-7xl max-h-full flex flex-col">
        <div className="flex justify-between items-center p-4 bg-black/50 rounded-t-lg">
          <h3 className="text-white text-sm md:text-base truncate flex-1 mr-4">
            {file.fileName}
          </h3>
          <button
            onClick={onClose}
            className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center bg-black/20 rounded-b-lg overflow-hidden">
          {isImage(file.fileName) ? (
            <div className="relative max-w-full max-h-full">
              {imageLoading && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white">Loading image...</div>
                </div>
              )}
              {imageError ? (
                <div className="bg-card p-8 rounded-lg text-center max-w-sm">
                  <p className="text-foreground mb-4">Failed to load image</p>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                  >
                    Open in new tab
                  </a>
                </div>
              ) : (
                <img
                  src={file.url}
                  alt={file.fileName}
                  className="max-w-full max-h-full object-contain"
                  onLoad={() => {
                    console.log("Image loaded successfully:", file.fileName);
                    setImageLoading(false);
                  }}
                  onError={(e) => {
                    console.error(
                      "Image failed to load:",
                      file.fileName,
                      file.url
                    );
                    console.error("Error event:", e);
                    // Try to fetch the URL directly to see what's happening
                    fetch(file.url)
                      .then((response) => {
                        console.log(
                          "Direct fetch response:",
                          response.status,
                          response.statusText
                        );
                        return response.text();
                      })
                      .then((text) => {
                        console.log("Response body:", text.substring(0, 200));
                      })
                      .catch((fetchError) => {
                        console.error("Direct fetch failed:", fetchError);
                      });
                    setImageLoading(false);
                    setImageError(true);
                  }}
                  style={{ display: imageLoading ? "none" : "block" }}
                />
              )}
            </div>
          ) : isVideo(file.fileName) ? (
            <video
              src={file.url}
              controls
              className="max-w-full max-h-full"
              playsInline
              preload="metadata"
              controlsList="nodownload"
            />
          ) : isPDF(file.fileName) ? (
            <div className="w-full h-full">
              <iframe
                src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full"
                title={file.fileName}
              />
            </div>
          ) : (
            <div className="bg-card p-8 rounded-lg text-center max-w-sm">
              <p className="text-foreground mb-4">
                Preview not available for this file type
              </p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
