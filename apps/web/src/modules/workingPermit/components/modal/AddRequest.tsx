
"use client";

import { useRef, useState } from "react";
import { Controller, FieldErrors, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  FileText,
  Loader2,
  Paperclip,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { AddRequestInput, addRequestSchema, AddRequestSchema } from "@repo/shared";
import { useCreateWorkingPermit,useNextWorkingPermitReference, useWorkerList} from "@/modules/workingPermit/hooks/useWorkingPermit";
import { useDepartmentBranches } from "@/modules/workingPermit/hooks/useWorkingPermit"; 
import { DepartmentBranchSelect } from "../ui/departmentBranches";
import toast from "react-hot-toast";


type SelectOption = {
  value: string;
  label: string;
};

type ModalAddRequestProps = {
  onCancel: () => void;
  referenceNo?: string;
  userOptions?: SelectOption[];
};

const inputClass = `
  w-full min-h-11
  rounded-lg
  border border-slate-200
  bg-white
  px-3.5 py-2.5
  text-sm text-slate-800
  placeholder:text-slate-400
  outline-none
  transition-colors
  focus:border-blue-500
  focus:ring-2 focus:ring-blue-100
  disabled:bg-slate-50
  disabled:text-slate-400
`;

// const labelClass =
//   "mb-1.5 block text-[13px] font-medium text-slate-700";

const errorClass =
  "mt-1.5 text-xs font-medium text-red-500";

export default function ModalAddRequest({onCancel}: ModalAddRequestProps) {

  const {
  data: workers = [],
  isLoading: isWorkersLoading,
  isError: isWorkersError,
} = useWorkerList();


  const {
      data: nextReference,
      isLoading: isReferenceLoading,
      isError: isReferenceError,
    } = useNextWorkingPermitReference();


  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateWorkingPermit();


  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: departments = [],
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    } = useDepartmentBranches();


    const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    
    formState: { errors, isSubmitting },
    } = useForm<AddRequestInput, unknown, AddRequestSchema>({
    resolver: zodResolver(addRequestSchema),

  defaultValues: {
    //referenceNumber: referenceNo,
    requestToId: 0,
    fromId: 0,
    requestLevel: "LEVEL_1",
    requestFor: "",
    branchDepartmentId: 0,
    requestedBy: "",
    checkedBy: "",
    attachment: "",
   // status: "PENDING",
  },
});



  const handleInvalidSubmit = (validationErrors: FieldErrors<AddRequestInput>) => {
    console.log("Zod validation errors:", validationErrors);

    setSubmitError(
      "Please correct the highlighted fields before submitting."
    );
  };

  const isSaving = isSubmitting || createMutation.isPending;


  const submitForm = async (values: AddRequestSchema) => {
    setSubmitError(null);

    if (files.length > 0) {
      setSubmitError(
        "File uploads are not configured yet. Remove attachments before submitting."
      );
      return;
    }

    try {

      await createMutation.mutateAsync(values);
      reset();
      setFiles([]);
      toast.success("Working Permit created successfully!");
      onCancel();

    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create working permit request."
      );
    }
  };

  const handleFileChange = (selected: FileList | null) => {
    if (!selected) return;

    setFiles((previous) => [
      ...previous,
      ...Array.from(selected),
    ]);
  };

  const removeFile = (index: number) => {
    setFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };


const selectedWorkerId = useWatch({
  control,
  name: "requestToId",
});

const selectedWorker = workers.find(
  (worker) => worker.id === selectedWorkerId
);

