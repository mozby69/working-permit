
"use client";

import { MyApprovedPermitPagination } from "@repo/shared";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";



type Props = {
  pagination: MyApprovedPermitPagination;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  isPlaceholderData?: boolean;
};

export function OngoingPermitPagination({
  pagination,
  onPageChange,
  isFetching = false,
  isPlaceholderData = false,
}: Props) {
  const {
    page,
    limit,
    total,
    totalPages,
  } = pagination;

  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const canPrevious = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-900">
          {start}
        </span>
        {" - "}
        <span className="font-semibold text-slate-900">
          {end}
        </span>
        {" of "}
        <span className="font-semibold text-slate-900">
          {total}
        </span>
        {" permits"}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrevious || isFetching}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span className="px-2 text-sm text-slate-600">
          Page{" "}
          <span className="font-semibold text-slate-900">
            {page}
          </span>
          {" of "}
          {totalPages}
        </span>

        <button
          type="button"
          disabled={
            !canNext ||
            isFetching ||
            isPlaceholderData
          }
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
