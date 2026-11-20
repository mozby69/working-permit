import { addRequestSchema, addWorkingPermitRemarkSchema, approveWorkingPermitParamsSchema, checkDuplicateWorkingPermitSchema, myApprovedPermitQuerySchema, updateWorkingPermitSchema } from '@repo/shared';
import * as workingPermitService from './workingpermit.service';

import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from '@/lib/http/response';
import { emitUserCreated } from '@/socket/emitters/user.emitter';
import { emitWPCreated, emitWPUpdated } from '@/socket/emitters/wp.emitter';
import { AttachmentParams, UploadedAttachment } from './workingpermit.types';
import { findAttachmentRepo } from './workingpermit.repository';
import { UPLOAD_DIRECTORY } from '@/middleware/uploadAttachement';
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs/promises";
import { emitNotificationCreated } from '@/socket/emitters/notification.emitter';
import z from 'zod';


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

   const { permit, notification } =
      await workingPermitService.createRequestService(
        parsed.data,
        userId,
        attachments
      );

    // The transaction has committed successfully.
    try {
      // Refresh the Working Permit table.
      emitWPCreated({
        id: permit.id,
      });
    } catch (error: unknown) {
      console.error(
        "Failed to emit Working Permit event:",
        error
      );
    }

    try {
      // Notify the assigned Checker in real time.
      emitNotificationCreated({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
      });
    } catch (error: unknown) {
      console.error(
        "Failed to emit notification event:",
        error
      );
    }

    return res.status(201).json({
      success: true,
      message: "Working permit request created successfully",
      data: permit,
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

    if (!Array.isArray(user.roles)) {
      res.status(403).json({
        success: false,
        message: "User roles are unavailable",
      });
      return;
    }

    // Pagination
    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );

    // Search
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    // Worker filter
    const rawRequestToId = req.query.requestToId;

    let requestToId: number | undefined;

    if (rawRequestToId !== undefined) {
      if (
        typeof rawRequestToId !== "string" ||
        !/^[1-9]\d*$/.test(rawRequestToId)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid request recipient",
        });
        return;
      }

      requestToId = Number(rawRequestToId);

      if (!Number.isSafeInteger(requestToId)) {
        res.status(400).json({
          success: false,
          message: "Invalid request recipient",
        });
        return;
      }
    }

    // Date filter
    const rawDate = req.query.date;

    let date: string | undefined;

    if (rawDate !== undefined) {
      if (
        typeof rawDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD.",
        });
        return;
      }

      const parsedDate = new Date(
        `${rawDate}T00:00:00.000Z`
      );

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== rawDate
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid date",
        });
        return;
      }

      date = rawDate;
    }

    const result =
      await workingPermitService.getWorkingPermitService({
        page,
        limit,
        search,
        requestToId,
        date,
        userId: user.id,
        roles: user.roles,
      });

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








export async function viewAttachmentController(
  req: Request<AttachmentParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { permitId, attachmentId } = req.params;

    if (!permitId || !attachmentId) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment request",
      });
    }

    const attachment = await findAttachmentRepo(
      permitId,
      attachmentId
    );

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    // Required before serving: verify that req.user is authorized
    // to view the Working Permit associated with this attachment.

    const filePath = path.join(
      UPLOAD_DIRECTORY,
      path.basename(attachment.storedName)
    );

    try {
      const fileInfo = await stat(filePath);

      if (!fileInfo.isFile()) {
        return res.status(404).json({
          success: false,
          message: "Attachment file not found",
        });
      }
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return res.status(404).json({
          success: false,
          message: "File not found on server",
        });
      }

      throw error;
    }

    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      "inline"
    );

    const stream = createReadStream(filePath);

    stream.on("error", (error: Error) => {
      if (!res.headersSent) {
        next(error);
      } else {
        res.destroy(error);
      }
    });

    stream.pipe(res);
  } catch (error: unknown) {
    next(error);
  }
}






