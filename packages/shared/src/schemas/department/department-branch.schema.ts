
import { z } from "zod";

export const createDepartmentBranchSchema = z.object({
  entityName: z
    .string()
    .trim()
    .min(1, "Branch or department name is required")
    .max(100, "Maximum 100 characters"),

  isBranch: z.boolean().default(true),

  checkerId: z.number().int().positive().nullable().optional(),
});

export const updateDepartmentBranchSchema =
  createDepartmentBranchSchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "At least one field is required" }
    );

export const departmentBranchIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateDepartmentBranchInput = z.input<
  typeof createDepartmentBranchSchema
>;

export type UpdateDepartmentBranchInput = z.infer<
  typeof updateDepartmentBranchSchema
>;
