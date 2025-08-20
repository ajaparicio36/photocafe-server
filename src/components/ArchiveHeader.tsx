import React from "react";
import { Download, Archive } from "lucide-react";

interface ArchiveHeaderProps {
  archiveId: string;
  fileCount: number;
  onDownloadZip: () => void;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  archiveId,
  fileCount,
  onDownloadZip,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Archive Files
          </h1>
          <p className="text-muted-foreground">
            Archive ID: <span className="font-mono text-sm">{archiveId}</span>
          </p>
          <p className="text-muted-foreground">{fileCount} file(s) found</p>
        </div>

        <button
          onClick={onDownloadZip}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Archive className="h-4 w-4" />
          Download All as ZIP
        </button>
      </div>
    </div>
  );
};
