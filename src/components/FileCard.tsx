import React from "react";
import { Download, Eye, FileImage, FileVideo } from "lucide-react";

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

  return (
    <div className="group bg-card border border-border rounded-lg p-4 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 cursor-pointer">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
          {isImage(file.fileName) ? (
            <img
              src={file.url}
              alt={file.fileName}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : isVideo(file.fileName) ? (
            <FileVideo className="h-8 w-8 text-muted-foreground" />
          ) : (
            <FileImage className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <p
          className="text-xs text-center text-foreground truncate w-full"
          title={file.fileName}
        >
          {file.fileName}
        </p>

        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPreview(file)}
            className="p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            title="Preview"
          >
            <Eye className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDownload(file)}
            className="p-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
            title="Download"
          >
            <Download className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
