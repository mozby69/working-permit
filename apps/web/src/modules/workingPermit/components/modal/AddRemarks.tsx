
"use client";

import { useState, type FormEvent } from "react";
import { Loader2, MessageSquareText } from "lucide-react";
import toast from "react-hot-toast";

import type { WorkingPermitResponse } from "@repo/shared";
import { useAddWorkingPermitRemark } from "../../hooks/useWorkingPermit";

type Props = {
  permit: WorkingPermitResponse;
  onCancel: () => void;
};

export default function AddRemark({
  permit,
  onCancel,
}: Props) {
  const [description, setDescription] = useState("");

  const addRemark = useAddWorkingPermitRemark();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const value = description.trim();

    if (!value) {
      toast.error("Please enter your remark.");
      return;
    }

    try {
      await addRemark.mutateAsync({
        workingPermitId: permit.id,
        payload: {
          description: value,
        },
      });

      toast.success("Remark added successfully.");

      setDescription("");
      onCancel();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add remark."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="flex items-start gap-3">
          <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Add Troubleshooter Remark
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Add a progress update or explanation.
              Previous remarks will be preserved.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs font-medium text-slate-500">
          Working Permit
        </p>

        <p className="mt-1 text-base font-bold text-slate-900">
          {permit.referenceNumber}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {permit.requestTo}
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="remark-description"
          className="block text-sm font-semibold text-slate-800"
        >
          Remark Description
        </label>

        <textarea
          id="remark-description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          maxLength={2000}
          rows={5}
          disabled={addRemark.isPending}
          placeholder="Enter the reason for the delay, current progress, or other important information..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
        />

        <p className="text-right text-xs text-slate-400">
          {description.length}/2000
        </p>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={addRemark.isPending}
          className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            addRemark.isPending ||
            !description.trim() ||
            !permit.canAddRemarks
          }
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {addRemark.isPending && (
            <Loader2 size={16} className="animate-spin" />
          )}

          {addRemark.isPending
            ? "Adding..."
            : "Add Remark"}
        </button>
      </div>
    </form>
  );
}
