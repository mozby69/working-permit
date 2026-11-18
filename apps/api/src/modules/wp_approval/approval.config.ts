import type { ApprovalStage } from "@repo/shared";
import type { RequestLevel } from "../../../generated/prisma/client.js";

<<<<<<< HEAD
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
=======
export function getApprovalSequence(level: RequestLevel, stage: ApprovalStage): number {
  if (stage === "CHECKER") return 1;
  if (stage === "FIRST_APPROVER" && level === "LEVEL_2") return 2;
  if (stage === "FINAL_APPROVER") return level === "LEVEL_1" ? 2 : 3;
  throw new Error("The requested role is not in this approval workflow.");
>>>>>>> feat/permit-status-and-approver-assignments
}
