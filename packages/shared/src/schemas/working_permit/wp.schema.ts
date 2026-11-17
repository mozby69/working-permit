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

  requestToId: z.number().int().positive("Please select a request recipient"),
  fromId: z.number().int().positive("Please select a department or branch"),
  requestLevel: levelEnum,
  date: z.date().optional(),
  requestFor: z.string().trim().min(1, "Request description is required"),
  branchDepartmentId:z.number().int().positive("Please select a department or branch"),
  requestedBy: z.string().trim().min(1, "Requested by is required"),
  checkedBy: z.string().trim().min(1, "Checked by is required"),
  attachment: z.string().max(500).optional(),

});
export const updateWorkingPermitSchema = addRequestSchema.pick({
    requestToId: true,
    fromId: true, 
    requestLevel: true,
    requestFor: true,
    branchDepartmentId: true, 
    requestedBy: true, 
    checkedBy: true
   });
export type UpdateWorkingPermitInput = z.infer<typeof updateWorkingPermitSchema>;
export type AddRequestSchema = z.output<typeof addRequestSchema>;
export type AddRequestInput = z.input<typeof addRequestSchema>;



//***************************************** */


export const workingPermitAttachmentSchema = z.object({
  id: z.string(),
  workingPermitId: z.string(),
  originalName: z.string(),
  storedName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  createdAt: z.string(),
});

export type WorkingPermitAttachment = z.infer<typeof workingPermitAttachmentSchema>;



export const workingPermitResponseSchema = z.object({
  id: z.string(),
  referenceNumber: z.string(),
  requestToId: z.number(),
  requestTo: z.string(),
  // fromId: z.number(),
  // branchDepartmentId: z.number(),
  canEdit: z.boolean(),
  requestToWorker: z.object({
    id: z.number(),
    workerName: z.string(),

    firstApproverUserId: z.number().nullable(),
    finalApproverUserId: z.number().nullable(),

    firstApprover: z.object({
      id: z.number(),
      name: z.string(),
    }).nullable(),

    finalApprover: z.object({
      id: z.number(),
      name: z.string(),
    }).nullable(),
  }),
  requestLevel: levelEnum,
  date: z.string(),
  requestFor: z.string(),
  requestedBy: z.string(),
  checkedBy: z.string().nullable(),
  attachments: z.array(workingPermitAttachmentSchema),
  canApproveChecker: z.boolean(),
  canApproveFirstApprover: z.boolean(),
  canApproveFinalApprover: z.boolean(),
  canReceiveTroubleshooter: z.boolean(),
  canCompleteTroubleshooter: z.boolean(),

  fromDepartment: z.object({
    id: z.number(),
    entityName: z.string(),
  }),

  branchDepartment: z.object({
    id: z.number(),
    entityName: z.string(),
  }),

  approval: z.object({
    status: workingPermitStatus,
    checkedStatus: workingPermitStatus,
    firstApproverStatus: workingPermitStatus,
    finalApproverStatus: workingPermitStatus,
    receivedById: z.number().int().nullable(),
    receivedAt: z.string().nullable(),
    statusAt: z.string().nullable(),
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


export const approveWorkingPermitParamsSchema = z.object({
  id: z.uuid(),
});