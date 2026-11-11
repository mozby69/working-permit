import { z } from "zod";


export const levelEnum = z.enum([
  "LEVEL_1",
  "LEVEL_2",
]);

export const workingPermitStatus = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "IN_PROGRESS"
]);

export const addRequestSchema = z.object({
 // referenceNumber: z.string().trim().min(1, "Reference number is required"),
  requestToId: z.number().int().positive("Please select a request recipient"),
  fromId: z.number().int().positive("Please select a department or branch"),
  requestLevel: levelEnum,
  date: z.date().optional(),
  requestFor: z.string().trim().min(1, "Request description is required"),
  branchDepartmentId:z.number().int().positive("Please select a department or branch"),
  requestedBy: z.string().trim().min(1, "Requested by is required"),
  checkedBy: z.string().trim().min(1, "Checked by is required"),
  attachment: z.string().optional(),
  status: workingPermitStatus.default("PENDING"),
  CheckedStatus: workingPermitStatus.default("PENDING"),
  approvedFinalApprover: workingPermitStatus.default("PENDING"),
  approvedFirstApprover: workingPermitStatus.default("PENDING"),
});

export type AddRequestSchema = z.output<typeof addRequestSchema>;
export type AddRequestInput = z.input<typeof addRequestSchema>;



//***************************************** */

export const workingPermitResponseSchema = z.object({
  id: z.string(),
  referenceNumber: z.string(),
  requestToId: z.number(),
  requestTo: z.string(),

  // Related WorkerList record
  requestToWorker: z.object({
    id: z.number(),
    workerName: z.string(),
    approvedBy: z.string(),
    finalApprovedBy: z.string(),
  }),

  requestLevel: levelEnum,
  date: z.string(),
  requestFor: z.string(),
  requestedBy: z.string(),
  checkedBy: z.string().nullable(),
  attachment: z.string().nullable(),
  status: workingPermitStatus,
  CheckedStatus: workingPermitStatus,
  approvedFinalApprover: workingPermitStatus,
  approvedFirstApprover: workingPermitStatus,

  fromDepartment: z.object({
    entityName: z.string(),
  }),

  branchDepartment: z.object({
    entityName: z.string(),
  }),
});

export const wpListResponseSchema = z.object({
  success: z.boolean(),

  data: z.array(workingPermitResponseSchema),

  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type WorkingPermitResponse = z.infer<
  typeof workingPermitResponseSchema
>;

export type WPListResponse = z.infer<
  typeof wpListResponseSchema
>;