const approvers = [
  {
    label: "Approver 1",
    name: selectedWorker?.firstApprover?.name ?? "Not assigned",
    userId: selectedWorker?.firstApproverUserId ?? null,
  },
  {
    label: "Final Approver",
    name: selectedWorker?.finalApprover?.name ?? "Not assigned",
    userId: selectedWorker?.finalApproverUserId ?? null,
  },
];


  
return (
  <form
    onSubmit={handleSubmit(submitForm, handleInvalidSubmit)}
    noValidate
    className="space-y-8"
  >
    {/* REFERENCE NUMBER */}
    <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">


      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500">
          Reference Number
        </p>

        <p className="text-xl font-semibold tracking-tight text-slate-900">
          {isReferenceLoading
            ? "Loading..."
            : isReferenceError
              ? "Unable to load reference"
              : nextReference}
        </p>

        <p className="text-xs text-slate-500">
          Next available working permit number
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />

        <span>
          {new Intl.DateTimeFormat("en-PH", {
            timeZone: "Asia/Manila",
            dateStyle: "long",
          }).format(new Date())}
        </span>
      </div>
    </div>

    {/* REQUEST INFORMATION */}
    <section className="space-y-5 p-2">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Request Information
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Provide the details of the working permit request.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-3">
                {/* REQUEST TO */}
              <div className="min-w-0 space-y-1.5">
          <label
            htmlFor="requestToId"
            className="block text-[13px] font-medium text-slate-700"
          >
            Request To <span className="text-red-500">*</span>
          </label>

          <Controller
            name="requestToId"
            control={control}
            render={({ field }) => (
              <select
                id="requestToId"
                name={field.name}
                ref={field.ref}
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const value = event.target.value;

                  field.onChange(value === "" ? undefined : Number(value));
                }}
                disabled={isWorkersLoading || isWorkersError}
                className={inputClass}
                aria-invalid={Boolean(errors.requestToId)}
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
            <p className="mt-1 text-xs text-red-500">
              {errors.requestToId.message}
            </p>
          )}
        </div>

        {/* FROM */}
     
        <div className="min-w-0 space-y-1.5">
        <label className="block text-[13px] font-medium text-slate-700">
          From <span className="text-red-500">*</span>
        </label>

        <Controller
          name="fromId"
          control={control}
          render={({ field }) => (
            <DepartmentBranchSelect
              value={field.value}
              onChange={(departmentId: number) => {
                field.onChange(departmentId);
                field.onBlur();

                const selectedDepartment = departments.find(
                  (department) => department.id === departmentId
                );

                const checkerName =
                  selectedDepartment?.checker?.name ?? "";

                setValue("checkedBy", checkerName, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              departments={departments.filter(
                (department) => department.isBranch === false
              )}
              disabled={isDepartmentsLoading || isDepartmentsError}
              invalid={Boolean(errors.fromId)}
            />
          )}
        />

        {errors.fromId && (
          <p role="alert" className={errorClass}>
            {errors.fromId.message}
          </p>
        )}

        {isDepartmentsLoading && (
          <p className="text-xs text-slate-500">
            Loading departments...
          </p>
        )}

        {isDepartmentsError && (
          <p role="alert" className={errorClass}>
            Failed to load departments and branches.
          </p>
        )}
      </div>


        {/* REQUEST LEVEL */}
        <div className="min-w-0 space-y-1.5">
          <label
            htmlFor="requestLevel"
            className="block text-[13px] font-medium text-slate-700"
          >
            Request Level <span className="text-red-500">*</span>
          </label>

          <select
            id="requestLevel"
            {...register("requestLevel")}
            aria-invalid={Boolean(errors.requestLevel)}
            className={`${inputClass} ${
              errors.requestLevel ? "border-red-500" : ""
            }`}
          >
            <option value="LEVEL_1">Level 1</option>
            <option value="LEVEL_2">Level 2</option>
          </select>

          {errors.requestLevel && (
            <p role="alert" className={errorClass}>
              {errors.requestLevel.message}
            </p>
          )}
        </div>
      </div>

      {/* REQUEST FOR */}
      <div className="space-y-1.5">
        <label
          htmlFor="requestFor"
          className="block text-[13px] font-medium text-slate-700"
        >
          Request For <span className="text-red-500">*</span>
        </label>

        <textarea
          id="requestFor"
          {...register("requestFor")}
          rows={4}
          placeholder="Describe the work to be performed..."
          aria-invalid={Boolean(errors.requestFor)}
          className={`${inputClass} min-h-28 resize-y ${
            errors.requestFor ? "border-red-500" : ""
          }`}
        />

        {errors.requestFor && (
          <p role="alert" className={errorClass}>
            {errors.requestFor.message}
          </p>
        )}
      </div>

      {/* BRANCH / DEPARTMENT */}
           <div className="min-w-0 space-y-1.5">
        <label className="block text-[13px] font-medium text-slate-700">
          BRANCH/DEPARTMENT <span className="text-red-500">*</span>
        </label>

        <Controller
          name="branchDepartmentId"
          control={control}
          render={({ field }) => (
            <DepartmentBranchSelect
              value={field.value}
              onChange={field.onChange}
              departments={departments}
              disabled={isDepartmentsLoading || isDepartmentsError}
              invalid={Boolean(errors.branchDepartmentId)}
            />
          )}
        />

        {errors.branchDepartmentId && (
          <p role="alert" className={errorClass}>
            {errors.branchDepartmentId.message}
          </p>
        )}

        {isDepartmentsLoading && (
          <p className="text-xs text-slate-500">
            Loading departments...
          </p>
        )}

        {isDepartmentsError && (
          <p role="alert" className={errorClass}>
            Failed to load departments and branches.
          </p>
        )}
      </div>

    </section>

    {/* AUTHORIZATION */}
    <section className="space-y-5 p-2">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Authorization &amp; Approval
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Identify the responsible personnel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        {/* REQUESTED BY */}
        <div className="space-y-1.5">
          <label
            htmlFor="requestedBy"
            className="block text-[13px] font-medium text-slate-700"
          >
            Requested By <span className="text-red-500">*</span>
          </label>

          <input
            id="requestedBy"
            {...register("requestedBy")}
            placeholder="Employee name"
            aria-invalid={Boolean(errors.requestedBy)}
            className={`${inputClass} ${
              errors.requestedBy ? "border-red-500" : ""
            }`}
          />

          {errors.requestedBy && (
            <p role="alert" className={errorClass}>
              {errors.requestedBy.message}
            </p>
          )}
        </div>

        {/* CHECKED BY */}
        <div className="space-y-1.5">
          <label
            htmlFor="checkedBy"
            className="block text-[13px] font-medium text-slate-700"
          >
            Checked By <span className="text-red-500">*</span>
          </label>

         <input
              id="checkedBy"
              {...register("checkedBy")}
              readOnly
              placeholder="Automatically assigned from department"
              aria-invalid={Boolean(errors.checkedBy)}
              className={`${inputClass} bg-slate-50 cursor-not-allowed ${
                errors.checkedBy ? "border-red-500" : ""
              }`}
            />

          {errors.checkedBy && (
            <p role="alert" className={errorClass}>
              {errors.checkedBy.message}
            </p>
          )}
        </div>
      </div>

    {/* DESIGNATED APPROVERS */}
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-slate-600" />

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

            <p className="mt-1.5 text-sm font-medium text-slate-800">
              {approver.name}
            </p>
          </div>
        ))}
      </div>
    </div>
    </section>

    {/* SUPPORTING DOCUMENTS */}
    <section className="space-y-5 p-2">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Paperclip className="h-4 w-4" />
          Supporting Documents
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Attach supporting documents if applicable.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
        onChange={(event) => {
          handleFileChange(event.target.files);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isSaving}
        className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-5 py-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UploadCloud className="mb-3 h-7 w-7 text-blue-600" />

        <p className="text-sm font-medium text-slate-700">
          Click to upload files
        </p>

        <p className="mt-1 text-xs text-slate-400">
          PDF, Word, JPG or PNG
        </p>
      </button>

      {/* SELECTED FILES */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-slate-500" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={isSaving}
                aria-label={`Remove ${file.name}`}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* VALIDATION AND SUBMISSION ERRORS */}
    {(Object.keys(errors).length > 0 || submitError) && (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
      >
        <p className="text-sm font-semibold text-red-700">
          {submitError ?? "Please correct the following fields:"}
        </p>

        {Object.keys(errors).length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-600">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                {field}: {error?.message ?? "Invalid value"}
              </li>
            ))}
          </ul>
        )}
      </div>
    )}

    {/* FOOTER ACTIONS */}
    <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-400">
        Fields marked <span className="text-red-500">*</span> are required
      </p>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="shadow inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving || isReferenceLoading || isReferenceError}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 hover:cursor-pointer disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {isSaving ? "Saving Request..." : "Submit Request"}
        </button>
      </div>
    </div>
  </form>
);

}
