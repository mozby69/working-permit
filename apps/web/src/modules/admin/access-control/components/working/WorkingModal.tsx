
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Loader2,
  X,
  ClipboardList,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  createWorkingSchema,
  type WorkingType,
} from "@repo/shared";

import {
  useCreateWorking,
  useUpdateWorking,
} from "../../hooks/useWorking";
import { UserCheckerSelect } from "../branch/UserCheckerSelect";

// Reuse the existing searchable user selector.
// Adjust this import to its actual location.

// ==========================================
// TYPES
// ==========================================

type Props = {
  open: boolean;
  onClose: () => void;
  editing: WorkingType | null;
};

type SelectedUser = {
  id: number;
  name: string;
  username: string;
};

// ==========================================
// MODAL WRAPPER
// ==========================================

export function WorkingModal({
  open,
  onClose,
  editing,
}: Props) {
  if (!open) return null;

  return (
    <WorkingForm
      key={editing?.id ?? "new"}
      onClose={onClose}
      editing={editing}
    />
  );
}

type FormProps = Omit<Props, "open">;

// ==========================================
// FORM COMPONENT
// ==========================================

function WorkingForm({
  onClose,
  editing,
}: FormProps) {
  const createMutation = useCreateWorking();
  const updateMutation = useUpdateWorking();

  const isEditing = Boolean(editing);

  // ==========================================
  // FORM STATE
  // ==========================================

  const [workerName, setWorkerName] = useState(
    editing?.workerName ?? ""
  );

  const [
    firstApproverUserId,
    setFirstApproverUserId,
  ] = useState<number | null>(
    editing?.firstApproverUserId ?? null
  );

  const [
    finalApproverUserId,
    setFinalApproverUserId,
  ] = useState<number | null>(
    editing?.finalApproverUserId ?? null
  );

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const pending =
    createMutation.isPending ||
    updateMutation.isPending;

  // ==========================================
  // SELECTED USERS
  // ==========================================

  const firstApprover = editing?.firstApproverUser;

  const selectedFirstApprover: SelectedUser | null =
    firstApprover &&
    firstApprover.id === firstApproverUserId
      ? {
          id: firstApprover.id,
          name: firstApprover.name,
          username: firstApprover.username,
        }
      : null;

  const finalApprover = editing?.finalApproverUser;

  const selectedFinalApprover: SelectedUser | null =
    finalApprover &&
    finalApprover.id === finalApproverUserId
      ? {
          id: finalApprover.id,
          name: finalApprover.name,
          username: finalApprover.username,
        }
      : null;

  // ==========================================
  // ESCAPE KEY HANDLER
  // ==========================================

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

  // ==========================================
  // CLEAR FIELD ERROR
  // ==========================================

  function clearError(field: string) {
    setErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];

      return next;
    });
  }

  // ==========================================
  // FIRST APPROVER CHANGE
  // ==========================================

  function handleFirstApproverChange(
    id: number | null
  ) {
    setFirstApproverUserId(id);
    clearError("firstApproverUserId");
  }

  // ==========================================
  // FINAL APPROVER CHANGE
  // ==========================================

  function handleFinalApproverChange(
    id: number | null
  ) {
    setFinalApproverUserId(id);
    clearError("finalApproverUserId");
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (pending) return;

    const parsed = createWorkingSchema.safeParse({
      workerName: workerName.trim(),
      firstApproverUserId,
      finalApproverUserId,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        const field = String(
          issue.path[0] ?? "form"
        );

        fieldErrors[field] = issue.message;
      }

      setErrors(fieldErrors);
      return;
    }

    // Prevent assigning the same user twice.
    if (
      parsed.data.firstApproverUserId != null &&
      parsed.data.finalApproverUserId != null &&
      parsed.data.firstApproverUserId ===
        parsed.data.finalApproverUserId
    ) {
      setErrors({
        finalApproverUserId:
          "First and final approvers must be different users.",
      });

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
          "Work permit type updated successfully."
        );
      } else {
        await createMutation.mutateAsync(
          parsed.data
        );

        toast.success(
          "Work permit type created successfully."
        );
      }

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save work permit type."
      );
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="working-modal-title"
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl"
      >

        {/* ======================================
            MODAL HEADER
        ====================================== */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardList size={22} />
            </div>

            <div>
              <h2
                id="working-modal-title"
                className="text-lg font-semibold text-slate-900"
              >
                {isEditing
                  ? "Edit Work Permit Type"
                  : "Add Work Permit Type"}
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Configure the work type and assign
                users responsible for approval.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* ======================================
            FORM
        ====================================== */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">

            {/* WORK TYPE NAME */}
            <div>
              <label
                htmlFor="workerName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Type of Work
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="workerName"
                type="text"
                value={workerName}
                onChange={(event) => {
                  setWorkerName(event.target.value);
                  clearError("workerName");
                }}
                placeholder="e.g. Electrical Maintenance"
                maxLength={100}
                disabled={pending}
                aria-invalid={Boolean(errors.workerName)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />

              {errors.workerName && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.workerName}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-500">
                Enter the name of the work type
                used when creating a working permit.
              </p>
            </div>

            {/* ======================================
                APPROVAL CONFIGURATION
            ====================================== */}

            <div className="border-t border-slate-100 pt-5">

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-900">
                  Approval Configuration
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Assign the users responsible for
                  reviewing and approving this work type.
                </p>
              </div>

              <div className="space-y-5">

                {/* FIRST APPROVER */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <UserCheck
                      size={16}
                      className="text-indigo-600"
                    />

                    <label className="text-sm font-medium text-slate-700">
                      First Approver
                    </label>

                    <span className="text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </div>

                  <UserCheckerSelect
                    value={firstApproverUserId}
                    onChange={handleFirstApproverChange}
                    selectedUser={selectedFirstApprover}
                    disabled={pending}
                  />

                  {errors.firstApproverUserId && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.firstApproverUserId}
                    </p>
                  )}

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Search and select the user who
                    will perform the first approval.
                  </p>
                </div>

                {/* FINAL APPROVER */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck
                      size={16}
                      className="text-emerald-600"
                    />

                    <label className="text-sm font-medium text-slate-700">
                      Final Approver
                    </label>

                    <span className="text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  </div>

                  <UserCheckerSelect
                    value={finalApproverUserId}
                    onChange={handleFinalApproverChange}
                    selectedUser={selectedFinalApprover}
                    disabled={pending}
                  />

                  {errors.finalApproverUserId && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.finalApproverUserId}
                    </p>
                  )}

                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Search and select the user
                    responsible for final approval.
                  </p>
                </div>
              </div>
            </div>

            {/* INFORMATION */}
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3">
              <p className="text-xs leading-relaxed text-indigo-700">
                <span className="font-semibold">
                  Approval Workflow:
                </span>{" "}
                When configured, the first approver
                reviews the request before it proceeds
                to the final approver.
              </p>
            </div>

            {errors.form && (
              <p className="text-sm text-red-600">
                {errors.form}
              </p>
            )}
          </div>

          {/* ======================================
              FOOTER
          ====================================== */}

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {pending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Work Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
