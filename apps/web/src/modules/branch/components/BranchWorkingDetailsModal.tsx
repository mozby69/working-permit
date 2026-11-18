
"use client";

import { useEffect } from "react";
import {
  X,
  ClipboardList,
  Building2,
  UserRound,
  FileText,
  CalendarDays,
} from "lucide-react";



import ApprovalProgress from "./ApprovalProgress";
import { BranchPermitStatus, BranchWorkingPermit } from "@repo/shared";

type Props = {
  permit: BranchWorkingPermit;
  onClose: () => void;
};

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

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(parsed);
}

export default function BranchWorkingDetailsModal({
  permit,
  onClose,
}: Props) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () =>
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [onClose]);

  const status =
    permit.ApprovalTable?.status ?? "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-permit-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Request Information
            </h3>
            <StatusBadge status={status} />
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
          </div>

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

          {/* REMARKS */}
          {permit.remarks && (
            <div className="border-t border-slate-200 pt-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Remarks
              </h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600">
                {permit.remarks}
              </p>
            </div>
          )}

          {/* ATTACHMENTS */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Attachments
            </h3>

            {permit.attachments.length === 0 ? (
              <p className="text-sm text-slate-400">
                No attachments available.
              </p>
            ) : (
              <div className="space-y-2">
                {permit.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <FileText
                      size={18}
                      className="text-indigo-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(file.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
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
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
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
