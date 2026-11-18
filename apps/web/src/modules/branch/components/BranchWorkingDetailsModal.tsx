
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  X,
  ClipboardList,
  Building2,
  UserRound,
  FileText,
  CalendarDays,
  MessageSquareText,
  Clock3,
  Eye,
  Download,
  Loader2,
  ImageIcon,
} from "lucide-react";

import ApprovalProgress from "./ApprovalProgress";
import AttachmentPreviewModal from "./AttachmentPreviewModal";

import type {
  BranchPermitStatus,
  BranchWorkingPermit,
} from "@repo/shared";
import api from "@/lib/api/api-client";

// Change this import to your actual Axios instance.

type Props = {
  permit: BranchWorkingPermit;
  onClose: () => void;
};

type PermitAttachment =
  BranchWorkingPermit["attachments"][number];

// Replace this with your actual backend attachment route.

  const getAttachmentEndpoint = (
  permitId: string,
  attachmentId: string
) => {
  return `/working-permit/${encodeURIComponent(permitId)}/attachments/${encodeURIComponent(attachmentId)}`;
};
// ==========================================
// STATUS BADGE
// ==========================================

export function StatusBadge({
  status,
}: {
  status: BranchPermitStatus;
}) {
  const colors: Record<BranchPermitStatus, string> = {
    PENDING:
      "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED:
      "border-red-200 bg-red-50 text-red-700",
    COMPLETED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    CANCELLED:
      "border-slate-200 bg-slate-100 text-slate-600",
    IN_PROGRESS:
      "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${colors[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

// ==========================================
// DATE FORMATTERS
// ==========================================

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

// ==========================================
// COMPONENT
// ==========================================

export default function BranchWorkingDetailsModal({
  permit,
  onClose,
}: Props) {
  const [previewFile, setPreviewFile] =
    useState<PermitAttachment | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [previewError, setPreviewError] =
    useState<string | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  // ==========================================
  // CLOSE PREVIEW
  // ==========================================

  const closePreview = useCallback(() => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setPreviewError(null);
  }, []);

  // ==========================================
  // KEYBOARD
  // ==========================================

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!previewFile) {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose, previewFile]);

  // ==========================================
  // LOAD ATTACHMENT AS BLOB
  // ==========================================

  useEffect(() => {
    if (!previewFile) return;

    const controller = new AbortController();

    let objectUrl: string | null = null;

    async function loadAttachment() {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewUrl(null);

      try {
       const response = await api.get<Blob>(
          getAttachmentEndpoint(
            permit.id,
            previewFile!.id
          ),
          {
            responseType: "blob",
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        const blob = new Blob([response.data], {
          type: previewFile!.mimeType,
        });

        objectUrl = URL.createObjectURL(blob);

        setPreviewUrl(objectUrl);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(
          "Failed to load attachment:",
          error
        );

        setPreviewError(
          "Unable to load attachment. Verify the file endpoint and permissions."
        );
      } finally {
        if (!controller.signal.aborted) {
          setPreviewLoading(false);
        }
      }
    }

    void loadAttachment();

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [previewFile]);

  // ==========================================
  // DOWNLOAD BLOB
  // ==========================================

  const saveBlob = useCallback(
    (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    },
    []
  );

  const downloadAttachment = useCallback(
    async (file: PermitAttachment) => {
      if (downloadingId) return;

      setDownloadingId(file.id);

      try {
      const response = await api.get<Blob>(
        getAttachmentEndpoint(
          permit.id,
          file.id
        ),
        {
          responseType: "blob",
        }
      );

        const blob = new Blob([response.data], {
          type: file.mimeType,
        });

        saveBlob(blob, file.originalName);
      } catch (error) {
        console.error(
          "Failed to download attachment:",
          error
        );

        alert("Failed to download attachment.");
      } finally {
        setDownloadingId(null);
      }
    },
    [downloadingId, saveBlob]
  );

  // ==========================================
  // REMARKS
  // ==========================================

  const remarks = [...(permit.remarksList ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="branch-permit-title"
          className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        >
          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <ClipboardList size={21} />
              </div>

              <div>
                <h2
                  id="branch-permit-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {permit.referenceNumber}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Working Permit Request Details
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="space-y-6 overflow-y-auto px-6 py-6">
            {/* REQUEST INFORMATION */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Request Information
              </h3>

              <StatusBadge status={permit.status} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                icon={<FileText size={16} />}
                label="Type of Work"
                value={permit.WorkerList.workerName}
              />

              <Info
                icon={<UserRound size={16} />}
                label="Requested By"
                value={permit.requestedBy}
              />

              <Info
                icon={<Building2 size={16} />}
                label="Branch"
                value={permit.branchDepartment.entityName}
              />

              <Info
                icon={<Building2 size={16} />}
                label="From"
                value={permit.fromDepartment.entityName}
              />

              <Info
                icon={<CalendarDays size={16} />}
                label="Request Date"
                value={formatDate(permit.date)}
              />

              <Info
                icon={<ClipboardList size={16} />}
                label="Request Level"
                value={permit.requestLevel.replaceAll("_", " ")}
              />

              <Info
                icon={<UserRound size={16} />}
                label="Created By"
                value={permit.createdBy?.name ?? "—"}
              />

              <Info
                icon={<Clock3 size={16} />}
                label="Created At"
                value={formatDateTime(permit.createdAt)}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Request Description
              </h3>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {permit.requestFor}
                </p>
              </div>
            </div>

            {/* APPROVAL TIMELINE */}
            <div className="border-t border-slate-200 pt-6">
              <ApprovalProgress permit={permit} />
            </div>

            {/* WORK RECEPTION */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Work Reception
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <Info
                  icon={<UserRound size={16} />}
                  label="Received By"
                  value={
                    permit.receivedBy?.name ??
                    "Not received"
                  }
                />

                <Info
                  icon={<Clock3 size={16} />}
                  label="Received At"
                  value={formatDateTime(permit.receivedAt)}
                />
              </div>
            </div>

            {/* REMARKS */}
            <div className="border-t border-slate-200 pt-5">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquareText
                  size={17}
                  className="text-indigo-600"
                />

                <h3 className="text-sm font-semibold text-slate-900">
                  Remarks ({remarks.length})
                </h3>
              </div>

              {remarks.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No remarks available.
                </p>
              ) : (
                <div className="space-y-3">
                  {remarks.map((remark) => (
                    <div
                      key={remark.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {remark.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-3.5 w-3.5" />

                          <span className="font-medium text-slate-600">
                            {remark.createdBy?.name ??
                              "Unknown User"}
                          </span>
                        </div>

                        <span>
                          {formatDateTime(
                            remark.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ATTACHMENTS */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Attachments ({permit.attachments.length})
              </h3>

              {permit.attachments.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No attachments available.
                </p>
              ) : (
                <div className="space-y-3">
                  {permit.attachments.map((file) => {
                    const isImage =
                      file.mimeType.startsWith("image/");

                    const isPdf =
                      file.mimeType ===
                      "application/pdf";

                    return (
                      <div
                        key={file.id}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-nowrap"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                          {isImage ? (
                            <ImageIcon className="h-6 w-6 text-indigo-600" />
                          ) : isPdf ? (
                            <FileText className="h-6 w-6 text-red-500" />
                          ) : (
                            <FileText className="h-6 w-6 text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {file.originalName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {(file.fileSize / 1024).toFixed(1)} KB
                            {" • "}
                            {isImage
                              ? "Image"
                              : isPdf
                                ? "PDF Document"
                                : "Attachment"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewFile(file)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void downloadAttachment(file)
                            }
                            disabled={downloadingId !== null}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {downloadingId === file.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Download size={15} />
                            )}

                            Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ATTACHMENT PREVIEW MODAL */}
      <AttachmentPreviewModal
        file={previewFile}
        fileUrl={previewUrl}
        loading={previewLoading}
        error={previewError}
        onClose={closePreview}
        onDownload={() => {
          if (previewFile) {
            void downloadAttachment(previewFile);
          }
        }}
      />
    </>
  );
}

// ==========================================
// INFO COMPONENT
// ==========================================

function Info({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-1.5 text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}
