
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

export type TroubleshooterResult = {
  workingPermitId: string;
  sequence: number;
  receivedById: number;
  status: "IN_PROGRESS" | "COMPLETED";
};




export type RejectionService = (
  workingPermitId: string,
  userId: number,
  rejectRemarks: string
) => Promise<{
  workingPermitId: string;
  sequence: number;
  stage: string;
  status: "REJECTED";
  statusAt: string;
}>;
