"use client";

import React, { useState, useEffect } from "react";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ArchiveHeader } from "@/components/ArchiveHeader";
import { FileGrid } from "@/components/FileGrid";
import { LightboxModal } from "@/components/LightboxModal";

interface ArchiveFile {
  fileName: string;
  fullPath: string;
  url: string;
}

interface ArchiveData {
  archiveId: string;
  files: ArchiveFile[];
}

const ArchivePage = ({
  params,
}: {
  params: Promise<{ archiveId: string }>;
}) => {
  const [archiveId, setArchiveId] = useState<string>("");
  const [archiveData, setArchiveData] = useState<ArchiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setArchiveId(resolvedParams.archiveId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!archiveId) return;

    const fetchArchive = async () => {
      try {
        const response = await fetch(`/api/retrieve/${archiveId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch archive");
        }
        const data = await response.json();
        setArchiveData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchArchive();
  }, [archiveId]);

  const handlePreview = (file: ArchiveFile) => {
    setSelectedFile(file);
    setLightboxOpen(true);
  };

  const handleDownload = async (file: ArchiveFile) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDownloadZip = async () => {
    try {
      const response = await fetch(`/api/retrieve/${archiveId}/zip`);
      if (!response.ok) {
        throw new Error("Failed to download ZIP");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${archiveId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("ZIP download failed:", err);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedFile(null);
  };

  if (loading) {
    return <LoadingState message="Loading archive..." />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ArchiveHeader
          archiveId={archiveData?.archiveId || ""}
          fileCount={archiveData?.files.length || 0}
          onDownloadZip={handleDownloadZip}
        />

        <FileGrid
          files={archiveData?.files || []}
          onPreview={handlePreview}
          onDownload={handleDownload}
        />

        <LightboxModal
          file={selectedFile}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
