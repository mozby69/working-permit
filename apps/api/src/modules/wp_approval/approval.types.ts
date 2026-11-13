
// export type ApprovalStage =
//   | "CHECKER"
//   | "FIRST_APPROVER"
//   | "FINAL_APPROVER";

// export type ApprovalResult = {
//   workingPermitId: string;
//   sequence: number;
//   stage: ApprovalStage;
//   status: "APPROVED";
// };


export type ApprovalService = (
  workingPermitId: string,
  userId: number
) => Promise<{
  workingPermitId: string;
  sequence: number;
  stage: string;
  status: "APPROVED";
}>;