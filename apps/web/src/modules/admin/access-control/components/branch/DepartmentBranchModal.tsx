
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  createDepartmentBranchSchema,
  type DepartmentBranch,
} from "@repo/shared";

import {
  useCreateDepartmentBranch,
  useUpdateDepartmentBranch,
} from "../../hooks/useDepartmentBranches";

// Adjust this path to your existing component location.
import { UserCheckerSelect } from "./UserCheckerSelect";

type Props = {
  open: boolean;
  onClose: () => void;
  isBranch: boolean;
  editing: DepartmentBranch | null;
};

type SelectedUser = {
  id: number;
  name: string;
  username: string;
};

export function DepartmentBranchModal({
  open,
  onClose,
  isBranch,
  editing,
}: Props) {
  if (!open) return null;

  return (
    <DepartmentBranchForm
      key={`${isBranch}-${editing?.id ?? "new"}`}
      onClose={onClose}
      isBranch={isBranch}
      editing={editing}
    />
  );
}

type FormProps = Omit<Props, "open">;

function DepartmentBranchForm({
  onClose,
  isBranch,
  editing,
}: FormProps) {
  const createMutation = useCreateDepartmentBranch();
  const updateMutation = useUpdateDepartmentBranch();

  const [name, setName] = useState(
    editing?.entityName ?? ""
  );

  const [checkerId, setCheckerId] = useState<number | null>(
    editing?.checkerId ?? null
  );

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const pending =
    createMutation.isPending ||
    updateMutation.isPending;

  const typeLabel = isBranch ? "Branch" : "Department";

  // Use this if your DepartmentBranch API includes
  // the checker relation with id, name, and username.
  const selectedChecker: SelectedUser | null = null;

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose, pending]);

  function handleCheckerChange(id: number | null) {
    setCheckerId(id);

    setErrors((previous) => {
      if (!previous.checkerId) return previous;

      const next = { ...previous };
      delete next.checkerId;
      return next;
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (pending) return;

    const parsed = createDepartmentBranchSchema.safeParse({
      entityName: name.trim(),
      isBranch: editing?.isBranch ?? isBranch,
      checkerId,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "form");
        fieldErrors[field] = issue.message;
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload: parsed.data,
        });

        toast.success(
          `${typeLabel} updated successfully`
        );
      } else {
        await createMutation.mutateAsync(parsed.data);

        toast.success(
          `${typeLabel} created successfully`
        );
      }

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save record"
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="department-branch-modal-title"
        className="w-full max-w-lg overflow-visible rounded-2xl bg-white shadow-xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2
              id="department-branch-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {editing ? "Edit" : "Add"} {typeLabel}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure organizational information
              and assign a checker.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-6">
            {/* ENTITY NAME */}
            <div>
              <label
                htmlFor="entity-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {typeLabel} Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="entity-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);

                  if (errors.entityName) {
                    setErrors((previous) => ({
                      ...previous,
                      entityName: "",
                    }));
                  }
                }}
                placeholder={`Enter ${typeLabel.toLowerCase()} name`}
                maxLength={100}
                disabled={pending}
                aria-invalid={Boolean(errors.entityName)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />

              {errors.entityName && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.entityName}
                </p>
              )}
            </div>

            {/* CHECKER SELECT */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assigned Checker
                <span className="ml-2 text-xs font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <UserCheckerSelect
                value={checkerId}
                onChange={handleCheckerChange}
                selectedUser={selectedChecker}
                disabled={pending}
              />

              {errors.checkerId && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.checkerId}
                </p>
              )}

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Search and select the user responsible
                for checking requests from this{" "}
                {typeLabel.toLowerCase()}.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {pending
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : `Add ${typeLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
