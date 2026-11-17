import { ApprovalResult } from "@repo/shared";
import { approveWorkingPermitRepo, completeWorkingPermitRepo, receiveWorkingPermitRepo } from "./approval.repository"; 




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

// -------------------------------------------
// FIRST APPROVER
// Sequence 2 -> 3
// -------------------------------------------

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

// -------------------------------------------
// FINAL APPROVER
// Sequence 3 -> 4 (LEVEL_2 only)
// -------------------------------------------

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











export async function receiveWorkingPermitService(
  workingPermitId: string,
  userId: number
) {
  return receiveWorkingPermitRepo(
    workingPermitId,
    userId
  );
}

export async function completeWorkingPermitService(
  workingPermitId: string,
  userId: number
) {
  return completeWorkingPermitRepo(
    workingPermitId,
    userId
  );
}