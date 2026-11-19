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
  "IN_PROGRESS",
  "CANCELLED"
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




export const addWorkingPermitRemarkSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Remark description is required")
    .max(2000, "Maximum 2000 characters"),
});

export type AddWorkingPermitRemarkInput = z.infer<typeof addWorkingPermitRemarkSchema>;

export const workingPermitRemarkSchema = z.object({
  id: z.number(),
  description: z.string(),
  createdAt: z.string(),

  createdBy: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export type WorkingPermitRemark = z.infer<typeof workingPermitRemarkSchema>;




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



export const permitApprovalSchema = z.object({
  id: z.string(),
  sequence: z.number().int().positive(),
  role: z.enum(["CHECKER", "FIRST_APPROVER", "FINAL_APPROVER"]),
  approverId: z.number().int().positive(),
  approverName: z.string(),
  approvedAt: z.string().nullable(),
  status: workingPermitStatus,
});
export type PermitApproval = z.infer<typeof permitApprovalSchema>;

export const workingPermitResponseSchema = z.object({
  id: z.string(),
  referenceNumber: z.string(),
  requestToId: z.number(),
  requestTo: z.string(),
  canEdit: z.boolean(),
  remarksList: z.array(workingPermitRemarkSchema),
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
  status: workingPermitStatus,
  statusAt: z.string().nullable(),
  receivedById: z.number().int().nullable(),
  receivedAt: z.string().nullable(),
  approvals: z.array(permitApprovalSchema),
  attachments: z.array(workingPermitAttachmentSchema),
  canApproveChecker: z.boolean(),
  canApproveFirstApprover: z.boolean(),
  canApproveFinalApprover: z.boolean(),
  canReceiveTroubleshooter: z.boolean(),
  canCompleteTroubleshooter: z.boolean(),
  //remarkEntries: z.array(workingPermitRemarkSchema),
  canAddRemarks: z.boolean(),
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



export const rejectWorkingPermitSchema = z.object({
  rejectRemarks: z.string().trim().min(5).max(500),
});