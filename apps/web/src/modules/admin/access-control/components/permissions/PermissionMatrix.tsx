
"use client";

import { useMemo, useState } from "react";
import type { Permission, Role } from "@repo/shared";
import {
  KeyRound,
  ShieldCheck,
  Check,
  Search,
} from "lucide-react";

type PermissionMatrixProps = {
  roles: Role[];
  permissions: Permission[];
  onChange: (
    roleId: number,
    permissionId: number,
    checked: boolean
  ) => void;
};

export function PermissionMatrix({
  roles,
  permissions,
  onChange,
}: PermissionMatrixProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<
    number | null
  >(null);

  const [search, setSearch] = useState("");

  // Use a valid role even when roles load asynchronously.
  const activeRoleId = roles.some(
    (role) => role.id === selectedRoleId
  )
    ? selectedRoleId
    : (roles[0]?.id ?? null);

  const selectedRole = roles.find(
    (role) => role.id === activeRoleId
  );

  // Assigned permission IDs for the selected role.
  const assignedPermissionIds = useMemo(
    () =>
      new Set(
        selectedRole?.permissions.map(
          (permission) => permission.id
        ) ?? []
      ),
    [selectedRole]
  );

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return permissions;

    return permissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(query) ||
        permission.code.toLowerCase().includes(query)
    );
  }, [permissions, search]);

  const assignedCount = assignedPermissionIds.size;

  const handleRoleSelect = (roleId: number) => {
    setSelectedRoleId(roleId);
    setSearch("");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2.5">
            <KeyRound className="h-5 w-5 text-slate-600" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              User Roles Configuration
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Configure permissions for each system role.
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          {roles.length} system roles
        </span>
      </div>

      {/* MASTER DETAIL LAYOUT */}
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* LEFT: ROLES */}
        <aside className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <div className="mb-3 flex items-center justify-between px-2">
            <h4 className="text-sm font-semibold text-slate-800">
              Roles
            </h4>
            <span className="text-xs text-slate-500">
              {roles.length}
            </span>
          </div>

          <div className="max-h-137.5 space-y-1 overflow-y-auto">
            {roles.map((role) => {
              const isActive = activeRoleId === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-blue-600 font-medium text-white"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <span className="truncate">{role.name}</span>

                  {isActive && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {roles.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-slate-500">
              No roles available.
            </p>
          )}
        </aside>

        {/* RIGHT: PERMISSIONS */}
        <section className="min-w-0 rounded-lg border border-slate-200">
          {selectedRole ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-slate-900">
                      Permissions — {selectedRole.name}
                    </h4>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {assignedCount} of {permissions.length} permissions assigned
                  </p>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search permissions..."
                    className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* PERMISSION CHECKBOXES */}
              <div className="max-h-120 overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredPermissions.map((permission) => {
                    const checked =
                      assignedPermissionIds.has(permission.id);

                    return (
                      <label
                        key={permission.id}
                        className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            onChange(
                              selectedRole.id,
                              permission.id,
                              event.target.checked
                            )
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                        />

                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-700">
                            {permission.name}
                          </span>

                          <span className="block break-all font-mono text-[11px] text-slate-400">
                            {permission.code}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {filteredPermissions.length === 0 && (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No matching permissions found.
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  {assignedCount} assigned permissions
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Changes are saved when updated
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-75 items-center justify-center text-sm text-slate-500">
              Select a role to view its permissions.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
