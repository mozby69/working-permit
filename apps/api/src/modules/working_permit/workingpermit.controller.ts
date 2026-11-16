import { addRequestSchema, approveWorkingPermitParamsSchema } from '@repo/shared';
import * as workingPermitService from './workingpermit.service';

import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from '@/lib/http/response';
import { emitUserCreated } from '@/socket/emitters/user.emitter';
import { emitWPCreated, emitWPUpdated } from '@/socket/emitters/wp.emitter';
import fs from "node:fs/promises";
import { UploadedAttachment } from './workingpermit.types';


export async function createRequestController(
  req: Request,
  res: Response,
  next: NextFunction
) {


  const uploadedFiles: Express.Multer.File[] = Array.isArray(req.files)
    ? req.files
    : [];

  const cleanupUploads = async () => {
    await Promise.all(
      uploadedFiles.map(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (error: unknown) {
          console.error(
            "Failed to clean up uploaded attachment:",
            error
          );
        }
      })
    );
  };

  try {
    const userId = req.user?.id;

    if (
      typeof userId !== "number" ||
      !Number.isSafeInteger(userId) ||
      userId <= 0
    ) {
      await cleanupUploads();

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Multipart form fields arrive as strings.
    const parsed = addRequestSchema.safeParse({
      ...req.body,
      requestToId: Number(req.body.requestToId),
      fromId: Number(req.body.fromId),
      branchDepartmentId: Number(req.body.branchDepartmentId),

      // Do not accept client-supplied stored filenames.
      attachment: undefined,
    });

    if (!parsed.success) {
      await cleanupUploads();

      return res.status(400).json({
        success: false,
        message: "Invalid working permit request",
        errors: parsed.error.flatten(),
      });
    }

    const attachments: UploadedAttachment[] = uploadedFiles.map(
      (file) => ({
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        fileSize: file.size,
      })
    );

    const result =
      await workingPermitService.createRequestService(
        parsed.data,
        userId,
        attachments
      );

    // The database transaction has succeeded.
    // Event errors should not trigger deletion of saved files.
    try {
      emitWPCreated({ id: result.id });
    } catch (eventError: unknown) {
      console.error("Failed to emit Working Permit event:", eventError);
    }

    return res.status(201).json({
      success: true,
      message: "Working permit request created successfully",
      data: result,
    });
  } catch (error: unknown) {
    await cleanupUploads();
    next(error);
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


export async function getWorkingPermitController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;

    if (
      !user ||
      typeof user.id !== "number" ||
      !Number.isSafeInteger(user.id) ||
      user.id <= 0
    ) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const userId = user.id;
    const roles = user.roles;

    if (!Array.isArray(roles)) {
      res.status(403).json({
        success: false,
        message: "User roles are unavailable",
      });
      return;
    }

    const result = await workingPermitService.getWorkingPermitService({
        page: Math.max(1, Number(req.query.page) || 1),
        limit: Math.min(100, Math.max(1, Number(req.query.limit) || 10)),
        search: typeof req.query.search === "string"
            ? req.query.search.trim()
            : undefined,userId,roles});

    sendSuccess(res, result.data, {
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getWorkerListController(req: Request,res: Response,next: NextFunction): Promise<void> {
  try {
    const workers = await workingPermitService.getWorkerListService();

    sendSuccess(res, workers);
  } catch (error) {
    next(error);
  }
}







// export async function approveWorkingPermitByCheckerController(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> {
//   try {
//     const userId = req.user?.id;

//     if (
//       typeof userId !== "number" ||
//       !Number.isSafeInteger(userId) ||
//       userId <= 0
//     ) {
//       res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//       return;
//     }

//     const parsed = approveWorkingPermitParamsSchema.safeParse(
//       req.params
//     );

//     if (!parsed.success) {
//       res.status(400).json({
//         success: false,
//         message: "Invalid Working Permit ID",

//       });
//       return;
//     }

//     const result =
//       await workingPermitService.approveWorkingPermitByCheckerService(
//         parsed.data.id,
//         userId
//       );

//       emitWPUpdated({
//       id: result.workingPermitId,
//     });


//     res.status(200).json({
//       success: true,
//       message: "Working Permit approved by Checker successfully",
//       data: result,
//     });
//   } catch (error: unknown) {
//     next(error);
//   }
// }