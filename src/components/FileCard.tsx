import React from "react";
import { Download, Eye, FileImage, FileVideo, FileText } from "lucide-react";

interface ArchiveFile {
  fileName: string;
  fullPath: string;
  url: string;
}

interface FileCardProps {
  file: ArchiveFile;
  onPreview: (file: ArchiveFile) => void;
  onDownload: (file: ArchiveFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPreview,
  onDownload,
}) => {
  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
  };

  const isVideo = (fileName: string) => {
    return /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(fileName);
  };

  const isPDF = (fileName: string) => {
    return /\.pdf$/i.test(fileName);
  };

  return (
    <div className="brand-card rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:scale-105">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isImage(file.fileName) ? (
            <img
              src={file.url}
              alt={file.fileName}
              className="w-full h-full object-cover rounded-lg"
              onLoad={() => {
                console.log("Thumbnail loaded:", file.fileName);
              }}
              onError={(e) => {
                console.error(
                  "Thumbnail failed to load:",
                  file.fileName,
                  file.url
                );
                // Try to fetch the URL directly
                fetch(file.url)
                  .then((response) => {
                    console.log(
                      "Thumbnail fetch response:",
                      response.status,
                      response.statusText
                    );
                  })
                  .catch((fetchError) => {
                    console.error("Thumbnail fetch failed:", fetchError);
                  });
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML =
                  '<div class="h-8 w-8 text-gray-400 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg></div>';
              }}
            />
          ) : isVideo(file.fileName) ? (
            <FileVideo className="h-8 w-8 text-gray-500" />
          ) : isPDF(file.fileName) ? (
            <FileText className="h-8 w-8 text-gray-500" />
          ) : (
            <FileImage className="h-8 w-8 text-gray-500" />
          )}
        </div>

        <p
          className="text-xs text-center brand-text-dark truncate w-full font-medium"
          title={file.fileName}
        >
          {file.fileName}
        </p>

        <div className="flex space-x-2 w-full">
          <button
            onClick={() => onPreview(file)}
            className="flex-1 p-2 brand-button-primary rounded-lg transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
            title="Preview"
          >
            <Eye className="h-3 w-3 mx-auto" />
          </button>
          <button
            onClick={() => onDownload(file)}
            className="flex-1 p-2 brand-button-secondary rounded-lg transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
            title="Download"
          >
            <Download className="h-3 w-3 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};
