
"use client";

import type { ApprovalStage, WorkingPermitResponse } from "@repo/shared";
import {
    BadgeCheck,
  Building2,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  ClipboardType,
  FileText,
  Hash,
  ImageIcon,
  Inbox,
  Loader2,
  MessageSquareText,
  MessageSquareWarning,
  UserRound,
  UsersRound,
} from "lucide-react";

import toast from "react-hot-toast";
import { DetailField, SectionHeading } from "../../helper/wp.helper";
import { useApproveWorkingPermit, useCompleteWorkingPermit, useReceiveWorkingPermit } from "../../hooks/useWorkingPermit";
import AttachmentPreview from "../ui/attachmentPreview";
import { formatDateTime } from "@/utils/format-date";


interface ViewWorkingPermitProps {
  permit: WorkingPermitResponse;
  onCancel: () => void;
}



export default function ViewWorkingPermit({permit,onCancel}: ViewWorkingPermitProps) {

  const {
  mutate: receivePermit,
  isPending: isReceiving,
  } = useReceiveWorkingPermit();

  const {
    mutate: completePermit,
    isPending: isCompleting,
  } = useCompleteWorkingPermit();


  const {
    mutate: approvePermit,
    isPending: isSaving,
    } = useApproveWorkingPermit();

  // const formattedDate = new Intl.DateTimeFormat("en-PH", {
  //   timeZone: "Asia/Manila",
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // }).format(new Date(permit.date));



  const approvalStage: ApprovalStage | null =
    permit.canApproveChecker
      ? "CHECKER"
      : permit.canApproveFinalApprover
        ? "FINAL_APPROVER"
        : permit.canApproveFirstApprover
          ? "FIRST_APPROVER"
          : null;


    const handleApprove = () => {
    if (!approvalStage || isSaving) return;

    approvePermit(
        {
        workingPermitId: permit.id,
        stage: approvalStage,
        },
        {
        onSuccess: () => {
            toast.success("Working Permit approved successfully!");
            onCancel();
        },
        onError: () => {
            toast.error("Failed to approve Working Permit.");
        },
        }
    );
    };



  const firstApprover = permit.requestToWorker.firstApprover;

  const finalApprover = permit.requestToWorker.finalApprover;

  const isProcessing =isSaving || isReceiving || isCompleting;


  const handleReceive = () => {
  if (!permit.canReceiveTroubleshooter || isProcessing) {
    return;
  }

  receivePermit(
    { workingPermitId: permit.id },
    {
      onSuccess: () => {
        toast.success("Working Permit received successfully!");
        onCancel();
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to receive Working Permit."
        );
      },
    }
  );
};




const handleComplete = () => {
  if (!permit.canCompleteTroubleshooter || isProcessing) {
    return;
  }

  completePermit(
    { workingPermitId: permit.id },
    {
      onSuccess: () => {
        toast.success("Working Permit completed successfully!");
        onCancel();
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to complete Working Permit."
        );
      },
    }
  );
};