export async function updateWorkingPermitController(req: Request, res: Response, next: NextFunction) {
  const files: Express.Multer.File[] = Array.isArray(req.files) ? req.files : [];
  let committed = false;
  const cleanup = async () => {
    if (!committed) await Promise.all(files.map(file => fs.unlink(file.path).catch(() => undefined)));
  };
  try {
    const userId = req.user?.id;
    if (typeof userId !== "number" || !Number.isSafeInteger(userId) || userId <= 0) {
      await cleanup();
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const parsedId = approveWorkingPermitParamsSchema.safeParse({ id: req.params.id });
    const parsed = updateWorkingPermitSchema.safeParse({
      ...req.body,
      requestToId: Number(req.body.requestToId),
      fromId: Number(req.body.fromId),
      branchDepartmentId: Number(req.body.branchDepartmentId),
    });
    if (!parsedId.success || !parsed.success) {
      await cleanup();
      return res.status(400).json({
        success: false,
        message: "Invalid working permit details",
        errors: parsed.success ? undefined : parsed.error.flatten(),
      });
    }

    const result = await workingPermitService.updateWorkingPermitService(
      parsedId.data.id,
      userId,
      parsed.data,
      files.map(file => ({
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        fileSize: file.size,
      }))
    );

    if (result.outcome !== "UPDATED") {
      await cleanup();
      const status = result.outcome === "NOT_FOUND" ? 404
        : result.outcome === "FORBIDDEN" ? 403
        : result.outcome === "LOCKED" ? 409 : 400;
      const message = result.outcome === "LOCKED"
        ? "Editing is no longer allowed because the checker has processed this permit."
        : result.outcome === "FORBIDDEN"
        ? "Only the creator can edit this working permit."
        : result.outcome === "NOT_FOUND"
        ? "Working permit not found."
        : result.outcome === "TOO_MANY_FILES"
        ? "A permit can have a maximum of 5 attachments."
        : "Invalid department, checker, branch or request recipient.";
      return res.status(status).json({ success: false, message });
    }

    committed = true;
    try { emitWPUpdated({ id: result.id }); }
    catch (error) { console.error("Failed to emit permit update event:", error); }
    return res.status(200).json({
      success: true, message: "Working permit updated successfully", data: { id: result.id },
    });
  } catch (error: unknown) {
    await cleanup();
    next(error);
  }
}







export async function addWorkingPermitRemarkController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const workingPermitId = req.params.id;

    if (
      typeof userId !== "number" ||
      !Number.isSafeInteger(userId) ||
      userId <= 0
    ) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (
      typeof workingPermitId !== "string" ||
      !workingPermitId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid Working Permit ID",
      });
      return;
    }

    const parsed = addWorkingPermitRemarkSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid remark",
        errors: parsed.error.flatten(),
      });
      return;
    }

    const result =
      await workingPermitService.addWorkingPermitRemarkService(
        workingPermitId,
        userId,
        parsed.data.description
      );

    // The service returns { success: true, data: remark }
    // rather than { outcome: "CREATED", remark }.

    try {
      emitWPUpdated({ id: workingPermitId });
    } catch (error: unknown) {
      console.error(
        "Failed to emit remark event:",
        error
      );
    }

    res.status(201).json({
      success: true,
      message: "Remark added successfully",
      data: {
        id: result.data.id,
        description: result.data.description,
        createdAt: result.data.createdAt.toISOString(),
        createdBy: result.data.createdBy,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}



export async function getAllRequestTypesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const requestTypes = await workingPermitService.getAllRequestTypesService();

    res.status(200).json({
      success: true,
      message: "Request types retrieved successfully.",
      data: requestTypes,
    });
  } catch (error: unknown) {
    next(error);
  }
}





export async function checkDuplicateWorkingPermitController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed =
      checkDuplicateWorkingPermitSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid duplicate check parameters.",
        errors: parsed.error.flatten(),
      });

      return;
    }

    const result =
      await workingPermitService.checkDuplicateWorkingPermitService(
        parsed.data
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    next(error);
  }
}


export async function getMyApprovedPermitController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // ==========================================
    // AUTHENTICATED USER
    // ==========================================

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

    // ==========================================
    // VALIDATE QUERY PARAMETERS
    // ==========================================

    const parsed = myApprovedPermitQuerySchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: z.flattenError(parsed.error),
      });
      return;
    }

    const filters = parsed.data;

    // ==========================================
    // GET APPROVED PERMITS
    // ==========================================

    const result =
      await workingPermitService.getMyApprovedPermitService(
        user.id,
        filters
      );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Approved permits retrieved successfully",
      data: result.data,
      pagination: result.pagination,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
}