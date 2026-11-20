
import { z } from "zod";
import { registerUserSchema } from "../../authentication/user.schema";

// ==========================================
// REUSABLE SCHEMAS
// ==========================================

const roleIdsSchema = z
  .array(z.number().int().positive())
  .min(1, "At least one role is required");

const branchIdsSchema = z.array(
  z.number().int().positive()
);

// ==========================================
// CREATE USER SCHEMA
// ==========================================

export const createUserSchema =
  registerUserSchema.extend({
    roleIds: roleIdsSchema,

    // Optional branch assignment
    branchIds: branchIdsSchema.default([]),
  });

export type CreateUserSchema =
  z.infer<typeof createUserSchema>;

// ==========================================
// UPDATE USER SCHEMA
// ==========================================

export const updateUserSchema = createUserSchema
  .omit({
    password: true,
  })
  .partial()
  .extend({
    roleIds: roleIdsSchema.optional(),

    branchIds: branchIdsSchema.optional(),

    password: z
      .union([
        z.string().min(
          8,
          "Password must be at least 8 characters"
        ),
        z.literal(""),
      ])
      .optional(),
  });

export type UpdateUserSchema =
  z.infer<typeof updateUserSchema>;

// ==========================================
// USER FORM SCHEMA
// ==========================================

export const userFormSchema = createUserSchema
  .omit({
    password: true,
  })
  .extend({
    password: z.string(),

    isActive: z.boolean().optional(),
  });

// Use z.input because branchIds has a default.
export type UserFormInput =
  z.input<typeof userFormSchema>;

export type FormValues =
  z.output<typeof userFormSchema>;
