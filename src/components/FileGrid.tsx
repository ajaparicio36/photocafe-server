import React from "react";
import { FileCard } from "./FileCard";

interface ArchiveFile {
  fileName: string;
  fullPath: string;
  url: string;
}

interface FileGridProps {
  files: ArchiveFile[];
  onPreview: (file: ArchiveFile) => void;
  onDownload: (file: ArchiveFile) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  onPreview,
  onDownload,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {files.map((file, index) => (
        <FileCard
          key={index}
          file={file}
          onPreview={onPreview}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};
