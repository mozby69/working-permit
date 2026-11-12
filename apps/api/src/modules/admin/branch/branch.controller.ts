import { NextFunction, Request, Response } from "express";
import { createDepartmentBranchService, deleteDepartmentBranchService, getDepartmentBranchesService, updateDepartmentBranchService } from "./branch.service";
import { createDepartmentBranchSchema, departmentBranchIdSchema, updateDepartmentBranchSchema } from "@repo/shared";
import { success } from "zod";


export async function getDepartmentBranchesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { isBranch } = req.query;
    if (
      isBranch !== undefined &&
      isBranch !== "true" &&
      isBranch !== "false"
    ) {
      return res.status(400).json({
        success: false,
        message: "isBranch must be true or false",
      });
    }

    const filter =
      isBranch === undefined
        ? undefined
        : isBranch === "true";

    const data = await getDepartmentBranchesService(filter);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}



export async function createDepartmentBranchController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try{
        const parsed = createDepartmentBranchSchema.safeParse(
            req.body
        );

        if(!parsed.success){
            return res.status(400).json({
                success: false,
                errors: parsed.error.flatten(),
            });
        }

        const data = await createDepartmentBranchService(
            parsed.data
        );

        return res.status(200).json({
            success: true,
            message: "Created successfully",
            data,
        });

    }catch(error){
    next(error)
    } 
}

export async function updateDepartmentBranchController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try{
        const params = departmentBranchIdSchema.safeParse(
            req.params
        );

        if(!params.success){
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
            });
        }

        const parsed = updateDepartmentBranchSchema.safeParse(
            req.body
        );

        if(!parsed.success){
            return res.status(400).json({
                success: false,
                errors: parsed.error.flatten(),
            });
        }

        const data = await updateDepartmentBranchService(
            params.data.id,
            parsed.data
        )

        return res.status(200).json({
            success: true,
            message: "Update successfully",
            data,
        });

    }catch(error){
        next(error);
    }
}


export async function deleteDepartmentBranchController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try{
        const params = departmentBranchIdSchema.safeParse(
            req.params
        );

        if(!params.success){
            return res.status(400).json({
                success: false,
                messsage: "Invalid ID",
            });
        }

        await deleteDepartmentBranchService(params.data.id);

        return res.status(200).json({
            success: true,
            message: "Deleted successfully",
        });

    }catch(error){
        next(error)
    }
}