import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  approveCheckerService,
  approveFirstApproverService,
  approveFinalApproverService,
} from "./approval.service.js";

import { emitWPUpdated } from "@/socket/emitters/wp.emitter.js"; 
import { ApprovalService } from "./approval.types.js";




function createApprovalController(
  service: ApprovalService
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

      const result = await service(
        workingPermitId,
        userId
      );

      emitWPUpdated({
        id: result.workingPermitId,
      });

      res.status(200).json({
        success: true,
        message: `${result.stage} approval successful`,
        data: result,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

// Sequence 1 → 2
export const approveCheckerController =
  createApprovalController(approveCheckerService);

// Sequence 2 → 3
export const approveFirstApproverController =
  createApprovalController(approveFirstApproverService);

// Sequence 3 → 4
export const approveFinalApproverController =
  createApprovalController(approveFinalApproverService);