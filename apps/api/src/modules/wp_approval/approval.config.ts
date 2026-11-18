import type { ApprovalStage } from "@repo/shared";
import type { RequestLevel } from "../../../generated/prisma/client.js";

export type WorkflowRole = ApprovalStage | "TROUBLESHOOTER";

export const APPROVAL_WORKFLOW: Record<RequestLevel, readonly WorkflowRole[]> = {
  LEVEL_1: ["CHECKER", "FINAL_APPROVER", "TROUBLESHOOTER"],
  LEVEL_2: ["CHECKER", "FIRST_APPROVER", "FINAL_APPROVER", "TROUBLESHOOTER"],
};

export function getStageSequence(level: RequestLevel, role: WorkflowRole): number {
  const sequence = APPROVAL_WORKFLOW[level].indexOf(role);
  if (sequence === -1) {
    throw new Error(`Role ${role} is not part of the ${level} workflow.`);
  }
  return sequence + 1;
}
