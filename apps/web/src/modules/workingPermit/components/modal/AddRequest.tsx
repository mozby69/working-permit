
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  Controller,
  FieldErrors,
  useForm,
  useWatch,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  CalendarDays,
  Download,
  FileImage,
  FileText,
  Loader2,
  Paperclip,
  Save,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

import {
  AddRequestInput,
  AddRequestSchema,
  addRequestSchema,
} from "@repo/shared";

import {
  useCreateWorkingPermit,
  useNextWorkingPermitReference,
  useWorkerList,
  useDepartmentBranches,
  useRequestTypes,
  useCheckDuplicateWorkingPermit,
} from "@/modules/workingPermit/hooks/useWorkingPermit";

import { DepartmentBranchSelect } from "../ui/departmentBranches";
import AttachmentPreview from "../ui/attachmentPreview"; 
import toast from "react-hot-toast";
import { duplicateWorkingPermitAlert } from "../../helper/wp.helper";
import { useAuth } from "@/modules/authentication/hooks/useAuth";



type SelectOption = {
  value: string;
  label: string;
};

type ModalAddRequestProps = {
  onCancel: () => void;
  referenceNo?: string;
  userOptions?: SelectOption[];
};

type FilePreview = {
  file: File;
  url: string;
};


const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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

const errorClass =
  "mt-1.5 text-xs font-medium text-red-500";



function isImageFile(file: File): boolean {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png"
  );
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf";
}



function formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}



