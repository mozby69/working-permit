import type { ApprovalStage } from "@repo/shared";

export const APPROVAL_STAGES = {
  CHECKER: {
    sequence: 1,
    nextSequence: 2,
    role: "CHECKER",
  },
  FIRST_APPROVER: {
    sequence: 2,
    nextSequence: 3,
    role: "APPROVER",
  },
  FINAL_APPROVER: {
    sequence: 3,
    nextSequence: 4,
    role: "APPROVER",
  },
} as const satisfies Record<
  ApprovalStage,
  {
    sequence: number;
    nextSequence: number;
    role: string;
  }
>;