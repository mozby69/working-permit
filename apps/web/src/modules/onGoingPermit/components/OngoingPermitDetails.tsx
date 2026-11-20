
"use client";

import { useEffect } from "react";

import {
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  UserRound,
  Building2,
  CalendarDays,
  MessageSquareText,
  ClipboardCheck,
} from "lucide-react";
import { OngoingPermit, PermitStatus } from "@repo/shared";


type Props = {
  permit: OngoingPermit | null;
  onClose: () => void;
};

const statusStyles: Record<PermitStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-indigo-50 text-indigo-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(date);
}

export function OngoingPermitDetails({
  permit,
  onClose,
}: Props) {
  useEffect(() => {
    if (!permit) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [permit, onClose]);

  if (!permit) return null;

  const approvals = [...permit.ApprovalTable].sort(
    (a, b) => a.sequence - b.sequence
  );

  const remarks = [...permit.remarksList].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const approvedCount = approvals.filter(
    (item) =>
      item.status === "APPROVED" ||
      item.status === "COMPLETED"
  ).length;

  const approvalProgress = approvals.length
    ? Math.round((approvedCount / approvals.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ongoing-permit-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2
                id="ongoing-permit-title"
                className="text-xl font-bold text-slate-900"
              >
                {permit.referenceNumber}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[permit.status]}`}
              >
                {permit.status.replaceAll("_", " ")}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Working Permit Monitoring Details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close permit details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="space-y-7 overflow-y-auto px-5 py-6 sm:px-6">
          {/* REQUEST INFORMATION */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck
                size={18}
                className="text-indigo-600"
              />

              <h3 className="text-sm font-bold text-slate-900">
                Request Information
              </h3>
            </div>

            <div className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
              <InfoItem
                label="Work Type"
                value={permit.WorkerList.workerName}
              />

              <InfoItem
                label="Request Level"
                value={permit.requestLevel.replaceAll("_", " ")}
              />

              <InfoItem
                label="Branch"
                value={permit.branchDepartment.entityName}
                icon={<Building2 size={14} />}
              />

              <InfoItem
                label="From Department"
                value={permit.fromDepartment.entityName}
              />

              <InfoItem
                label="Requested By"
                value={permit.requestedBy}
                icon={<UserRound size={14} />}
              />

              <InfoItem
                label="Request Date"
                value={formatDate(permit.date)}
                icon={<CalendarDays size={14} />}
              />

              <InfoItem
                label="Checked By"
                value={permit.checkedBy ?? "—"}
              />

              <InfoItem
                label="Received By"
                value={permit.receivedBy?.name ?? "Not received"}
              />

              <InfoItem
                label="Received At"
                value={formatDate(permit.receivedAt)}
              />

              <InfoItem
                label="Last Updated"
                value={formatDate(permit.updatedAt)}
              />
            </div>
          </section>

          {/* REQUEST DESCRIPTION */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              What Was Requested?
            </h3>

            <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {permit.requestFor}
            </div>
          </section>

          {/* APPROVAL PROGRESS */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Approval Progress
              </h3>

              <span className="text-sm font-semibold text-indigo-600">
                {approvalProgress}%
              </span>
            </div>

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${approvalProgress}%`,
                }}
              />
            </div>

            {approvals.length === 0 ? (
              <p className="text-sm text-slate-500">
                No approval stages recorded.
              </p>
            ) : (
              <div className="space-y-4">
                {approvals.map((approval) => {
                  const isApproved =
                    approval.status === "APPROVED" ||
                    approval.status === "COMPLETED";

                  const isRejected =
                    approval.status === "REJECTED";

                  return (
                    <div
                      key={approval.id}
                      className="flex gap-3 rounded-lg border border-slate-200 p-4"
                    >
                      <div className="pt-0.5">
                        {isApproved ? (
                          <CheckCircle2
                            size={20}
                            className="text-emerald-600"
                          />
                        ) : isRejected ? (
                          <XCircle
                            size={20}
                            className="text-red-600"
                          />
                        ) : (
                          <Clock3
                            size={20}
                            className="text-amber-500"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {approval.role.replaceAll("_", " ")}
                          </p>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[approval.status]}`}
                          >
                            {approval.status.replaceAll("_", " ")}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {approval.approver.name}
                        </p>

                        {approval.approvedAt && (
                          <p className="mt-2 text-xs text-slate-400">
                            Approved:{" "}
                            {formatDate(approval.approvedAt)}
                          </p>
                        )}

                        {approval.rejectedAt && (
                          <p className="mt-2 text-xs text-red-500">
                            Rejected:{" "}
                            {formatDate(approval.rejectedAt)}
                          </p>
                        )}

                        {approval.rejectRemarks && (
                          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            <span className="font-semibold">
                              Rejection Reason:
                            </span>{" "}
                            {approval.rejectRemarks}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="mt-3 text-xs text-slate-400">
              Approval progress is separate from work completion.
            </p>
          </section>

          {/* REMARKS HISTORY */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareText
                size={18}
                className="text-indigo-600"
              />

              <h3 className="text-sm font-bold text-slate-900">
                Remarks History
              </h3>
            </div>

            {remarks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No remarks have been recorded for this permit.
              </div>
            ) : (
              <div className="space-y-3">
                {remarks.map((remark) => (
                  <div
                    key={remark.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {remark.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <UserRound size={13} />

                      <span className="font-medium text-slate-600">
                        {remark.createdBy.name}
                      </span>

                      <span>·</span>

                      <span>
                        {formatDate(remark.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
        {icon}
        {value}
      </p>
    </div>
  );
}
