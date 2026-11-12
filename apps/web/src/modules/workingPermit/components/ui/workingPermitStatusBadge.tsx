import type { WorkingPermitResponse } from "@repo/shared";

type WorkingPermitStatus =
  WorkingPermitResponse["approval"]["status"];

interface WorkingPermitStatusBadgeProps {
  status: WorkingPermitStatus;
}

const statusStyles: Record<WorkingPermitStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  APPROVED: "bg-blue-100 text-blue-700 ring-blue-200",
  REJECTED: "bg-red-100 text-red-700 ring-red-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  COMPLETED: "bg-green-100 text-green-700 ring-green-200",
};

const dotStyles: Record<WorkingPermitStatus, string> = {
  PENDING: "bg-amber-500",
  APPROVED: "bg-blue-500",
  REJECTED: "bg-red-500",
  IN_PROGRESS: "bg-indigo-500",
  COMPLETED: "bg-green-500",
};

export default function WorkingPermitStatusBadge({
  status,
}: WorkingPermitStatusBadgeProps) {
  const label = status.replaceAll("_", " ");

  return (
    <span
      className={`
        inline-flex w-fit items-center gap-2
        whitespace-nowrap rounded-full
        px-3 py-1.5
        text-[11px] font-semibold
        ring-1 ring-inset
        ${statusStyles[status]}
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 shrink-0 rounded-full
          ${dotStyles[status]}
        `}
      />

      {label}
    </span>
  );
}