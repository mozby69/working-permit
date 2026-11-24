"use client";

import {
  Eye,
  Building2,
  UserRound,
  Layers3,
  MessageSquarePlus,
  Ban,
} from "lucide-react";

import {
  RejectApprovalStage,
  WorkingPermitResponse,
} from "@repo/shared";

import WorkingPermitStatusBadge from "./workingPermitStatusBadge";
import TableRowActions from "@/components/common/TableAction/DropdownAction";

interface Props {
  permit: WorkingPermitResponse;
  onView: (permit: WorkingPermitResponse) => void;
  onEdit: (permit: WorkingPermitResponse) => void;
  onAddRemark: (permit: WorkingPermitResponse) => void;
  onReject: (
    permit: WorkingPermitResponse,
    stage: RejectApprovalStage
  ) => void | Promise<void>;
  isRejecting: boolean;
}

export default function WorkingPermitMobileCard({
  permit,
  onView,
  onEdit,
  onAddRemark,
  onReject,
  isRejecting,
}: Props) {
  const checkerStatus =
    permit.approvals.find(
      (stage) => stage.role === "CHECKER"
    )?.status ?? "PENDING";

  const firstApproverStatus =
    permit.approvals.find(
      (stage) => stage.role === "FIRST_APPROVER"
    )?.status ?? "PENDING";

  const finalApproverStatus =
    permit.approvals.find(
      (stage) => stage.role === "FINAL_APPROVER"
    )?.status ?? "PENDING";

  const rejectStage: RejectApprovalStage | null =
    permit.canApproveChecker
      ? "CHECKER"
      : permit.canApproveFirstApprover
        ? "FIRST_APPROVER"
        : permit.canApproveFinalApprover
          ? "FINAL_APPROVER"
          : null;

  const canReject =
    permit.status === "PENDING" &&
    rejectStage !== null;

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Reference Number
          </p>

          <h3 className="mt-0.5 text-base font-bold text-slate-800">
            {permit.referenceNumber}
          </h3>
        </div>

        <WorkingPermitStatusBadge status={permit.status} />
      </div>

      {/* REQUEST INFORMATION */}
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <UserRound size={13} />
              Requested by
            </div>

            <p className="mt-1 break-words text-sm font-medium text-slate-800">
              {permit.requestedBy}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Layers3 size={13} />
              Request Level
            </div>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {permit.requestLevel.replaceAll("_", " ")}
            </p>
          </div>
        </div>

        {/* BRANCH */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 size={13} />
            Branch / Department
          </div>

          <p className="mt-1 break-words text-sm font-medium text-slate-800">
            {permit.branchDepartment.entityName}
          </p>
        </div>

        {/* FROM DEPARTMENT */}
        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            From Department
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-800">
            {permit.fromDepartment.entityName}
          </p>
        </div>

        {/* APPROVAL STATUS */}
        <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Approval Progress
          </h4>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600">
              Checker
            </span>

            <WorkingPermitStatusBadge
              status={checkerStatus}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600">
              Approver 1
            </span>

            {permit.requestLevel === "LEVEL_1" ? (
              <span className="inline-flex h-7 min-w-[80px] items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-3 text-[11px] font-semibold text-slate-500">
                N/A
              </span>
            ) : (
              <WorkingPermitStatusBadge
                status={firstApproverStatus}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600">
              Approver 2
            </span>

            <WorkingPermitStatusBadge
              status={finalApproverStatus}
            />
          </div>
        </div>
      </div>

      {/* CARD ACTIONS */}
      <div className="flex items-center gap-2 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => onView(permit)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 active:bg-indigo-200"
        >
          <Eye size={16} />
          View Details
        </button>

        <div className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200">
          <TableRowActions<WorkingPermitResponse>
            item={permit}
            viewLabel="View Request"
            onView={onView}
            editLabel="Edit Request"
            onEdit={
              permit.canEdit
                ? onEdit
                : undefined
            }
            customActions={[
              {
                key: "add-remark",
                label: "Add Remark",
                icon: MessageSquarePlus,
                hidden: !permit.canAddRemarks,
                onClick: onAddRemark,
              },
              {
                key: "reject-request",
                label: "Reject Request",
                icon: Ban,
                variant: "destructive",
                hidden: !canReject,
                disabled: isRejecting,
                onClick: (item) => {
                  if (!rejectStage) return;

                  void onReject(item, rejectStage);
                },
              },
            ]}
          />
        </div>
      </div>
    </article>
  );
}