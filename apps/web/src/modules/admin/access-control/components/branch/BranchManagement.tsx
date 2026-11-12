
"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  GitBranch,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "sonner";

import type { DepartmentBranch } from "@repo/shared";

import {
  useDeleteDepartmentBranch,
  useDepartmentBranches,
} from "../../hooks/useDepartmentBranches";

import { DepartmentBranchModal } from "./DepartmentBranchModal";

type EntityType = "branches" | "departments";

export function BranchDepartmentManagement() {
  const [activeTab, setActiveTab] =
    useState<EntityType>("branches");

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] =
    useState<DepartmentBranch | null>(null);

  const [deleting, setDeleting] =
    useState<DepartmentBranch | null>(null);

  const isBranch = activeTab === "branches";

  // ==========================================
  // QUERIES
  // ==========================================

  const {
    data: entities = [],
    isLoading,
    isError,
    refetch,
  } = useDepartmentBranches({ isBranch });

  const deleteMutation = useDeleteDepartmentBranch();

  // ==========================================
  // FILTERING
  // ==========================================

  const filteredEntities = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return entities;

    return entities.filter((item) =>
      item.entityName
        .toLowerCase()
        .includes(keyword)
    );
  }, [entities, search]);

  // ==========================================
  // HANDLERS
  // ==========================================

  function handleTabChange(tab: EntityType) {
    setActiveTab(tab);
    setSearch("");
  }

  function handleAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleEdit(item: DepartmentBranch) {
    setEditing(item);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleConfirmDelete() {
    if (!deleting || deleteMutation.isPending) return;

    try {
      await deleteMutation.mutateAsync(deleting.id);

      toast.success(
        `${deleting.isBranch ? "Branch" : "Department"} deleted successfully`
      );

      setDeleting(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete record"
      );
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* TABS AND SEARCH */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleTabChange("branches")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                isBranch
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Branches
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("departments")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                !isBranch
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Departments
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={`Search ${activeTab}...`}
                className="w-60 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add {isBranch ? "Branch" : "Department"}
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">
                  Name
                </th>
                <th className="px-5 py-3 font-semibold">
                  Type
                </th>
                <th className="px-5 py-3 font-semibold">
                  Assigned Checker
                </th>
                <th className="px-5 py-3 font-semibold">
                  Created
                </th>
                <th className="px-5 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-600" />

                    <p className="text-sm text-slate-500">
                      Loading {activeTab}...
                    </p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />

                    <p className="text-sm text-red-600">
                      Failed to load {activeTab}.
                    </p>

                    <button
                      type="button"
                      onClick={() => void refetch()}
                      className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : filteredEntities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <GitBranch className="mx-auto mb-3 h-9 w-9 text-slate-300" />

                    <p className="font-medium text-slate-700">
                      No {activeTab} found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {search
                        ? "Try a different search keyword."
                        : `No ${activeTab} have been registered yet.`}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntities.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* NAME */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-slate-100 p-2">
                          <Building2 className="h-4 w-4 text-slate-600" />
                        </div>

                        <span className="font-medium text-slate-900">
                          {item.entityName}
                        </span>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.isBranch
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {item.isBranch
                          ? "Branch"
                          : "Department"}
                      </span>
                    </td>

                    {/* CHECKER */}
                    <td className="px-5 py-4 text-slate-600">
                      {item.checker?.name ??
                        (item.checkerId !== null
                          ? `User #${item.checkerId}`
                          : "Not assigned")}
                    </td>

                    {/* CREATED */}
                    <td className="px-5 py-4 text-slate-500">
                      {item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          aria-label={`Edit ${item.entityName}`}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
                          title="Delete"
                          aria-label={`Delete ${item.entityName}`}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
          {isLoading || isError
            ? "—"
            : `Showing ${filteredEntities.length} ${activeTab}`}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      <DepartmentBranchModal
        open={modalOpen}
        onClose={handleCloseModal}
        editing={editing}
        isBranch={editing?.isBranch ?? isBranch}
      />

      {/* DELETE CONFIRMATION */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3
                id="delete-title"
                className="text-lg font-semibold text-slate-900"
              >
                Delete {deleting.isBranch ? "Branch" : "Department"}
              </h3>

              <button
                type="button"
                onClick={() => setDeleting(null)}
                disabled={deleteMutation.isPending}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900">
                  {deleting.entityName}
                </span>
                ?
              </p>

              <p className="mt-2 text-sm text-red-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                disabled={deleteMutation.isPending}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
