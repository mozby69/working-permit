
"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  GitBranch,
  Plus,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useDepartmentBranches } from "../../hooks/useDepartmentBranches";


type EntityType = "branches" | "departments";

export function BranchDepartmentManagement() {
  const [activeTab, setActiveTab] =
    useState<EntityType>("branches");

  const [search, setSearch] = useState("");

  const isBranch = activeTab === "branches";

  const {
    data: entities = [],
    isLoading,
    isError,
    refetch,
  } = useDepartmentBranches({ isBranch });

  const filteredEntities = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return entities;

    return entities.filter((item) =>
      item.entity_name.toLowerCase().includes(keyword)
    );
  }, [entities, search]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* TABS AND SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("branches");
              setSearch("");
            }}
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
            onClick={() => {
              setActiveTab("departments");
              setSearch("");
            }}
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
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-60 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Connect this to your Add modal when implemented */}
          <button
            type="button"
            disabled
            title="Add form not yet implemented"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                Checker ID
              </th>
              <th className="px-5 py-3 font-semibold">
                Created
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-14 text-center">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-600" />
                  <p className="text-sm text-slate-500">
                    Loading {activeTab}...
                  </p>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={4} className="py-14 text-center">
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
                <td colSpan={4} className="py-14 text-center">
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
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2">
                        <Building2 className="h-4 w-4 text-slate-600" />
                      </div>

                      <span className="font-medium text-slate-900">
                        {item.entity_name}
                      </span>
                    </div>
                  </td>

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

                  <td className="px-5 py-4 text-slate-600">
                    {item.checkerId ?? "Not assigned"}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString(
                          "en-PH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "—"}
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
  );
}
