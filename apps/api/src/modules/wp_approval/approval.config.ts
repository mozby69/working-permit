import type { ApprovalStage } from "@repo/shared";


type ApprovalStageConfig = {
  sequence: number;
  role: string;
};

export const APPROVAL_STAGES = {
  CHECKER: {
    sequence: 1,
    role: "CHECKER",
  },

  FIRST_APPROVER: {
    sequence: 2,
    role: "FIRST_APPROVER",
  },

  FINAL_APPROVER: {
    sequence: 3,
    role: "FINAL_APPROVER",
  },
} as const satisfies Record<
  ApprovalStage,
  ApprovalStageConfig
>;