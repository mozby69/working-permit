import { approveWorkingPermitRepo } from "./approval.repository"; 

export async function approveCheckerService(
  workingPermitId: string,
  userId: number
) {
  return approveWorkingPermitRepo(
    workingPermitId,
    userId,
    "CHECKER"
  );
}

export async function approveFirstApproverService(
  workingPermitId: string,
  userId: number
) {
  return approveWorkingPermitRepo(
    workingPermitId,
    userId,
    "FIRST_APPROVER"
  );
}

export async function approveFinalApproverService(
  workingPermitId: string,
  userId: number
) {
  return approveWorkingPermitRepo(
    workingPermitId,
    userId,
    "FINAL_APPROVER"
  );
}