
"use client";

import type { Role } from "@repo/shared";
import {
  Shield,
  ShieldCheck,
  Pencil,
  LockKeyhole,
} from "lucide-react";

type RoleTableProps = {
  roles: Role[];
  onEdit: (role: Role) => void;
};

export function RoleTable({
  roles,
  onEdit,
}: RoleTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left">
          {/* TABLE HEADER */}
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Role
              </th>

              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </th>

              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Permissions
              </th>

              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => {
              const permissionCount =
                role.permissions.length;

              const isAdmin =
                role.name.toUpperCase() === "ADMIN";

              return (
                <tr
                  key={role.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  {/* ROLE */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isAdmin
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isAdmin ? (
                          <ShieldCheck className="h-5 w-5" />
                        ) : (
                          <Shield className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {role.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          System role
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* DESCRIPTION */}
                  <td className="px-5 py-4">
                    <p className="max-w-sm text-sm text-slate-600">
                      {role.description || (
                        <span className="italic text-slate-400">
                          No description provided
                        </span>
                      )}
                    </p>
                  </td>

                  {/* PERMISSIONS */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        permissionCount > 0
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                          : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200"
                      }`}
                    >
                      <LockKeyhole className="h-3.5 w-3.5" />

                      {permissionCount}{" "}
                      {permissionCount === 1
                        ? "Permission"
                        : "Permissions"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(role)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Role
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* EMPTY STATE */}
        {roles.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4">
              <Shield className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900">
              No roles found
            </h3>

            <p className="mt-1 max-w-xs text-sm text-slate-500">
              No system roles are available yet.
              Create a role to start managing access.
            </p>
          </div>
        )}
      </div>

      {/* TABLE FOOTER */}
      {roles.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {roles.length}
            </span>{" "}
            {roles.length === 1 ? "role" : "roles"}
          </p>
        </div>
      )}
    </div>
  );
}
