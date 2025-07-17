import React from "react";

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
  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
  };

  const isVideo = (fileName: string) => {
    return /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(fileName);
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-7xl max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          ✕
        </button>

        {isImage(file.fileName) ? (
          <img
            src={file.url}
            alt={file.fileName}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : isVideo(file.fileName) ? (
          <video
            src={file.url}
            controls
            className="max-w-full max-h-full rounded-lg"
            autoPlay
          />
        ) : (
          <div className="bg-card p-8 rounded-lg text-center">
            <p className="text-foreground">
              Preview not available for this file type
            </p>
          </div>
        )}

        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
          {file.fileName}
        </div>
      </div>
    </div>
  );
};
