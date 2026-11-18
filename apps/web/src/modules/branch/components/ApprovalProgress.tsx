
"use client";

import { BranchPermitStatus, BranchWorkingPermit } from "@repo/shared";
import {
  CheckCircle2,
  Clock3,
  Circle,
  XCircle,
  Ban,
} from "lucide-react";



type Props = {
  permit: BranchWorkingPermit;
};

type Stage = {
  label: string;
  name: string | null;
  status: BranchPermitStatus;
  date: string | null;
};

const isApproved = (status: BranchPermitStatus) =>
  status === "APPROVED" || status === "COMPLETED";

const isStopped = (status: BranchPermitStatus) =>
  status === "REJECTED" || status === "CANCELLED";

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(date);
}


export function getApprovalProgress(
  permit: BranchWorkingPermit
) {
  // Get first approval record from array
  const approval = permit.ApprovalTable?.[0] ?? null;

  const hasFinal =
    permit.WorkerList.finalApproverUser != null;

  const stages: Stage[] = [
    {
      label: "Checker",
      name: permit.checkedBy,
      status: approval?.checkedStatus ?? "PENDING",
      date: approval?.checkedStatusAt ?? null,
    },
    {
      label: "First Approver",
      name:
        permit.WorkerList.firstApproverUser?.name ??
        null,
      status:
        approval?.firstApproverStatus ?? "PENDING",
      date:
        approval?.firstApproverApprovedAt ?? null,
    },
  ];

  if (hasFinal) {
    stages.push({
      label: "Final Approver",
      name:
        permit.WorkerList.finalApproverUser?.name ??
        null,
      status:
        approval?.finalApproverStatus ?? "PENDING",
      date:
        approval?.finalApproverApprovedAt ?? null,
    });
  }

  const completed = stages.filter((stage) =>
    isApproved(stage.status)
  ).length;

  const totalStages = stages.length;

  const percentage =
    totalStages > 0
      ? Math.round((completed / totalStages) * 100)
      : 0;

  const overallStatus =
    approval?.status ?? "PENDING";

  const stopped =
    isStopped(overallStatus) ||
    stages.some((stage) => isStopped(stage.status));

  const currentIndex = stopped
    ? -1
    : stages.findIndex(
        (stage) => !isApproved(stage.status)
      );

  return {
    stages,
    completed,
    totalStages,
    percentage,
    stopped,
    currentIndex,
    overallStatus,
  };
}


export default function ApprovalProgress({
  permit,
}: Props) {
  const progress = getApprovalProgress(permit);

  

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Approval Progress
          </h3>

          <span className="text-sm font-semibold text-indigo-600">
            {progress.percentage}%
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{
              width: `${progress.percentage}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {progress.completed} of{" "}
          {progress.stages.length} approval stages
          completed
        </p>
      </div>

      <div className="space-y-4">
        {progress.stages.map((stage, index) => {
          const approved = isApproved(stage.status);
          const rejected = isStopped(stage.status);

          const active =
            !progress.stopped &&
            index === progress.currentIndex &&
            !approved;

          const waiting =
            !approved &&
            !rejected &&
            !active;

          const displayStatus = approved
            ? "Approved"
            : rejected
              ? stage.status === "REJECTED"
                ? "Rejected"
                : "Cancelled"
              : progress.stopped
                ? "Stopped"
                : active
                  ? stage.status === "IN_PROGRESS"
                    ? "In progress"
                    : "Awaiting approval"
                  : "Waiting";

          return (
            <div
              key={stage.label}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5">
                {approved ? (
                  <CheckCircle2
                    size={22}
                    className="text-emerald-600"
                  />
                ) : rejected ? (
                  <XCircle
                    size={22}
                    className="text-red-600"
                  />
                ) : progress.stopped ? (
                  <Ban
                    size={22}
                    className="text-slate-400"
                  />
                ) : active ? (
                  <Clock3
                    size={22}
                    className="text-amber-500"
                  />
                ) : (
                  <Circle
                    size={22}
                    className="text-slate-300"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {stage.label}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {stage.name ?? "Not assigned"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {displayStatus}
                </p>

                {stage.date && (
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(stage.date)}
                  </p>
                )}
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  approved
                    ? "bg-emerald-50 text-emerald-700"
                    : rejected
                      ? "bg-red-50 text-red-700"
                      : active
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                }`}
              >
                {waiting && !progress.stopped
                  ? "WAITING"
                  : displayStatus.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {progress.stopped && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          The approval process has been stopped
          because the request was rejected or cancelled.
        </div>
      )}
    </div>
  );
}
