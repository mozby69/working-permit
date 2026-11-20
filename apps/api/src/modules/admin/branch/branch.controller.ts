import { NextFunction, Request, Response } from "express";
import { createDepartmentBranchService, deleteDepartmentBranchService, getBranchWorkingService, getDepartmentBranchesService, getPaginationDepartmentBranchesService, updateDepartmentBranchService } from "./branch.service";
import { createDepartmentBranchSchema, DepartmentBranchFilter, departmentBranchIdSchema, updateDepartmentBranchSchema } from "@repo/shared";
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


export async function getPaginationDepartmentBranchesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { isBranch, page, limit, search } = req.query;

    // Validate isBranch
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

    // Validate pagination
    const pageNumber = page === undefined ? 1 : Number(page);
    const limitNumber = limit === undefined ? 10 : Number(limit);

    if (
      !Number.isSafeInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isSafeInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    // Validate search
    if (
      search !== undefined &&
      typeof search !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Search must be a string",
      });
    }

    const filter: DepartmentBranchFilter = {
      isBranch:
        isBranch === undefined
          ? undefined
          : isBranch === "true",

      page: pageNumber,
      limit: limitNumber,
      search: typeof search === "string"
        ? search.trim()
        : undefined,
    };

    const result = await getPaginationDepartmentBranchesService(filter);

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
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


export async function getBranchWorkingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : "";

    const result = await getBranchWorkingService({
      userId,
      page,
      limit,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Branch working permits retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error)
  }
}