const approverOrder =
  permit.requestLevel === "LEVEL_2"
    ? [
        {
          label: "First Approver",
          name: firstApprover?.name ?? "Not assigned",
          description: "Approval stage 2",
        },
        {
          label: "Final Approver",
          name: finalApprover?.name ?? "Not assigned",
          description: "Approval stage 3",
        },
      ]
    : [
        {
          label: "Final Approver",
          name: finalApprover?.name ?? "Not assigned",
          description: "Approval stage 2",
        },
      ];



      const formatApprovalDate = (date: string | null): string => {
        if (!date) return "-";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
          return "-";
        }

        return new Intl.DateTimeFormat("en-PH", {
          timeZone: "Asia/Manila",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(parsed);
      };


  return (
    <div className="space-y-6 pb-2">
      {/* Reference header */}
      <div className="rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50 via-white to-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <FileText size={21} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500">
                Working Permit Reference
              </p>
              <h2 className="mt-1 break-all text-2xl font-bold tracking-tight text-slate-900">
                {permit.referenceNumber}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Request information and assignment details
              </p>
            </div>
          </div>

          <div className="self-start rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Request Level
            </p>
            <p className="mt-1 text-sm font-bold text-indigo-700">
              {permit.requestLevel.replaceAll("_", " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Request details */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          number="01"
          title="Request Information"
          description="Basic details of the submitted working permit."
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailField
            label="Reference Number"
            value={permit.referenceNumber}
            icon={<Hash size={15} />}
          />

          <DetailField
            label="Date / Time Requested"
            value={formatDateTime(permit.createdAt)}
            icon={<CalendarDays size={15} />}
          />

          <DetailField
            label="Request To"
            value={permit.requestTo}
            icon={<UsersRound size={15} />}
          />

          <DetailField
            label="Status"
            value={permit.status}
            icon={<BadgeCheck size={15} />}
          />

          <DetailField
            label="Request Type"
            value={permit.requestType?.description ?? "Not specified"}
            icon={<ClipboardType size={15} />}
          />

            <DetailField
            label="Date / Time Done"
            value={formatDateTime(permit.statusAt) ?? "N/A"}
            icon={<ClipboardType size={15} />}
          />
                    
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <ClipboardList size={15} className="text-slate-400" />
            Purpose / Request Description
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="whitespace-pre-wrap wrap-break text-sm leading-7 text-slate-700">
              {permit.requestFor}
            </p>
          </div>
        </div>
      </section>

      {/* Department details */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          number="02"
          title="Department & Branch"
          description="Originating department and selected branch."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <DetailField
              label="From Department"
              value={permit.fromDepartment.entityName}
              icon={<Building2 size={15} />}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <DetailField
              label="Branch / Department"
              value={permit.branchDepartment.entityName}
              icon={<Building2 size={15} />}
            />
          </div>
        </div>
      </section>

      {/* People */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          number="03"
          title="Personnel & Assignments"
          description="People associated with this working permit."
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailField
            label="Requested By"
            value={permit.requestedBy}
            icon={<UserRound size={15} />}
          />

          <DetailField
            label="Checked By"
            value={permit.checkedBy}
            icon={<UserRound size={15} />}
          />
        </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
        {approverOrder.map((approver) => (
          <div
            key={approver.label}
            className="rounded-lg border border-slate-200 p-4"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {approver.label}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <UserRound size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {approver.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {approver.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      </section>

      {/* Assigned approval steps */}
   <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
  <SectionHeading
    number="04"
    title="Approval History"
    description="Assigned approvers, approval status and rejection remarks."
  />

  <div className="space-y-3">
    {permit.approvals.map((step) => {
      const isApproved = step.status === "APPROVED";
      const isRejected = step.status === "REJECTED";

      const statusClass = isApproved
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : isRejected
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

      const dotClass = isApproved
        ? "bg-blue-500"
        : isRejected
          ? "bg-red-500"
          : "bg-amber-500";

      return (
        <div
          key={step.id}
          className={`rounded-lg border p-4 ${
            isRejected
              ? "border-red-200 bg-red-50/40"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          {/* APPROVAL INFORMATION */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* SEQUENCE NUMBER */}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isRejected
                    ? "bg-red-100 text-red-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {step.sequence}
              </span>

              {/* APPROVER DETAILS */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {step.role.replaceAll("_", " ")}
                </p>

                <p className="text-xs text-slate-600">
                  {step.approverName}
                </p>

                {/* APPROVAL OR REJECTION DATE */}
                <p
                  className={`mt-1 text-xs ${
                    isRejected
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  {isRejected
                    ? step.rejectedAt
                      ? `Rejected on ${formatApprovalDate(
                          step.rejectedAt
                        )}`
                      : "Request rejected"
                    : isApproved
                      ? step.approvedAt
                        ? formatApprovalDate(step.approvedAt)
                        : "Request approved"
                      : "Awaiting approval"}
                </p>
              </div>
            </div>

            {/* STATUS BADGE */}
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
              />

              {step.status}
            </span>
          </div>

          {/* REJECTION REMARKS */}
          {isRejected && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3.5 sm:ml-11">
              <div className="flex items-center gap-2">
                <MessageSquareWarning
                  size={15}
                  className="shrink-0 text-red-600"
                />

                <h4 className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Rejection Remarks
                </h4>
              </div>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-red-900">
                {step.rejectRemarks?.trim() ||
                  "No rejection remarks provided."}
              </p>
            </div>
          )}
        </div>
      );
    })}
  </div>
</section>

      {/* Attachment */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          number="05"
          title="Supporting Documents"
          description="Click an image to view it in full size."
        />

        {permit.attachments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {permit.attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                permitId={permit.id}
                attachment={attachment}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <ImageIcon className="mx-auto mb-3 h-7 w-7 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">
              No attachments available
            </p>
            <p className="mt-1 text-xs text-slate-500">
              No supporting documents were uploaded for this request.
            </p>
          </div>
        )}
      </section>





{/* TROUBLESHOOTER REMARKS */}
<section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
  <SectionHeading
    number="05"
    title="Troubleshooter Remarks"
    description="Progress updates, explanations, and remarks history."
  />

  {permit.remarksList.length > 0 ? (
    <div className="space-y-3">
      {permit.remarksList.map((remark, index) => {
        const remarkDate = new Intl.DateTimeFormat("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date(remark.createdAt));

        return (
          <div
            key={remark.id}
            className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-4"
          >
       
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <MessageSquareText size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {remark.createdBy.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Remark #{permit.remarksList.length - index}
                  </p>
                </div>
              </div>

          
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                <CalendarDays size={13} className="text-slate-400" />

                <span className="text-xs font-medium text-slate-600">
                  {remarkDate}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-white px-4 py-3">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {remark.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        <MessageSquareText size={21} />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        No remarks available
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Troubleshooter progress updates will appear here.
      </p>
    </div>
  )}
</section>



     <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div />

        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* CLOSE */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>

          {/* CHECKER / FIRST APPROVER / FINAL APPROVER */}
          {approvalStage !== null && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={isProcessing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BadgeCheck className="h-4 w-4" />
              )}

              {isSaving
                ? "Approving..."
                : approvalStage === "CHECKER"
                  ? "Approve as Checker"
                  : approvalStage === "FIRST_APPROVER"
                    ? "Approve as First Approver"
                    : "Approve as Final Approver"}
            </button>
          )}

          {/* TROUBLESHOOTER - RECEIVE */}
          {permit.canReceiveTroubleshooter && (
            <button
              type="button"
              onClick={handleReceive}
              disabled={isProcessing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isReceiving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Inbox className="h-4 w-4" />
              )}

              {isReceiving ? "Receiving..." : "Receive Request"}
            </button>
          )}

          {/* TROUBLESHOOTER - COMPLETE */}
          {permit.canCompleteTroubleshooter && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isProcessing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCompleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}

              {isCompleting ? "Completing..." : "Mark as Completed"}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}