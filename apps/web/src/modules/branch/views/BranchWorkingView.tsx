
"use client";

import { useState } from "react";
import {
  ClipboardList,
  Clock3,
  Activity,
  CheckCircle2,
  Search,
  Eye,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { useBranchWorking } from "../hooks/useBranchWorking";


import BranchWorkingDetailsModal, {
  StatusBadge,
} from "../components/BranchWorkingDetailsModal";

import {
  getApprovalProgress,
} from "../components/ApprovalProgress";

const PAGE_SIZE = 10;

export default function BranchWorkingView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selectedPermitId, setSelectedPermitId] =
    useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useBranchWorking({
    page,
    limit: PAGE_SIZE,
    search,
  });

  const permits = data?.data ?? [];
  const pagination = data?.pagination;

  const selectedPermit =
    permits.find((item) => item.id === selectedPermitId) ??
    null;

  const totalPages = Math.max(
    pagination?.totalPages ?? 0,
    1
  );

  // Status counts below are for the current page.

const pending = permits.filter(
  (item) => item.status === "PENDING"
).length;

const inProgress = permits.filter(
  (item) => item.status === "IN_PROGRESS"
).length;

const completed = permits.filter(
  (item) => item.status === "COMPLETED"
).length;

  const summaryCards = [
    {
      label: "Total Requests",
      value: pagination?.total ?? 0,
      icon: ClipboardList,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Pending (This Page)",
      value: pending,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "In Progress (This Page)",
      value: inProgress,
      icon: Activity,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Completed (This Page)",
      value: completed,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <section className="space-y-5">
      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* REQUEST DIRECTORY */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Branch Working Permit Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {pagination?.total ?? 0} matching requests
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search working permits..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh requests"
              className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500">
            <Loader2
              size={20}
              className="animate-spin"
            />
            Loading working permits...
          </div>
        ) : isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <AlertCircle
              size={28}
              className="text-red-500"
            />

            <p className="text-sm text-slate-600">
              Failed to load branch requests.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Reference
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Work Type
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Requested By
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Checker
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    First Approver
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Final Approver
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Progress
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {permits.map((permit) => {
                 const approvals = permit.ApprovalTable ?? [];

                  const checker = approvals.find(
                    (item) => item.role === "CHECKER"
                  );

                  const firstApprover = approvals.find(
                    (item) => item.role === "FIRST_APPROVER"
                  );

                  const finalApprover = approvals.find(
                    (item) => item.role === "FINAL_APPROVER"
                  );

                  const progress = getApprovalProgress(permit);

                  return (
                    <tr
                      key={permit.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {permit.referenceNumber}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {permit.WorkerList.workerName}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {permit.requestedBy}
                      </td>

                        {/* CHECKER */}
                      <td className="px-5 py-4">
                        <StatusBadge status={checker?.status ?? "PENDING"} />
                      </td>

                      {/* FIRST APPROVER */}
                      <td className="px-5 py-4">
                        {permit.requestLevel === "LEVEL_1" ? (
                          <span className="text-sm text-slate-400">N/A</span>
                        ) : (
                          <StatusBadge
                            status={firstApprover?.status ?? "PENDING"}
                          />
                        )}
                      </td>

                      {/* FINAL APPROVER */}
                      <td className="px-5 py-4">
                        {finalApprover ? (
                          <StatusBadge status={finalApprover.status} />
                        ) : (
                          <span className="text-sm text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="min-w-28">
                          <div className="mb-1.5 flex justify-between text-xs">
                            <span className="text-slate-500">
                              Approval
                            </span>
                            <span className="font-semibold text-indigo-600">
                              {progress.percentage}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-600"
                              style={{
                                width: `${progress.percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={permit.status} />
                  </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPermitId(permit.id)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-50"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {permits.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      No working permit requests found
                      for your assigned branch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500">
            Showing {permits.length} of{" "}
            {pagination?.total ?? 0} matching requests
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((previous) => previous - 1)
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((previous) => previous + 1)
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {selectedPermit && (
        <BranchWorkingDetailsModal
          permit={selectedPermit}
          onClose={() => setSelectedPermitId(null)}
        />
      )}
    </section>
  );
}
