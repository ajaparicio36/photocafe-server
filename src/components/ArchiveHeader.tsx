import React from "react";
import { Download, Archive } from "lucide-react";
import Image from "next/image";

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-6">
          <Image
            src="/clickclick_logo.png"
            alt="Click Click Photobooth Cafe"
            width={320}
            height={80}
            className="brand-logo-small"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold brand-text-light mb-2">
              Your Photos
            </h1>
            <p className="brand-text-light opacity-80 text-sm">
              Archive ID: <span className="font-mono">{archiveId}</span>
            </p>
            <p className="brand-text-light opacity-80 text-sm">
              {fileCount} photo(s) ready for download
            </p>
          </div>
        </div>

        <button
          onClick={onDownloadZip}
          className="flex items-center gap-2 brand-button-primary px-6 py-3 rounded-xl hover:bg-opacity-90 transition-all duration-200 font-medium shadow-lg"
        >
          <Archive className="h-5 w-5" />
          Download All as ZIP
        </button>
      </div>
    </div>
  );
};
