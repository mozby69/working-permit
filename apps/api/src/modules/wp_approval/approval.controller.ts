
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  approveCheckerService,
  approveFirstApproverService,
  approveFinalApproverService,
  receiveWorkingPermitService,
  completeWorkingPermitService,
  rejectCheckerService,
  rejectFirstApproverService,
  rejectFinalApproverService,
} from "./approval.service.js";

import { emitWPUpdated } from "@/socket/emitters/wp.emitter.js";

import type {
  ApprovalService,
  RejectionService,
} from "./approval.types.js";
import { rejectWorkingPermitSchema } from "@repo/shared";

// ==================================================
// SHARED VALIDATION
// ==================================================

function getRequestContext(
  req: Request
):
  | {
      valid: true;
      userId: number;
      workingPermitId: string;
    }
  | {
      valid: false;
      status: number;
      message: string;
    } {
  const userId = req.user?.id;
  const workingPermitId = req.params.id;

  if (
    typeof userId !== "number" ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    return {
      valid: false,
      status: 401,
      message: "Unauthorized.",
    };
  }

  if (
    typeof workingPermitId !== "string" ||
    !workingPermitId.trim()
  ) {
    return {
      valid: false,
      status: 400,
      message: "Invalid Working Permit ID.",
    };
  }

  return {
    valid: true,
    userId,
    workingPermitId,
  };
}

// ==================================================
// APPROVAL CONTROLLER FACTORY
// ==================================================

function createApprovalController(
  service: ApprovalService
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const context = getRequestContext(req);

      if (!context.valid) {
        res.status(context.status).json({
          success: false,
          message: context.message,
        });
        return;
      }

      const result = await service(
        context.workingPermitId,
        context.userId
      );

      emitWPUpdated({
        id: result.workingPermitId,
      });

      const stageLabels: Record<string, string> = {
        CHECKER: "Checker",
        FIRST_APPROVER: "First Approver",
        FINAL_APPROVER: "Final Approver",
      };

      const stageName =
        stageLabels[result.stage] ?? result.stage;

      res.status(200).json({
        success: true,
        message: `${stageName} approval successful.`,
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

// ==================================================
// CHECKER
// ==================================================

export const approveCheckerController =
  createApprovalController(
    approveCheckerService
  );

// ==================================================
// FINAL APPROVER
// LEVEL 1: sequence 2, LEVEL 2: sequence 3
// ==================================================

export const approveFinalApproverController =
  createApprovalController(
    approveFinalApproverService
  );

// ==================================================
// FIRST APPROVER
// LEVEL 2 ONLY: sequence 2
// ==================================================

export const approveFirstApproverController =
  createApprovalController(
    approveFirstApproverService
  );

// ==================================================
// TROUBLESHOOTER - RECEIVE
// ==================================================

export async function receiveWorkingPermitController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const context = getRequestContext(req);

    if (!context.valid) {
      res.status(context.status).json({
        success: false,
        message: context.message,
      });
      return;
    }

    const result = await receiveWorkingPermitService(
      context.workingPermitId,
      context.userId
    );

    emitWPUpdated({
      id: result.workingPermitId,
    });

    res.status(200).json({
      success: true,
      message: "Working Permit received successfully.",
      data: result,
    });
  } catch (error: unknown) {
    next(error);
  }
}

// ==================================================
// TROUBLESHOOTER - COMPLETE
// ==================================================

export async function completeWorkingPermitController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const context = getRequestContext(req);

    if (!context.valid) {
      res.status(context.status).json({
        success: false,
        message: context.message,
      });
      return;
    }

    const result = await completeWorkingPermitService(
      context.workingPermitId,
      context.userId
    );

    emitWPUpdated({
      id: result.workingPermitId,
    });

    res.status(200).json({
      success: true,
      message: "Working Permit completed successfully.",
      data: result,
    });
  } catch (error: unknown) {
    next(error);
  }
}







// ==========================================
// REJECTION CONTROLLER FACTORY
// ==========================================

export function createRejectionController(
  service: RejectionService
) {
  return async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const workingPermitId = req.params.id;


    if (!userId || !Number.isSafeInteger(userId)) {
      throw new Error("Unauthorized user.");
    }


    if (
      typeof workingPermitId !== "string" ||
      !workingPermitId.trim()
    ) {
      throw new Error("Invalid Working Permit ID.");
    }


    const { rejectRemarks } =
      rejectWorkingPermitSchema.parse(req.body);


    const result = await service(
      workingPermitId,
      userId,
      rejectRemarks
    );

 
    emitWPUpdated({
      id: result.workingPermitId,
    });

    return res.status(200).json({
      success: true,
      message: "Working Permit rejected successfully.",
      data: result,
    });
  };
}

// ==========================================
// CHECKER
// ==========================================

export const rejectCheckerController = createRejectionController(rejectCheckerService);

// ==========================================
// FIRST APPROVER
// ==========================================

export const rejectFirstApproverController = createRejectionController(rejectFirstApproverService);

// ==========================================
// FINAL APPROVER
// ==========================================

export const rejectFinalApproverController = createRejectionController(rejectFinalApproverService);
