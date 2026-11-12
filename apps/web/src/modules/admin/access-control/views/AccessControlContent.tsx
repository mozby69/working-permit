
"use client";

import { useState } from "react";
import {
  Users,
  ShieldCheck,
  KeyRound,
  Plus,
  ChevronRight,
  Settings2,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import PermissionGuard from "@/components/guards/PermissionGuard";

import { UserTable } from "../components/users/UserTable";
import { RoleTable } from "../components/roles/RoleTable";
import { PermissionMatrix } from "../components/permissions/PermissionMatrix";

import type {
  Tab,
  AccessControlContentProps,
} from "../types/access-control.types";
import { BranchDepartmentManagement } from "../components/branch/BranchManagement";

export function AccessControlContent({
  users,
  roles,
  permissions,
  usersLoading = false,
  userSearch,
  userLimit,
  userPagination,
  onUserSearchChange,
  onUserLimitChange,
  onUserPageChange,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onCreateRole,
  onEditRole,
  onPermissionChange,
}: AccessControlContentProps) {
  const [tab, setTab] = useState<Tab>("users");

  const tabs = [
    {
      id: "users",
      label: "Users",
      icon: Users,
      description: "Manage system users and access",
    },
    {
      id: "roles",
      label: "Roles",
      icon: ShieldCheck,
      description: "Configure roles and responsibilities",
    },
    {
      id: "permissions",
      label: "Permissions",
      icon: KeyRound,
      description: "Control role-based access",
    },
    {
      id: "branch",
      label: "Branch & Department Management",
      icon: Building2,
      description: "Manage organizational branches and departments.",
    },
  ] as const;

  const activeTab = tabs.find((item) => item.id === tab);

  return (
    <section className="min-h-screen space-y-6 bg-slate-50/70">
      {/* PAGE HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <Settings2 className="h-6 w-6 text-slate-700" />
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Administration</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-600">
                Access Control
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Access Control
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage users, configure roles, and control
              system permissions.
            </p>
          </div>
        </div>
      </header>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Users on Page"
          value={users.length}
          icon={Users}
          description="Currently loaded users"
        />

        <SummaryCard
          title="System Roles"
          value={roles.length}
          icon={ShieldCheck}
          description="Configured access roles"
        />

        <SummaryCard
          title="Permissions"
          value={permissions.length}
          icon={KeyRound}
          description="Available system permissions"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* TABS */}
        <div className="border-b border-slate-200 px-5 pt-4 sm:px-6">
          <nav
            aria-label="Access control sections"
            className="flex gap-6 overflow-x-auto"
          >
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex shrink-0 items-center gap-2",
                    "border-b-2 px-1 pb-4 pt-2",
                    "text-sm font-medium transition-colors",
                    active
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECTION HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {activeTab?.label}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {activeTab?.description}
            </p>
          </div>

          {tab === "roles" && (
            <PermissionGuard permissions={["ADMIN_MANAGE"]}>
              <Button
                type="button"
                onClick={onCreateRole}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </PermissionGuard>
          )}
        </div>

        {/* TAB CONTENT */}
        <div className="p-5 sm:p-6">
          {tab === "users" && (
            <UserTable
              users={users}
              usersLoading={usersLoading}
              search={userSearch}
              onSearchChange={onUserSearchChange}
              limit={userLimit}
              onLimitChange={onUserLimitChange}
              onCreate={onCreateUser}
              onEdit={onEditUser}
              onDelete={onDeleteUser}
              pagination={userPagination}
              onPageChange={onUserPageChange}
            />
          )}

          {tab === "roles" && (
            <RoleTable
              roles={roles}
              onEdit={onEditRole}
            />
          )}

          {tab === "permissions" && (
            <PermissionGuard permissions={["ADMIN_MANAGE"]}>
              <div className="overflow-x-auto">
                <PermissionMatrix
                  roles={roles}
                  permissions={permissions}
                  onChange={onPermissionChange}
                />
              </div>
            </PermissionGuard>
          )}

               {tab === "branch" && (
            <PermissionGuard permissions={["ADMIN_MANAGE"]}>
              <div className="overflow-x-auto">
                <BranchDepartmentManagement />
              </div>
            </PermissionGuard>
          )}
        </div>
      </div>
    </section>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </div>
  );
}
