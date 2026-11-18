import type { ApprovalStage } from "@repo/shared";
import type { RequestLevel } from "../../../generated/prisma/client.js";

export function getApprovalSequence(level: RequestLevel, stage: ApprovalStage): number {
  if (stage === "CHECKER") return 1;
  if (stage === "FIRST_APPROVER" && level === "LEVEL_2") return 2;
  if (stage === "FINAL_APPROVER") return level === "LEVEL_1" ? 2 : 3;
  throw new Error("The requested role is not in this approval workflow.");
}
