import { Prisma, RequestLevel, WorkingPermitStatus } from "../../../generated/prisma/client.js";
import { prisma } from "@/lib/database/prisma.js";
import type { ApprovalResult, ApprovalStage } from "@repo/shared";
import type { TroubleshooterResult } from "./approval.types";
import { getStageSequence } from "./approval.config.js";

function assignedToStage(stage: ApprovalStage, userId: number): Prisma.WorkingPermitWhereInput {
  if (stage === "CHECKER") return { fromDepartment: { is: { checkerId: userId } } };
  if (stage === "FIRST_APPROVER") return { WorkerList: { is: { firstApproverUserId: userId } } };
  return { WorkerList: { is: { finalApproverUserId: userId } } };
}

function assignedTroubleshooter(userId: number): Prisma.WorkingPermitWhereInput {
  return {
    WorkerList: { is: { troubleshooters: { some: { id: userId, isActive: true } } } },
  };
}

export async function approveWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
  stage: ApprovalStage
): Promise<ApprovalResult> {
  if (!workingPermitId.trim() || !Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid approval request.");
  }

  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findFirst({
      where: { id: workingPermitId, ...assignedToStage(stage, userId) },
      select: {
        id: true,
        requestLevel: true,
        ApprovalTable: { select: { id: true, sequence: true, role: true, status: true }, orderBy: { sequence: "asc" } },
      },
    });
    if (!permit) throw new Error("Working Permit not found or not assigned to you.");

    const sequence = getStageSequence(permit.requestLevel, stage);
    const current = permit.ApprovalTable.find((item) => item.sequence === sequence && item.role === stage);
    const previous = permit.ApprovalTable.filter((item) => item.sequence < sequence);
    if (!current || current.status !== WorkingPermitStatus.PENDING ||
        previous.length !== sequence - 1 ||
        previous.some((item) => item.status !== WorkingPermitStatus.APPROVED)) {
      throw new Error("This stage is not ready or has already been processed.");
    }

    // Conditional update prevents a repeated or concurrent approval.
    const updated = await tx.approvalTable.updateMany({
      where: {
        id: current.id,
        workingPermitId,
        sequence,
        role: stage,
        status: WorkingPermitStatus.PENDING,
      },
      data: { status: WorkingPermitStatus.APPROVED, statusAt: new Date() },
    });
    if (updated.count !== 1) throw new Error("Stage has already been processed.");

    return { workingPermitId, sequence: sequence + 1, stage, status: "APPROVED" as const };
  });
}

export async function receiveWorkingPermitRepo(
  workingPermitId: string,
  userId: number
): Promise<TroubleshooterResult> {
  if (!workingPermitId.trim() || !Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid receive request.");
  }

  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findFirst({
      where: { id: workingPermitId, ...assignedTroubleshooter(userId) },
      select: {
        id: true,
        receivedById: true,
        requestLevel: true,
        ApprovalTable: {
          select: { id: true, sequence: true, role: true, status: true },
          orderBy: { sequence: "asc" },
        },
      },
    });
    if (!permit) throw new Error("Working Permit not assigned to your department.");
    const sequence = getStageSequence(permit.requestLevel, "TROUBLESHOOTER");
    const current = permit.ApprovalTable.find((item) => item.sequence === sequence && item.role === "TROUBLESHOOTER");
    const previous = permit.ApprovalTable.filter((item) => item.sequence < sequence);
    if (!current || permit.receivedById !== null ||
        current.status !== WorkingPermitStatus.PENDING ||
        previous.length !== sequence - 1 ||
        previous.some((item) => item.status !== WorkingPermitStatus.APPROVED)) {
      throw new Error("All approvals must be completed and the request unclaimed.");
    }

    const now = new Date();
    const claimed = await tx.workingPermit.updateMany({
      where: { id: workingPermitId, receivedById: null },
      data: { receivedById: userId, receivedAt: now },
    });
    if (claimed.count !== 1) throw new Error("Another troubleshooter has received this request.");

    const updated = await tx.approvalTable.updateMany({
      where: { id: current.id, role: "TROUBLESHOOTER", sequence, status: WorkingPermitStatus.PENDING },
      data: { status: WorkingPermitStatus.IN_PROGRESS, statusAt: now },
    });
    if (updated.count !== 1) throw new Error("Request is no longer available.");

    return { workingPermitId, sequence, receivedById: userId, status: "IN_PROGRESS" as const };
  });
}

export async function completeWorkingPermitRepo(
  workingPermitId: string,
  userId: number
): Promise<TroubleshooterResult> {
  if (!workingPermitId.trim() || !Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid completion request.");
  }
  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findFirst({
      where: { id: workingPermitId, receivedById: userId, ...assignedTroubleshooter(userId) },
      select: { requestLevel: true },
    });
    if (!permit) throw new Error("This request was not received by you.");
    const sequence = getStageSequence(permit.requestLevel, "TROUBLESHOOTER");
    const now = new Date();
    const updated = await tx.approvalTable.updateMany({
      where: {
        workingPermitId,
        sequence,
        role: "TROUBLESHOOTER",
        status: WorkingPermitStatus.IN_PROGRESS,
      },
      data: { status: WorkingPermitStatus.COMPLETED, statusAt: now },
    });
    if (updated.count !== 1) throw new Error("Request is not in progress or has already been completed.");
    return { workingPermitId, sequence, receivedById: userId, status: "COMPLETED" as const };
  });
}
