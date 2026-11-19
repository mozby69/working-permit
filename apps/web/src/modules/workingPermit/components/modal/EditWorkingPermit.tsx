
"use client";

import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Loader2,
  Paperclip,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  addRequestSchema,
  type AddRequestInput,
  type AddRequestSchema,
  type WorkingPermitResponse,
} from "@repo/shared";

import {
  useDepartmentBranches,
  useWorkerList,
  useUpdateWorkingPermit,
} from "../../hooks/useWorkingPermit";

import { DepartmentBranchSelect } from "../ui/departmentBranches";
import AttachmentPreview from "../ui/attachmentPreview"; 


type Props = {
  permit: WorkingPermitResponse;
  onCancel: () => void;
};

const inputClass =
  "w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50";

const labelClass = "mb-1.5 block text-[13px] font-medium text-slate-700";
const errorClass = "mt-1 text-xs text-red-600";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function EditWorkingPermit({
  permit,
  onCancel,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateMutation = useUpdateWorkingPermit();

  const {
    data: departments = [],
    isLoading: departmentsLoading,
  } = useDepartmentBranches();

  const {
    data: workers = [],
    isLoading: workersLoading,
  } = useWorkerList();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddRequestInput, unknown, AddRequestSchema>({
    resolver: zodResolver(addRequestSchema),
    defaultValues: {
  requestToId: permit.requestToWorker.id,
  fromId: permit.fromDepartment.id,
  branchDepartmentId: permit.branchDepartment.id,
  requestLevel: permit.requestLevel,
  requestFor: permit.requestFor,
  requestedBy: permit.requestedBy,
  checkedBy: permit.checkedBy ?? "",
  attachment: "",
},
  });

  const selectedWorkerId = useWatch({
    control,
    name: "requestToId",
  });

  const selectedWorker = workers.find(
    (worker) => worker.id === selectedWorkerId
  );

  const approvers = [
    {
      label: "First Approver",
      name: selectedWorker?.firstApprover?.name ??
        permit.requestToWorker.firstApprover?.name ??
        "Not assigned",
    },
    {
      label: "Final Approver",
      name: selectedWorker?.finalApprover?.name ??
        permit.requestToWorker.finalApprover?.name ??
        "Not assigned",
    },
  ];

  const isSaving = isSubmitting || updateMutation.isPending;
  const canEdit = permit.canEdit &&
    permit.approval.checkedStatus === "PENDING";

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const selected = Array.from(fileList);

    if (selected.some((file) => !ALLOWED_TYPES.includes(file.type))) {
      toast.error("Only PDF, Word, JPG and PNG files are allowed.");
      return;
    }

    if (selected.some((file) => file.size > MAX_FILE_SIZE)) {
      toast.error("Each file must be 10 MB or smaller.");
      return;
    }

    const unique = selected.filter(
      (file) =>
        !files.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        )
    );

    if (
      permit.attachments.length +
      files.length +
      unique.length > MAX_FILES
    ) {
      toast.error("A permit can have a maximum of 5 attachments.");
      return;
    }

    setFiles((previous) => [...previous, ...unique]);
  };

  const onSubmit = async (values: AddRequestSchema) => {
    setSubmitError(null);

    if (!canEdit) {
      setSubmitError("This permit can no longer be edited.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: permit.id,
        payload: {
          ...values,
          attachments: files,
        },
      });

      toast.success("Working Permit updated successfully.");
      onCancel();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update working permit.";

      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-7 p-4"
      noValidate
    >
      {/* REFERENCE */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
        <p className="text-xs font-medium text-slate-500">
          Working Permit Reference
        </p>
        <h3 className="mt-1 text-xl font-bold text-indigo-700">
          {permit.referenceNumber}
        </h3>
        <p className="mt-2 text-xs text-slate-500">
          Created permit • Edit request information
        </p>
      </div>

      {!canEdit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Editing is unavailable. Only the creator may edit before checker approval.
        </div>
      )}

      <fieldset disabled={!canEdit || isSaving} className="space-y-7">
        {/* REQUEST INFORMATION */}
        <section className="space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900">
              Request Information
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Update the details of this working permit.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className={labelClass}>Request To *</label>
              <Controller
                name="requestToId"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    disabled={workersLoading}
                    className={inputClass}
                  >
                    <option value="">Select recipient</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.workerName}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.requestToId && (
                <p className={errorClass}>{errors.requestToId.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>From *</label>
              <Controller
                name="fromId"
                control={control}
                render={({ field }) => (
                  <DepartmentBranchSelect
                    value={field.value}
                    onChange={(id) => {
                      field.onChange(id);
                      const department = departments.find(
                        (item) => item.id === id
                      );
                      setValue(
                        "checkedBy",
                        department?.checker?.name ?? "",
                        { shouldValidate: true, shouldDirty: true }
                      );
                    }}
                    departments={departments.filter(
                      (department) => !department.isBranch
                    )}
                    disabled={departmentsLoading}
                    invalid={!!errors.fromId}
                  />
                )}
              />
              {errors.fromId && (
                <p className={errorClass}>{errors.fromId.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Request Level *</label>
              <select
                {...register("requestLevel")}
                className={inputClass}
              >
                <option value="LEVEL_1">Level 1</option>
                <option value="LEVEL_2">Level 2</option>
              </select>
              {errors.requestLevel && (
                <p className={errorClass}>
                  {errors.requestLevel.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Request For *</label>
            <textarea
              {...register("requestFor")}
              rows={4}
              className={`${inputClass} min-h-28 resize-y`}
              placeholder="Describe the requested work..."
            />
            {errors.requestFor && (
              <p className={errorClass}>{errors.requestFor.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Branch / Department *</label>
            <Controller
              name="branchDepartmentId"
              control={control}
              render={({ field }) => (
                <DepartmentBranchSelect
                  value={field.value}
                  onChange={field.onChange}
                  departments={departments}
                  disabled={departmentsLoading}
                  invalid={!!errors.branchDepartmentId}
                />
              )}
            />
            {errors.branchDepartmentId && (
              <p className={errorClass}>
                {errors.branchDepartmentId.message}
              </p>
            )}
          </div>
        </section>

        {/* AUTHORIZATION */}
        <section className="space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900">
              Authorization & Approval
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Personnel associated with this request.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Requested By *</label>
              <input
                {...register("requestedBy")}
                className={inputClass}
              />
              {errors.requestedBy && (
                <p className={errorClass}>
                  {errors.requestedBy.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Checked By *</label>
              <input
                {...register("checkedBy")}
                readOnly
                className={`${inputClass} bg-slate-50`}
              />
              {errors.checkedBy && (
                <p className={errorClass}>{errors.checkedBy.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck size={17} className="text-indigo-600" />
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Designated Approvers
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {approvers.map((approver) => (
                <div
                  key={approver.label}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs text-slate-500">
                    {approver.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {approver.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ATTACHMENTS */}
        <section className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Paperclip size={17} />
              Supporting Documents
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Existing documents are retained. Add files if needed.
            </p>
          </div>

{/* EXISTING ATTACHMENTS */}

    {permit.attachments.length > 0 && (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500">
          Existing attachments
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {permit.attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              permitId={permit.id}
              attachment={attachment}
            />
          ))}
        </div>
      </div>
    )}


          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-7 transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <UploadCloud size={25} className="mb-2 text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">
              Click to upload additional files
            </span>
            <span className="mt-1 text-xs text-slate-400">
              PDF, Word, JPG or PNG • Maximum 10 MB per file
            </span>
          </button>

        
          {/* NEW ATTACHMENTS */}

          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500">
                New attachments
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {files.map((file, index) => (
                  <AttachmentPreview
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    file={file}
                    onRemove={() => {
                      setFiles((previous) =>
                        previous.filter((_, i) => i !== index)
                      );
                    }}
                    disabled={isSaving}
                  />
                ))}
              </div>

              <p className="text-right text-xs text-slate-500">
                {permit.attachments.length + files.length} of {MAX_FILES} files
                selected
              </p>
            </div>
          )}

        </section>
      </fieldset>

      {submitError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!canEdit || isSaving}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {isSaving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
