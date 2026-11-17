
"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Pencil,
  Loader2,
  AlertCircle,
  Users,
  CalendarDays,
} from "lucide-react";

import type { WorkingType } from "@repo/shared";
import { useGetWorking } from "../../hooks/useWorking";
import { WorkingModal } from "./WorkingModal";

export default function WorkingManagement() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkingType | null>(
    null
  );

  // ==========================================
  // FETCH WORK TYPES
  // ==========================================

  const {
    data: workingTypes = [],
    isLoading,
    isError,
    refetch,
  } = useGetWorking();

  // ==========================================
  // FILTER WORK TYPES
  // ==========================================

  const filteredWorking = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return workingTypes;

    return workingTypes.filter((item) => {
      const workerName = item.workerName?.toLowerCase() ?? "";

      const firstApprover =
        item.firstApproverUser?.name?.toLowerCase() ?? "";

      const finalApprover =
        item.finalApproverUser?.name?.toLowerCase() ?? "";

      return (
        workerName.includes(keyword) ||
        firstApprover.includes(keyword) ||
        finalApprover.includes(keyword)
      );
    });
  }, [workingTypes, search]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalWorkTypes = workingTypes.length;

  const fullyAssigned = workingTypes.filter(
    (item) =>
      item.firstApproverUserId != null &&
      item.finalApproverUserId != null
  ).length;

  // ==========================================
  // MODAL HANDLERS
  // ==========================================

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: WorkingType) => {
    setEditing(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Manila",
    }).format(parsed);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="space-y-5">

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* TOTAL WORK TYPES */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Work Types
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {isLoading ? (
                  <Loader2
                    size={22}
                    className="animate-spin text-indigo-500"
                  />
                ) : (
                  totalWorkTypes
                )}
              </h2>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardList size={22} />
            </div>
          </div>
        </div>

        {/* FULLY ASSIGNED */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Fully Assigned
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {isLoading ? (
                  <Loader2
                    size={22}
                    className="animate-spin text-emerald-500"
                  />
                ) : (
                  fullyAssigned
                )}
              </h2>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          WORK TYPE DIRECTORY
      ====================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        {/* TABLE TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

          {/* TITLE */}
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Work Type Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredWorking.length} records found
            </p>
          </div>

          {/* SEARCH AND ADD BUTTON */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            {/* SEARCH */}
            <div className="relative w-full sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search work types..."
                aria-label="Search work types"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* ADD WORK TYPE */}
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus size={17} />
              Add Work Type
            </button>
          </div>
        </div>

        {/* ======================================
            TABLE CONTENT
        ====================================== */}

        {isLoading ? (

          /* LOADING */
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2
              size={24}
              className="animate-spin text-indigo-600"
            />

            <p className="text-sm">
              Loading work types...
            </p>
          </div>

        ) : isError ? (

          /* ERROR */
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="rounded-full bg-red-50 p-3">
              <AlertCircle
                size={24}
                className="text-red-500"
              />
            </div>

            <p className="text-sm text-slate-600">
              Failed to load work permit types.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
            >
              Try Again
            </button>
          </div>

        ) : (

          /* TABLE */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">

              {/* TABLE HEADER */}
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Work Type
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    First Approver
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Final Approver
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-slate-100">

                {filteredWorking.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >

                    {/* WORK TYPE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <ClipboardList size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {item.workerName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* FIRST APPROVER */}
                    <td className="px-5 py-4">
                      {item.firstApproverUser ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                            {item.firstApproverUser.name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>

                          <span className="font-medium text-slate-700">
                            {item.firstApproverUser.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    {/* FINAL APPROVER */}
                    <td className="px-5 py-4">
                      {item.finalApproverUser ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-600">
                            {item.finalApproverUser.name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>

                          <span className="font-medium text-slate-700">
                            {item.finalApproverUser.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    {/* CREATED DATE */}
                    <td className="px-5 py-4 text-slate-500">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap">
                        <CalendarDays
                          size={15}
                          className="text-slate-400"
                        />

                        {formatDate(item.createdAt)}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}
                {filteredWorking.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

                        <div className="mb-4 rounded-full bg-slate-100 p-4">
                          <ClipboardList
                            size={25}
                            className="text-slate-400"
                          />
                        </div>

                        <h3 className="text-sm font-semibold text-slate-800">
                          {search
                            ? "No matching work types"
                            : "No work permit types yet"}
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                          {search
                            ? "Try searching with a different keyword."
                            : "Create your first work permit type to configure its approval workflow."}
                        </p>

                        {!search && (
                          <button
                            type="button"
                            onClick={openCreate}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <Plus size={16} />
                            Create Work Type
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================
          CREATE / EDIT MODAL
      ====================================== */}

      <WorkingModal
        open={modalOpen}
        onClose={closeModal}
        editing={editing}
      />
    </section>
  );
}
