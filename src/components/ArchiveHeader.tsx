import React from "react";

interface ArchiveHeaderProps {
  archiveId: string;
  fileCount: number;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  archiveId,
  fileCount,
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Archive Files</h1>
      <p className="text-muted-foreground">
        Archive ID: <span className="font-mono text-sm">{archiveId}</span>
      </p>
      <p className="text-muted-foreground">{fileCount} file(s) found</p>
    </div>
  );
};