export default function ModalAddRequest({
  onCancel,
}: ModalAddRequestProps) {

    const { user } = useAuth();


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

  const {
    data: departments = [],
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
  } = useDepartmentBranches();

  const {
  data: requestTypes = [],
  isLoading: isRequestTypesLoading,
  isError: isRequestTypesError,
} = useRequestTypes();

  const createMutation = useCreateWorkingPermit();
  const duplicateMutation = useCheckDuplicateWorkingPermit();


  const fileInputRef = useRef<HTMLInputElement>(null);


  const previewUrlRef = useRef<string | null>(null);



  const [files, setFiles] = useState<File[]>([]);

  const [preview, setPreview] =
    useState<FilePreview | null>(null);

  const [submitError, setSubmitError] =
    useState<string | null>(null);



  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
    AddRequestInput,
    unknown,
    AddRequestSchema
  >({
    resolver: zodResolver(addRequestSchema),

    defaultValues: {
      requestToId: 0,
      fromId: 0,
      requestLevel: "LEVEL_1",
      requestFor: "",
      branchDepartmentId: 0,
      requestedBy: "",
      checkedBy: "",
      attachment: "",
      requestTypeId: null,
    },
  });

    const isSaving =
    isSubmitting || createMutation.isPending || duplicateMutation.isPending;



  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);



  // const openPreview = (file: File) => {
  //   if (!canPreviewFile(file)) {
  //     toast.error(
  //       "Preview is only available for images and PDF files."
  //     );
  //     return;
  //   }

  //   if (previewUrlRef.current) {
  //     URL.revokeObjectURL(previewUrlRef.current);
  //   }

  //   const url = URL.createObjectURL(file);

  //   previewUrlRef.current = url;

  //   setPreview({
  //     file,
  //     url,
  //   });
  // };



  const closePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreview(null);
  };



  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = file.name;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };



  const removeFile = (index: number) => {
    const selectedFile = files[index];

    if (!selectedFile) {
      return;
    }

    if (preview?.file === selectedFile) {
      closePreview();
    }

    setFiles((previous) =>
      previous.filter(
        (_, fileIndex) => fileIndex !== index
      )
    );
  };



  const handleFileChange = (
    fileList: FileList | null
  ) => {
    if (!fileList?.length) {
      return;
    }

    const selectedFiles = Array.from(fileList);

    // Validate file types.
    const invalidFile = selectedFiles.find(
      (file) => !ALLOWED_TYPES.includes(file.type)
    );

    if (invalidFile) {
      toast.error(
        `Unsupported file type: ${invalidFile.name}`
      );
      return;
    }

    // Validate individual file sizes.
    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (oversizedFile) {
      toast.error(
        `${oversizedFile.name} exceeds the 10 MB limit.`
      );
      return;
    }

    // Prevent duplicate files.
    const newFiles = selectedFiles.filter(
      (file) =>
        !files.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified ===
              file.lastModified
        )
    );

    // Validate maximum number of files.
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(
        `You can upload a maximum of ${MAX_FILES} files.`
      );
      return;
    }

    if (newFiles.length === 0) {
      toast.error("Files are already selected.");
      return;
    }

    setFiles((previous) => [
      ...previous,
      ...newFiles,
    ]);

    setSubmitError(null);
  };

  // ==========================================
  // WATCH SELECTED WORKER
  // ==========================================

  const selectedWorkerId = useWatch({
    control,
    name: "requestToId",
  });

  const requestLevel = useWatch({
    control,
    name: "requestLevel",
  });

  const selectedWorker = workers.find(
    (worker) => worker.id === selectedWorkerId
  );

  // ==========================================
  // DESIGNATED APPROVERS
  // ==========================================

  const approvers = [
    ...(requestLevel === "LEVEL_2"
      ? [
          {
            label: "First Approver",
            name:
              selectedWorker?.firstApprover?.name ??
              "Not assigned",
          },
        ]
      : []),

    {
      label: "Final Approver",
      name:
        selectedWorker?.finalApprover?.name ??
        "Not assigned",
    },
  ];

  // ==========================================
  // INVALID SUBMISSION
  // ==========================================

  const handleInvalidSubmit = (
    validationErrors: FieldErrors<AddRequestInput>
  ) => {
    console.error(
      "Working Permit validation errors:",
      validationErrors
    );

    setSubmitError(
      "Please correct the highlighted fields before submitting."
    );
  };

  // ==========================================
  // SUBMIT REQUEST
  // ==========================================

    const submitForm = async (values: AddRequestSchema) => {
    setSubmitError(null);

    try {
      // ==========================================
      // STEP 1: CHECK DUPLICATES
      // ==========================================

      const duplicateResult = await duplicateMutation.mutateAsync({
        requestToId: values.requestToId,
        fromId: values.fromId,
        branchDepartmentId: values.branchDepartmentId,
        requestTypeId: values.requestTypeId ?? null,
      });

      // ==========================================
      // STEP 2: WARN, BUT ALLOW CONTINUATION
      // ==========================================

      if (duplicateResult.isDuplicate && duplicateResult.existingPermit) {
        const confirmed = await duplicateWorkingPermitAlert(
          duplicateResult.existingPermit.referenceNumber,
        );

        if (!confirmed) {
          return;
        }
      }

      // ==========================================
      // STEP 3: CREATE WORKING PERMIT
      // ==========================================

      await createMutation.mutateAsync({
        ...values,
        attachments: files,
      });

      // ==========================================
      // STEP 4: SUCCESS
      // ==========================================

      reset();
      setFiles([]);

      toast.success("Working Permit created successfully!");

      onCancel();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create working permit request.";

      setSubmitError(message);
      toast.error(message);
    }
  };


  useEffect(() => {
  if (!user?.name) return;

  // Only populate when the field is empty
  if (!getValues("requestedBy")) {
    setValue("requestedBy", user.name);
  }
}, [user?.name, setValue, getValues]);

  // ==========================================
  // RENDER
  // ==========================================




  return (
    <>
      <form
        onSubmit={handleSubmit(
          submitForm,
          handleInvalidSubmit
        )}
        noValidate
        className="space-y-8"
      >
        {/* ======================================
            REFERENCE NUMBER
        ====================================== */}

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

        {/* ======================================
            REQUEST INFORMATION
        ====================================== */}

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
                Request To{" "}
                <span className="text-red-500">*</span>
              </label>

              <Controller
                name="requestToId"
                control={control}
                render={({ field }) => (
                  <select
                    id="requestToId"
                    name={field.name}
                    ref={field.ref}
                    value={field.value || ""}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      const value = event.target.value;

                      field.onChange(
                        value === ""
                          ? 0
                          : Number(value)
                      );
                    }}
                    disabled={
                      isWorkersLoading ||
                      isWorkersError
                    }
                    className={inputClass}
                    aria-invalid={Boolean(
                      errors.requestToId
                    )}
                  >
                    <option value="">
                      Select recipient
                    </option>

                    {workers.map((worker) => (
                      <option
                        key={worker.id}
                        value={worker.id}
                      >
                        {worker.workerName}
                      </option>
                    ))}
                  </select>
                )}
              />

              {errors.requestToId && (
                <p className={errorClass}>
                  {errors.requestToId.message}
                </p>
              )}
            </div>

            {/* FROM */}

            <div className="min-w-0 space-y-1.5">
              <label className="block text-[13px] font-medium text-slate-700">
                From{" "}
                <span className="text-red-500">*</span>
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

                      const selectedDepartment =
                        departments.find(
                          (department) =>
                            department.id ===
                            departmentId
                        );

                      const checkerName =
                        selectedDepartment?.checker
                          ?.name ?? "";

                      setValue(
                        "checkedBy",
                        checkerName,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true,
                        }
                      );
                    }}
                    departments={departments.filter(
                      (department) =>
                        department.isBranch === false
                    )}
                    disabled={
                      isDepartmentsLoading ||
                      isDepartmentsError
                    }
                    invalid={Boolean(errors.fromId)}
                  />
                )}
              />

              {errors.fromId && (
                <p role="alert" className={errorClass}>
                  {errors.fromId.message}
                </p>
              )}
            </div>

            {/* REQUEST LEVEL */}

              
            <div className="min-w-0 space-y-1.5">
              <label
                htmlFor="requestLevel"
                className="block text-[13px] font-medium text-slate-700"
              >
                Request Level{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                id="requestLevel"
                {...register("requestLevel")}
                className={inputClass}
                aria-invalid={Boolean(
                  errors.requestLevel
                )}
              >
                <option value="LEVEL_1">
                  Level 1
                </option>

                <option value="LEVEL_2">
                  Level 2
                </option>
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
              Request For{" "}
              <span className="text-red-500">*</span>
            </label>

            <textarea
              id="requestFor"
              {...register("requestFor")}
              rows={4}
              placeholder="Describe the work to be performed..."
              aria-invalid={Boolean(
                errors.requestFor
              )}
              className={`${inputClass} min-h-28 resize-y`}
            />

            {errors.requestFor && (
              <p className={errorClass}>
                {errors.requestFor.message}
              </p>
            )}
          </div>



          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* BRANCH / DEPARTMENT */}
            <div className="min-w-0 space-y-1.5">
              <label className="block text-[13px] font-medium text-slate-700">
                Requesting Branch / Department{" "}
                <span className="text-red-500">*</span>
              </label>

              <Controller
                name="branchDepartmentId"
                control={control}
                render={({ field }) => (
                  <DepartmentBranchSelect
                    value={field.value}
                    onChange={field.onChange}
                    departments={departments}
                    disabled={
                      isDepartmentsLoading ||
                      isDepartmentsError
                    }
                    invalid={Boolean(errors.branchDepartmentId)}
                  />
                )}
              />

              {errors.branchDepartmentId && (
                <p role="alert" className={errorClass}>
                  {errors.branchDepartmentId.message}
                </p>
              )}
            </div>

            {/* REQUEST TYPE */}
            <div className="min-w-0 space-y-1.5">
              <label className="block text-[13px] font-medium text-slate-700">
                Request Type
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <Controller
                name="requestTypeId"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;

                      field.onChange(
                        value === "" ? null : Number(value)
                      );
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={
                      isRequestTypesLoading ||
                      isRequestTypesError
                    }
                    aria-invalid={Boolean(errors.requestTypeId)}
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm
                      text-slate-700 outline-none transition
                      focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10
                      disabled:cursor-not-allowed disabled:bg-slate-50
                      disabled:text-slate-400
                      ${
                        errors.requestTypeId
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                  >
                    <option value="">
                      {isRequestTypesLoading
                        ? "Loading request types..."
                        : "Select request type"}
                    </option>

                    {requestTypes.map((requestType) => (
                      <option
                        key={requestType.id}
                        value={requestType.id}
                      >
                        {requestType.description}
                      </option>
                    ))}
                  </select>
                )}
              />

              {errors.requestTypeId && (
                <p role="alert" className={errorClass}>
                  {errors.requestTypeId.message}
                </p>
              )}
            </div>
          </div>


        </section>

        {/* ======================================
            AUTHORIZATION & APPROVAL
        ====================================== */}

        <section className="space-y-5 p-2">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Authorization & Approval
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
                Requested By{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="requestedBy"
                {...register("requestedBy")}
                placeholder="Employee name"
                className={inputClass}
                aria-invalid={Boolean(
                  errors.requestedBy
                )}
              />

              {errors.requestedBy && (
                <p className={errorClass}>
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
                Checked By{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="checkedBy"
                {...register("checkedBy")}
                readOnly
                placeholder="Automatically assigned from department"
                className={`${inputClass} cursor-not-allowed bg-slate-50`}
                aria-invalid={Boolean(
                  errors.checkedBy
                )}
              />

              {errors.checkedBy && (
                <p className={errorClass}>
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

        {/* ======================================
            SUPPORTING DOCUMENTS
        ====================================== */}

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

          {/* HIDDEN FILE INPUT */}

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

          {/* UPLOAD AREA */}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={
              isSaving || files.length >= MAX_FILES
            }
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-5 py-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UploadCloud className="mb-3 h-7 w-7 text-blue-600" />

            <p className="text-sm font-medium text-slate-700">
              Click to upload files
            </p>

            <p className="mt-1 text-xs text-slate-400">
              PDF, Word, JPG or PNG
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Maximum {MAX_FILES} files, 10 MB each
            </p>
          </button>

          {/* SELECTED FILES */}

        {/* SELECTED FILES */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {files.map((file, index) => (
                <AttachmentPreview
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  file={file}
                  onRemove={() => removeFile(index)}
                  disabled={isSaving}
                />
              ))}
            </div>

            <p className="text-right text-xs text-slate-500">
              {files.length} of {MAX_FILES} files selected
            </p>
          </div>
        )}

          {files.length > 0 && (
            <p className="text-right text-xs text-slate-500">
              {files.length} of {MAX_FILES} files selected
            </p>
          )}
        </section>

        {/* ======================================
            VALIDATION ERRORS
        ====================================== */}

        {(Object.keys(errors).length > 0 ||
          submitError) && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <p className="text-sm font-semibold text-red-700">
              {submitError ??
                "Please correct the following fields:"}
            </p>

            {Object.keys(errors).length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-600">
                {Object.entries(errors).map(
                  ([field, error]) => (
                    <li key={field}>
                      {field}:{" "}
                      {error?.message ??
                        "Invalid value"}
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        )}

        {/* ======================================
            FOOTER ACTIONS
        ====================================== */}

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Fields marked{" "}
            <span className="text-red-500">
              *
            </span>{" "}
            are required
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving ||
                isReferenceLoading ||
                isReferenceError
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {isSaving
                ? "Saving Request..."
                : "Submit Request"}
            </button>
          </div>
        </div>
      </form>

      {/* ======================================
          ATTACHMENT PREVIEW MODAL
      ====================================== */}

      {preview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closePreview();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Preview ${preview.file.name}`}
              className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            >
              {/* PREVIEW HEADER */}

              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  {isImageFile(
                    preview.file
                  ) ? (
                    <FileImage className="h-5 w-5 shrink-0 text-blue-600" />
                  ) : (
                    <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                  )}

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {preview.file.name}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatFileSize(
                        preview.file.size
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* DOWNLOAD */}

                  <button
                    type="button"
                    onClick={() =>
                      downloadFile(
                        preview.file
                      )
                    }
                    title="Download file"
                    aria-label="Download file"
                    className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    <Download className="h-5 w-5" />
                  </button>

                  {/* CLOSE */}

                  <button
                    type="button"
                    onClick={closePreview}
                    title="Close preview"
                    aria-label="Close preview"
                    className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* PREVIEW BODY */}

              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-3 sm:p-5">
                {isImageFile(
                  preview.file
                ) ? (
                  // Blob URLs are local previews, not remote Next.js assets.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                ) : isPdfFile(
                    preview.file
                  ) ? (
                  <iframe
                    src={preview.url}
                    title={preview.file.name}
                    className="h-full w-full rounded-lg border-0 bg-white shadow-sm"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />

                    <p className="text-sm text-slate-500">
                      Preview is not available
                      for this file type.
                    </p>
                  </div>
                )}
              </div>

              {/* PREVIEW FOOTER */}

              <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-3">
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
