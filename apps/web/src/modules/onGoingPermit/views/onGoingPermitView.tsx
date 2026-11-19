
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ClipboardList,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import { useMyApprovedPermits } from "../hooks/useOngoingPermit";

import { OngoingPermitSummary } from "../components/OngoingPermitSummary";
import { OngoingPermitCard } from "../components/OngoingPermitCard";
import { OngoingPermitDetails } from "../components/OngoingPermitDetails";
import { OngoingPermitPagination } from "../components/OngoingPermitPagination";
import { MyApprovedPermitFilters, OngoingPermit } from "@repo/shared";



const PAGE_SIZE = 4;

type StatusFilter = NonNullable<
  MyApprovedPermitFilters["status"]
>;

const FILTER_OPTIONS: {
  value: StatusFilter;
  label: string;
}[] = [
  { value: "ALL", label: "All Permits" },
  { value: "UNFINISHED", label: "Not Finished" },
  { value: "COMPLETED", label: "Completed" },
];

export default function OngoingPermitView() {
  // ==========================================
  // STATE
  // ==========================================

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("ALL");

  const [selectedPermit, setSelectedPermit] =
    useState<OngoingPermit | null>(null);

  // ==========================================
  // DEBOUNCED SEARCH
  // ==========================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  // ==========================================
  // API
  // ==========================================

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    isPlaceholderData,
    refetch,
  } = useMyApprovedPermits({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status,
  });

  const permits = response?.data ?? [];
  const pagination = response?.pagination;
  const summary = response?.summary;

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (
    value: StatusFilter
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage < 1 ||
      (pagination && newPage > pagination.totalPages)
    ) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="space-y-6">
      {/* SUMMARY */}
      <OngoingPermitSummary
        summary={summary}
        isLoading={isLoading}
      />

      {/* SEARCH AND FILTERS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Approved Permits
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor the progress and completion of working permits you have approved.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Search permits..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
              />
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  isFetching ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </div>
        </div>

        {/* STATUS FILTERS */}
        <div className="mt-5 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                handleStatusChange(option.value)
              }
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                status === option.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-slate-500">
          <Loader2
            size={22}
            className="animate-spin text-indigo-600"
          />
          <span className="text-sm">
            Loading approved permits...
          </span>
        </div>
      ) : isError ? (
        /* ERROR */
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-white p-6">
          <AlertCircle
            size={30}
            className="text-red-500"
          />

          <h3 className="font-semibold text-slate-800">
            Unable to load permits
          </h3>

          <p className="text-center text-sm text-slate-500">
            Something went wrong while retrieving your approved permits.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      ) : permits.length === 0 ? (
        /* EMPTY */
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <ClipboardList
            size={32}
            className="text-slate-300"
          />

          <h3 className="font-semibold text-slate-800">
            No permits found
          </h3>

          <p className="max-w-sm text-sm text-slate-500">
            {search || status !== "ALL"
              ? "No permits match your current search or status filter."
              : "You have not approved any working permits yet."}
          </p>
        </div>
      ) : (
        <>
          {/* CARD GRID */}
          <div
            className={`grid gap-4 xl:grid-cols-2 ${
              isFetching ? "opacity-70" : ""
            }`}
          >
            {permits.map((permit) => (
              <OngoingPermitCard
                key={permit.id}
                permit={permit}
                onView={setSelectedPermit}
              />
            ))}
          </div>

          {/* PAGINATION */}
          {pagination && (
            <OngoingPermitPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              isFetching={isFetching}
              isPlaceholderData={isPlaceholderData}
            />
          )}
        </>
      )}

      {/* DETAILS MODAL */}
      <OngoingPermitDetails
        permit={selectedPermit}
        onClose={() => setSelectedPermit(null)}
      />
    </section>
  );
}
