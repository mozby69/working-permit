
import type { ApprovalResult } from "@repo/shared";

import {
  approveWorkingPermitRepo,
  receiveWorkingPermitRepo,
  completeWorkingPermitRepo,
} from "./approval.repository.js";

// ==================================================
// CHECKER APPROVAL
// LEVEL 1: 1 -> 2 (FIRST APPROVER)
// LEVEL 2: 1 -> 2 (FINAL APPROVER)
// ==================================================

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

// ==================================================
// FINAL APPROVER
// LEVEL 2 ONLY: 2 -> 3 (FIRST APPROVER)
// ==================================================

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

// ==================================================
// FIRST APPROVER
// LEVEL 1: 2 -> 3 (TROUBLESHOOTER)
// LEVEL 2: 3 -> 4 (TROUBLESHOOTER)
// ==================================================

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
