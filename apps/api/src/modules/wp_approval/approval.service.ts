
import type { ApprovalResult } from "@repo/shared";

import {
  approveWorkingPermitRepo,
  receiveWorkingPermitRepo,
  completeWorkingPermitRepo,
  rejectWorkingPermitRepo,
} from "./approval.repository.js";

// Approves the assigned Checker (sequence 1 for both levels).
export async function approveCheckerService(
  workingPermitId: string,
  userId: number
): Promise<ApprovalResult> {
  return approveWorkingPermitRepo(
    workingPermitId,
    userId,
    "CHECKER"
  );
}

// Final approval changes WorkingPermit.status to APPROVED.
export async function approveFinalApproverService(
  workingPermitId: string,
  userId: number
): Promise<ApprovalResult> {
  return approveWorkingPermitRepo(
    workingPermitId,
    userId,
    "FINAL_APPROVER"
  );
}

// FIRST_APPROVER is only required for Level 2.
export async function approveFirstApproverService(
  workingPermitId: string,
  userId: number
): Promise<ApprovalResult> {
  return approveWorkingPermitRepo(
    workingPermitId,
    userId,
    "FIRST_APPROVER"
  );
}

// ==================================================
// TROUBLESHOOTER - RECEIVE
// ==================================================

export async function receiveWorkingPermitService(
  workingPermitId: string,
  userId: number
) {
  return receiveWorkingPermitRepo(
    workingPermitId,
    userId
  );
}

// ==================================================
// TROUBLESHOOTER - COMPLETE
// ==================================================

export async function completeWorkingPermitService(
  workingPermitId: string,
  userId: number
) {
  return completeWorkingPermitRepo(
    workingPermitId,
    userId
  );
}




//REJECT


export async function rejectCheckerService(
  workingPermitId: string,
  userId: number,
  rejectRemarks: string
) {
  return rejectWorkingPermitRepo(
    workingPermitId,
    userId,
    "CHECKER",
    rejectRemarks
  );
}

export async function rejectFirstApproverService(
  workingPermitId: string,
  userId: number,
  rejectRemarks: string
) {
  return rejectWorkingPermitRepo(
    workingPermitId,
    userId,
    "FIRST_APPROVER",
    rejectRemarks
  );
}

export async function rejectFinalApproverService(
  workingPermitId: string,
  userId: number,
  rejectRemarks: string
) {
  return rejectWorkingPermitRepo(
    workingPermitId,
    userId,
    "FINAL_APPROVER",
    rejectRemarks
  );
}
