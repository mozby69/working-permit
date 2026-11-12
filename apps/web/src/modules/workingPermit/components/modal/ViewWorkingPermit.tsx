
"use client";

import type { WorkingPermitResponse } from "@repo/shared";
import {
    BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  Hash,
  Layers3,
  Paperclip,
  Save,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useApproveChecker } from "../../hooks/useWorkingPermit";

interface ViewWorkingPermitProps {
  permit: WorkingPermitResponse;
  onCancel: () => void;
  canApprove: boolean;
}

interface DetailFieldProps {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
}



function DetailField({
  label,
  value,
  icon,
}: DetailFieldProps) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon && (
          <span className="text-slate-400">{icon}</span>
        )}
        {label}
      </div>

      <p className="break-words text-sm font-semibold text-slate-800">
        {value === null || value === undefined || value === ""
          ? "Not specified"
          : value}
      </p>
    </div>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ViewWorkingPermit({
  permit,
}: ViewWorkingPermitProps) {

  const formattedDate = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(permit.date));


  const { mutate: approveChecker, isPending: isSaving } =
  useApproveChecker();

const handleApprove = () => {
  approveChecker(permit.id, {
    onSuccess: () => {
      onCancel();
    },
  });
};


  const firstApprover =
    permit.requestToWorker.firstApprover;

  const finalApprover =
    permit.requestToWorker.finalApprover;

  return (
    <div className="space-y-6 pb-2">
      {/* Reference header */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-white p-5 sm:p-6">
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
            label="Request Date"
            value={formattedDate}
            icon={<CalendarDays size={15} />}
          />

          <DetailField
            label="Request To"
            value={permit.requestTo}
            icon={<UsersRound size={15} />}
          />

          <DetailField
            label="Status"
            value={permit.approval.status}
            icon={<BadgeCheck size={15} />}
          />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <ClipboardList size={15} className="text-slate-400" />
            Purpose / Request Description
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
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
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              First Approver
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <UserRound size={17} />
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-800">
                  {firstApprover?.name ?? "Not assigned"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Primary approver
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Final Approver
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <UserRound size={17} />
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-800">
                  {finalApprover?.name ?? "Not assigned"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Final authorization
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Attachment */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          number="04"
          title="Attachment"
          description="Supporting document associated with the request."
        />

        <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
            <Paperclip size={18} />
          </div>

          <div className="min-w-0">
            <p className="break-all text-sm font-medium text-slate-700">
              {permit.attachment || "No attachment provided"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supporting file
            </p>
          </div>
        </div>
      </section>



       <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div></div>

        <div className="flex items-center justify-end gap-3">
            <button
            type="button"
        //   onClick={onCancel}
        //   disabled={isSaving}
            className="shadow inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
            Cancel
            </button>

            <button
            type="submit"
        //   disabled={isSaving || isReferenceLoading || isReferenceError}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 hover:cursor-pointer disabled:opacity-60"
            >
            
                <Save className="h-4 w-4" />
                        Approved

            </button>
        </div>
        </div>

    </div>
  );
}
