
import { OngoingPermit, PermitStatus } from "@repo/shared";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  MessageSquareText,
  UserRound,
} from "lucide-react";


type Props = {
  permit: OngoingPermit;
  onView: (permit: OngoingPermit) => void;
};

const statusStyles: Record<PermitStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-indigo-50 text-indigo-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "Asia/Manila",
  }).format(date);
}

function getLatestRemark(permit: OngoingPermit) {
  return [...permit.remarksList].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  )[0];
}

function getCurrentSituation(permit: OngoingPermit) {
  const latestRemark = getLatestRemark(permit);

  if (permit.status === "COMPLETED") {
    return (
      latestRemark?.description ??
      "Work has been marked as completed."
    );
  }

  if (permit.status === "REJECTED") {
    const rejectedApproval = permit.ApprovalTable.find(
      (approval) => approval.status === "REJECTED"
    );

    return (
      rejectedApproval?.rejectRemarks ??
      "Permit was rejected. No rejection reason recorded."
    );
  }

  if (permit.status === "CANCELLED") {
    return (
      latestRemark?.description ??
      "Permit has been cancelled."
    );
  }

  if (permit.status === "PENDING") {
    const pendingApproval = [...permit.ApprovalTable]
      .sort((a, b) => a.sequence - b.sequence)
      .find((approval) => approval.status === "PENDING");

    if (pendingApproval) {
      return `Awaiting approval from ${pendingApproval.approver.name}.`;
    }

    return "Awaiting approval action.";
  }

  if (latestRemark) {
    return latestRemark.description;
  }

  if (permit.status === "APPROVED") {
    return "Permit approved. Work is not yet marked as completed.";
  }

  return "Work is ongoing. No delay reason has been recorded.";
}

export function OngoingPermitCard({
  permit,
  onView,
}: Props) {
  const latestRemark = getLatestRemark(permit);

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {permit.referenceNumber}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Building2 size={13} />
              {permit.branchDepartment.entityName}
            </span>

            <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
              {permit.WorkerList.workerName}
            </span>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[permit.status]}`}
        >
          {permit.status.replaceAll("_", " ")}
        </span>
      </div>

      {/* REQUEST */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Request Description
        </p>

        <p className="line-clamp-3 min-h-12 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {permit.requestFor}
        </p>
      </div>

      {/* REMARKS */}
      <div className="mt-4 flex-1 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <MessageSquareText
            size={16}
            className="text-indigo-500"
          />

          <p className="text-xs font-semibold text-slate-700">
            {permit.status === "COMPLETED"
              ? "Completion Information"
              : "Latest Remarks / Current Situation"}
          </p>
        </div>

        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {getCurrentSituation(permit)}
        </p>

        {latestRemark && (
          <p className="mt-3 text-xs text-slate-400">
            Latest remark by {latestRemark.createdBy.name}
            {" · "}
            {formatDate(latestRemark.createdAt)}
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <UserRound size={13} />
            Requested by{" "}
            <span className="font-medium text-slate-700">
              {permit.requestedBy}
            </span>
          </p>

          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays size={13} />
            {formatDate(permit.date)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onView(permit)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          View Details
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
