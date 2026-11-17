"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, X } from "lucide-react";
import { getWorkingPermitAttachment } from "../../services/workingPermitService"; 
import { Props } from "@repo/shared";




export default function AttachmentPreview({
  permitId,
  attachment,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);

  const isImage = attachment.mimeType.startsWith("image/");

  useEffect(() => {
    if (!isImage) return;

    let active = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      try {
        const blob = await getWorkingPermitAttachment(
          permitId,
          attachment.id
        );

        if (!active) return;

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch {
        if (active) setError(true);
      }
    };

    void loadImage();

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [permitId, attachment.id, isImage]);

  const openDocument = async () => {
    setIsLoading(true);

    try {
      const blob = await getWorkingPermitAttachment(
        permitId,
        attachment.id
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = attachment.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isImage ? (
          <button
            type="button"
            onClick={() => imageUrl && setIsOpen(true)}
            disabled={!imageUrl}
            className="group relative block w-full overflow-hidden bg-slate-100"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={attachment.originalName}
                className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-44 items-center justify-center">
                {error ? (
                  <span className="text-xs text-red-500">
                    Unable to load image
                  </span>
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                )}
              </div>
            )}
          </button>
        ) : (
          <div className="flex h-44 items-center justify-center bg-slate-50">
            <FileText className="h-12 w-12 text-slate-400" />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {attachment.originalName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {(attachment.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>

          {isImage ? (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              disabled={!imageUrl}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              View
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void openDocument()}
              disabled={isLoading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Download"}
            </button>
          )}
        </div>
      </div>

      {isOpen && imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={attachment.originalName}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>

          <img
            src={imageUrl}
            alt={attachment.originalName}
            className="max-h-[85vh] max-w-[95vw] object-contain"
          />

          <div className="absolute bottom-5 rounded-lg bg-black/50 px-4 py-2 text-sm text-white">
            {attachment.originalName}
          </div>
        </div>
      )}
    </>
  );
}