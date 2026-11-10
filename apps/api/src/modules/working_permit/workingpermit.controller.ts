import { addRequestSchema } from '@repo/shared';
import * as workingPermitService from './workingpermit.service';

import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from '@/lib/http/response';


export async function createRequestController(
  req: Request,
  res: Response
) {
  try {
    // Validate request body
    const parsed = addRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid working permit request",
        errors: parsed.error.flatten(),
      });
    }

    // Verify authenticated user
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const validatedData = parsed.data;

    const result =
      await workingPermitService.createRequestService(
        validatedData,
        req.user.id
      );

    return res.status(201).json({
      success: true,
      message: "Working permit request created successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("Create working permit error:", error);



    return res.status(500).json({
      success: false,
      message: "Failed to create working permit request",
    });
  }
}


export async function getNextReferenceController(req: Request,res: Response) {
  try {
    const referenceNumber =  await workingPermitService.getNextReferenceService();

    return res.status(200).json({
      success: true,
      data: {
        referenceNumber,
      },
    });
  } catch (error: unknown) {
    console.error("Get next reference error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get next reference number",
    });
  }
}


export async function getDepartmentBranchesController(
  req: Request,
  res: Response
) {
  try {
    const departments =
      await workingPermitService.getDepartmentBranchesService();

    return res.status(200).json({
      success: true,
      message: "Departments and branches retrieved successfully",
      data: departments,
    });
  } catch (error: unknown) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve departments and branches",
    });
  }
}



export async function getWorkingPermitController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const result = await workingPermitService.getSubscriptionService({
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,

            search:
                typeof req.query.search === "string"
                    ? req.query.search.trim()
                    : undefined,
        
        });

        sendSuccess(res, result.data,{
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}