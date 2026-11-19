
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import { getWorkingPermitAttachment } from "../../services/workingPermitService";
import type { Props } from "@repo/shared";

type AttachmentPreviewProps =
  | (Props & {
      file?: never;
      onRemove?: never;
      disabled?: never;
    })
  | {
      file: File;
      permitId?: never;
      attachment?: never;
      onRemove?: () => void;
      disabled?: boolean;
    };

type PreviewContentProps = {
  url: string;
  name: string;
  onClose: () => void;
};

function PreviewContent({
  url,
  name,
  onClose,
}: PreviewContentProps) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        aria-label="Close preview"
      >
        <X className="h-5 w-5" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={name}
        className="max-h-[85vh] max-w-[95vw] object-contain"
      />

      <div className="absolute bottom-5 max-w-[90vw] truncate rounded-lg bg-black/50 px-4 py-2 text-sm text-white">
        {name}
      </div>
    </div>,
    document.body
  );
}

export default function AttachmentPreview(
  props: AttachmentPreviewProps
) {
const isLocal = props.file !== undefined;

const file = props.file;
const attachment = props.attachment;
const permitId = props.permitId;

const name = file?.name ?? attachment?.originalName ?? "";

const size = file?.size ?? attachment?.fileSize ?? 0;

const mimeType = file?.type ?? attachment?.mimeType ?? "";

const isImage = mimeType.startsWith("image/");

  const [imageUrl, setImageUrl] = useState<string | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);

  // Local file: generate a temporary preview URL.
  // Saved file: retrieve its contents from the backend.
  useEffect(() => {
    if (!isImage) {
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      try {
        let blob: Blob;

        if (file) {
          blob = file;
        } else if (permitId && attachment) {
          blob = await getWorkingPermitAttachment(
            permitId,
            attachment.id
          );
        } else {
          return;
        }

        if (!active) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch {
        if (active) {
          setError(true);
        }
      }
    };

    void loadImage();

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, permitId, attachment, isImage]);

  const openDocument = async () => {
    setIsLoading(true);

    try {
      let blob: Blob;

      if (file) {
        blob = file;
      } else if (permitId && attachment) {
        blob = await getWorkingPermitAttachment(
          permitId,
          attachment.id
        );
      } else {
        return;
      }

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = name;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
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
            onClick={() => {
              if (imageUrl) {
                setIsOpen(true);
              }
            }}
            disabled={!imageUrl}
            className="group relative block w-full overflow-hidden bg-slate-100"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={name}
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
            <p
              className="truncate text-sm font-medium text-slate-800"
              title={name}
            >
              {name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {(size / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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

            {isLocal && props.onRemove && (
              <button
                type="button"
                onClick={props.onRemove}
                disabled={props.disabled}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label={`Remove ${name}`}
                title="Remove attachment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && imageUrl && (
        <PreviewContent
          url={imageUrl}
          name={name}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
