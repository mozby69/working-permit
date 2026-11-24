
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Controller,
  useForm,
  useWatch,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserSchema,
  FormValues,
  updateUserSchema,
  UserFormInput,
  userFormSchema
} from "@repo/shared";

import {
  UserRound,
  AtSign,
  LockKeyhole,
  ShieldCheck,
  Building2,
  Loader2,
  Search,
  Check,
  Info,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

import { UserFormProps } from "../../types/access-control.types";

import { useDepartmentBranches } from "../../hooks/useDepartmentBranches";



const inputClass = `
  w-full rounded-xl border border-slate-200
  bg-white px-4 py-2.5 text-sm text-slate-900
  outline-none transition
  placeholder:text-slate-400
  hover:border-slate-300
  focus:border-indigo-500
  focus:ring-4 focus:ring-indigo-500/10
  disabled:cursor-not-allowed
  disabled:bg-slate-50
  disabled:text-slate-400
`;

export function UserForm({
  mode,
  user,
  roles,
  isSubmitting = false,
  onCreate,
  onUpdate,
}: UserFormProps) {
  const isEdit = mode === "edit";

  const [showPassword, setShowPassword] =
    useState(false);

  const [branchSearch, setBranchSearch] =
    useState("");

  const {
    data: branches = [],
    isLoading: branchesLoading,
    isError: branchesError,
  } = useDepartmentBranches({
    isBranch: true,
  });



const {
  register,
  handleSubmit,
  control,
  reset,
  setError,
  formState: { errors },
} = useForm<UserFormInput, unknown, FormValues>({
  resolver: zodResolver(userFormSchema),

  defaultValues: {
    name: "",
    username: "",
    email: "",
    password: "",
    roleIds: [],
    branchIds: [],
    isActive: true,
  },
});


  const selectedRoleIds =
    useWatch({
      control,
      name: "roleIds",
    }) ?? [];

  const selectedBranchIds =
    useWatch({
      control,
      name: "branchIds",
    }) ?? [];

  const selectedRolesCount =
    selectedRoleIds.length;

  const selectedBranchesCount =
    selectedBranchIds.length;

  const filteredBranches = useMemo(() => {
    const keyword =
      branchSearch.trim().toLowerCase();

    if (!keyword) {
      return branches;
    }

    return branches.filter((branch) =>
      branch.entityName
        .toLowerCase()
        .includes(keyword)
    );
  }, [branches, branchSearch]);

  useEffect(() => {
    if (isEdit && user) {
      reset({
        name: user.name,
        username: user.username,
        email: user.email ?? "",
        password: "",
        roleIds:
          user.roles?.map((role) => role.id) ?? [],
        branchIds:
          user.branchAssignments?.map(
            (assignment) => assignment.branchId
          ) ?? [],
        isActive: user.isActive,
      });

      return;
    }

    reset({
      name: "",
      username: "",
      email: "",
      password: "",
      roleIds: [],
      branchIds: [],
      isActive: true,
    });
  }, [isEdit, user, reset]);

const submit = (data: FormValues) => {
  if (isEdit) {
    const parsed = updateUserSchema.safeParse(data);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof UserFormInput;

        if (field) {
          setError(field, {
            type: "manual",
            message: issue.message,
          });
        }
      }

      return;
    }

    onUpdate?.(parsed.data);
    return;
  }

  const parsed = createUserSchema.safeParse(data);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof UserFormInput;

      if (field) {
        setError(field, {
          type: "manual",
          message: issue.message,
        });
      }
    }

    return;
  }

  onCreate?.(parsed.data);
};

  return (
    <form
      id="user-form"
      onSubmit={handleSubmit(submit)}
      className="space-y-7"
    >
      {/* ACCOUNT INFORMATION */}
      <section className="space-y-5">
        <SectionHeading
          icon={<UserRound size={18} />}
          number="01"
          title="Account Information"
          description="Basic information used to identify and authenticate this user."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Full Name"
            required
            error={errors.name?.message}
          >
            <div className="relative">
              <UserRound
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="name"
                type="text"
                {...register("name")}
                disabled={isSubmitting}
                placeholder="Enter full name"
                autoComplete="name"
                className={`${inputClass} pl-10`}
              />
            </div>
          </FormField>

          <FormField
            label="Username"
            required
            error={errors.username?.message}
          >
            <div className="relative">
              <AtSign
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="username"
                type="text"
                {...register("username")}
                disabled={isSubmitting}
                placeholder="Enter username"
                autoComplete="username"
                className={`${inputClass} pl-10`}
              />
            </div>
          </FormField>

          <FormField
            label="Email Address"
            error={errors.email?.message}
          >
            <div className="relative">
              <AtSign
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="email"
                type="email"
                {...register("email")}
                disabled={isSubmitting}
                placeholder="name@example.com"
                autoComplete="email"
                className={`${inputClass} pl-10`}
              />
            </div>
          </FormField>

          <FormField
            label="Password"
            required={!isEdit}
            error={errors.password?.message}
          >
            <div className="relative">
              <LockKeyhole
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                {...register("password")}
                disabled={isSubmitting}
                autoComplete="new-password"
                placeholder={
                  isEdit
                    ? "Leave blank to keep current"
                    : "Minimum 8 characters"
                }
                className={`${inputClass} pl-10 pr-11`}
              />

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </FormField>
        </div>

        {isEdit && (
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
            <Info
              size={15}
              className="mt-0.5 shrink-0 text-slate-400"
            />
            <p className="text-xs text-slate-500">
              Leave the password blank if you do not
              want to change the current password.
            </p>
          </div>
        )}
      </section>

      <div className="border-t border-slate-100" />

      {/* ROLES */}
      <section className="space-y-4">
        <SectionHeading
          icon={<ShieldCheck size={18} />}
          number="02"
          title="Roles & Permissions"
          description="Assign the appropriate system access to this user."
          right={
            <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {selectedRolesCount} selected
            </span>
          }
        />

        <Controller
          name="roleIds"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {roles.map((role) => {
                const current = field.value ?? [];

                const checked =
                  current.includes(role.id);

                return (
                  <label
                    key={role.id}
                    className={`
                      flex cursor-pointer items-center
                      justify-between gap-3
                      rounded-xl border px-3.5 py-3
                      transition
                      ${
                        checked
                          ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-100"
                          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                      }
                      ${
                        isSubmitting
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      }
                    `}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isSubmitting}
                        onChange={(event) => {
                          field.onChange(
                            event.target.checked
                              ? [...current, role.id]
                              : current.filter(
                                  (id) => id !== role.id
                                )
                          );
                        }}
                        className="h-4 w-4 shrink-0 accent-indigo-600"
                      />

                      <span
                        className={`
                          truncate text-sm font-medium
                          ${
                            checked
                              ? "text-indigo-800"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {role.name}
                      </span>
                    </div>

                    {checked && (
                      <Check
                        size={16}
                        className="shrink-0 text-indigo-600"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          )}
        />

        <FieldMessage
          message={errors.roleIds?.message}
        />
      </section>

      <div className="border-t border-slate-100" />

      {/* BRANCH ASSIGNMENT */}
      <section className="space-y-4">
        <SectionHeading
          icon={<Building2 size={18} />}
          number="03"
          title="Branch Assignment"
          description="Choose which branches this user can monitor."
          right={
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Optional
            </span>
          }
        />

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={branchSearch}
                onChange={(event) =>
                  setBranchSearch(event.target.value)
                }
                disabled={isSubmitting}
                placeholder="Search branches..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <span className="shrink-0 text-xs font-medium text-slate-500">
              {selectedBranchesCount} selected
            </span>
          </div>

          <Controller
            name="branchIds"
            control={control}
            render={({ field }) => (
              <div className="max-h-48 space-y-1 overflow-y-auto p-2">
                {branchesLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Loading branches...
                  </div>
                ) : branchesError ? (
                  <div className="py-8 text-center text-sm text-red-600">
                    Failed to load branches.
                  </div>
                ) : filteredBranches.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No branches found.
                  </div>
                ) : (
                  filteredBranches.map((branch) => {
                    const current =
                      field.value ?? [];

                    const checked =
                      current.includes(branch.id);

                    return (
                      <label
                        key={branch.id}
                        className={`
                          flex cursor-pointer items-center
                          justify-between gap-3
                          rounded-lg px-3 py-2.5
                          transition
                          ${
                            checked
                              ? "bg-indigo-50"
                              : "hover:bg-slate-50"
                          }
                        `}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isSubmitting}
                            onChange={(event) => {
                              field.onChange(
                                event.target.checked
                                  ? [
                                      ...current,
                                      branch.id,
                                    ]
                                  : current.filter(
                                      (id) =>
                                        id !== branch.id
                                    )
                              );
                            }}
                            className="h-4 w-4 shrink-0 accent-indigo-600"
                          />

                          <div
                            className={`
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-lg
                              ${
                                checked
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "bg-slate-100 text-slate-500"
                              }
                            `}
                          >
                            <Building2 size={17} />
                          </div>

                          <span className="truncate text-sm font-medium text-slate-700">
                            {branch.entityName}
                          </span>
                        </div>

                        {checked && (
                          <CheckCircle2
                            size={18}
                            className="shrink-0 text-indigo-600"
                          />
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            )}
          />

          <div className="flex items-start gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
            <Info
              size={15}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <p className="text-xs leading-relaxed text-slate-500">
              Branch assignment is optional. Users
              without assigned branches cannot view
              branch-specific monitoring records.
            </p>
          </div>
        </div>

        <FieldMessage
          message={errors.branchIds?.message}
        />
      </section>

      {/* ACCOUNT STATUS */}
      {isEdit && (
        <>
          <div className="border-t border-slate-100" />

          <section>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Account Status
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Allow this user to sign in and
                      access the system.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={field.value ?? true}
                    onChange={(event) =>
                      field.onChange(
                        event.target.checked
                      )
                    }
                    disabled={isSubmitting}
                    className="h-5 w-5 shrink-0 accent-indigo-600"
                  />
                </label>
              )}
            />
          </section>
        </>
      )}
    </form>
  );
}

function SectionHeading({
  icon,
  number,
  title,
  description,
  right,
}: {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {title}
            </h3>

            <span className="text-[10px] font-semibold text-slate-400">
              {number}
            </span>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {right}
    </div>
  );
}

function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      <FieldMessage message={error} />
    </div>
  );
}

function FieldMessage({
  message,
}: {
  message?: string;
}) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-1.5 text-xs font-medium text-red-600"
    >
      {message}
    </p>
  );
}
