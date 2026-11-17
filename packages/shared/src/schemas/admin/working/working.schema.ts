import z from "zod";


export const createWorkingSchema = z.object({
    workerName: z
        .string()
        .trim()
        .min(1, "Worker name is required"),

     firstApproverUserId: z
        .number()
        .int()
        .positive()
        .min(1, "First approver is required"),


     finalApproverUserId: z
        .number()
        .int()
        .positive()
        .min(1, "Final approver is required"),
    
})

export const updateWorkingSchema =
  createWorkingSchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "At least one field is required" }
    );


export const workingIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateWorkingInput = z.input<
    typeof createWorkingSchema
>;


 export type UpdateWorkingInput = z.input<
    typeof updateWorkingSchema
 >