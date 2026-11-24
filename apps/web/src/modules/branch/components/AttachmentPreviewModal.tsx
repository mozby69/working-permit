
"use client";

import { useEffect, useState } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

type Attachment = {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
};

type Props = {
  file: Attachment | null;
  fileUrl: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onDownload: () => void;
};

export default function AttachmentPreviewModal({
  file,
  fileUrl,
  loading,
  error,
  onClose,
  onDownload,
}: Props) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!file) return;

    //setZoom(1);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [file, onClose]);

  if (!file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${file.originalName}`}
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {file.originalName}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {(file.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isImage && fileUrl && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((value) => Math.max(0.5, value - 0.25))
                  }
                  disabled={zoom <= 0.5}
                  title="Zoom out"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ZoomOut size={18} />
                </button>

                <span className="min-w-12 text-center text-xs text-slate-600">
                  {Math.round(zoom * 100)}%
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setZoom((value) => Math.min(3, value + 0.25))
                  }
                  disabled={zoom >= 3}
                  title="Zoom in"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ZoomIn size={18} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onDownload}
              disabled={!fileUrl || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
              <p className="text-sm">Loading attachment...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          ) : !fileUrl ? (
            <p className="text-sm text-slate-500">
              Attachment unavailable.
            </p>
          ) : isImage ? (
            <div className="flex min-h-full min-w-full items-center justify-center">
            <Image
              src={fileUrl}
              alt={file.originalName}
              width={1200}
              height={800}
              unoptimized
              className="h-auto w-auto max-h-[70vh] max-w-full rounded-lg object-contain shadow-sm"
              style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
              }}
          />
            </div>
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={file.originalName}
              className="h-full w-full rounded-lg border-0 bg-white"
            />
          ) : (
            <div className="text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-slate-400" />

              <p className="text-sm font-medium text-slate-700">
                Preview not available
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Download this file to view its contents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
