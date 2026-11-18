
"use client";

import {
  CheckCircle2,
  Clock3,
  XCircle,
  Circle,
} from "lucide-react";

import type {
  BranchWorkingPermit,
  BranchPermitStatus,
} from "@repo/shared";

type Props = {
  permit: BranchWorkingPermit;
};

const roleLabels: Record<string, string> = {
  CHECKER: "Checker",
  FIRST_APPROVER: "First Approver",
  FINAL_APPROVER: "Final Approver",
  TROUBLESHOOTER: "Troubleshooter",
};

export function getApprovalProgress(
  permit: BranchWorkingPermit
) {
  const approvals = [...(permit.ApprovalTable ?? [])]
    .sort((a, b) => a.sequence - b.sequence);

  const totalStages = approvals.length;

  const completedStages = approvals.filter(
    (approval) => approval.status === "APPROVED"
  ).length;

  const percentage =
    totalStages === 0
      ? 0
      : Math.round(
          (completedStages / totalStages) * 100
        );

  const currentStage = approvals.find(
    (approval) =>
      approval.status === "PENDING" ||
      approval.status === "IN_PROGRESS"
  );

  return {
    percentage,
    totalStages,
    completedStages,
    currentStage: currentStage ?? null,
    isCompleted:
      totalStages > 0 &&
      completedStages === totalStages,
  };
}

function getStatusIcon(status: BranchPermitStatus) {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return (
        <CheckCircle2
          size={18}
          className="text-emerald-600"
        />
      );

    case "REJECTED":
    case "CANCELLED":
      return (
        <XCircle
          size={18}
          className="text-red-500"
        />
      );

    case "IN_PROGRESS":
      return (
        <Clock3
          size={18}
          className="text-blue-600"
        />
      );

    default:
      return (
        <Circle
          size={18}
          className="text-slate-400"
        />
      );
  }
}

function formatApprovalDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export default function ApprovalProgress({
  permit,
}: Props) {
  const approvals = [...(permit.ApprovalTable ?? [])]
    .sort((a, b) => a.sequence - b.sequence);

  const progress = getApprovalProgress(permit);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Approval Progress
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {progress.completedStages} of{" "}
            {progress.totalStages} approval stages completed
          </p>
        </div>

        <span className="text-sm font-semibold text-indigo-600">
          {progress.percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{
            width: `${progress.percentage}%`,
          }}
        />
      </div>

      {approvals.length === 0 ? (
        <p className="text-sm text-slate-500">
          No approval records available.
        </p>
      ) : (
        <div className="space-y-0">
          {approvals.map((approval, index) => (
            <div
              key={approval.id}
              className="relative flex gap-3 pb-6 last:pb-0"
            >
              {index < approvals.length - 1 && (
                <div className="absolute left-[9px] top-6 bottom-0 w-px bg-slate-200" />
              )}

              <div className="relative z-10 mt-0.5 bg-white">
                {getStatusIcon(approval.status)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    {roleLabels[approval.role] ??
                      approval.role.replaceAll("_", " ")}
                  </p>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      approval.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : approval.status === "REJECTED"
                          ? "bg-red-50 text-red-700"
                          : approval.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {approval.status.replaceAll("_", " ")}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {approval.approver?.name ?? "Not assigned"}
                </p>

                {approval.approvedAt && (
                  <p className="mt-1 text-xs text-slate-400">
                    {formatApprovalDate(approval.approvedAt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
