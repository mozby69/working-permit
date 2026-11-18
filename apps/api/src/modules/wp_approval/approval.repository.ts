import {
  RequestLevel,
  WorkingPermitStatus,
} from "../../../generated/prisma/client.js";
import { prisma } from "@/lib/database/prisma.js";
import type { ApprovalResult, ApprovalStage } from "@repo/shared";
import type { TroubleshooterResult } from "./approval.types.js";

function getStageSequence(level: RequestLevel, stage: ApprovalStage): number {
  if (stage === "CHECKER") return 1;
  if (stage === "FIRST_APPROVER" && level === RequestLevel.LEVEL_2) return 2;
  if (stage === "FINAL_APPROVER") return level === RequestLevel.LEVEL_1 ? 2 : 3;
  throw new Error("This approval role is not part of the requested level.");
}

export async function approveWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
  stage: ApprovalStage,
): Promise<ApprovalResult> {
  if (!workingPermitId.trim() || !Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid approval request.");
  }

  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findUnique({
      where: { id: workingPermitId },
      select: { id: true, requestLevel: true, status: true, ApprovalTable: {
        select: { id: true, sequence: true, role: true, approverId: true, approvedAt: true },
        orderBy: { sequence: "asc" },
      } },
    });
    if (!permit || permit.status !== WorkingPermitStatus.PENDING) {
      throw new Error("Working Permit is not pending approval.");
    }

    const sequence = getStageSequence(permit.requestLevel, stage);
    const current = permit.ApprovalTable.find(row => row.sequence === sequence && row.role === stage);
    const previous = permit.ApprovalTable.filter(row => row.sequence < sequence);
    if (!current || current.approverId !== userId || current.approvedAt !== null ||
        previous.length !== sequence - 1 || previous.some(row => row.approvedAt === null)) {
      throw new Error("Approval is unavailable, not assigned to you, or not at the correct stage.");
    }

    const now = new Date();
    const saved = await tx.approvalTable.updateMany({
      where: { id: current.id, workingPermitId, approverId: userId, approvedAt: null },
      data: { approvedAt: now },
    });
    if (saved.count !== 1) throw new Error("This stage was already approved.");

    if (stage === "FINAL_APPROVER") {
      const changed = await tx.workingPermit.updateMany({
        where: { id: workingPermitId, status: WorkingPermitStatus.PENDING },
        data: { status: WorkingPermitStatus.APPROVED, statusAt: now },
      });
      if (changed.count !== 1) throw new Error("Permit status already changed.");
    }

    return {
      workingPermitId,
      sequence: sequence + 1,
      stage,
      status: "APPROVED" as const,
    };
  });
}

export async function receiveWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
): Promise<TroubleshooterResult> {
  if (!workingPermitId.trim() || !Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid receive request.");
  }

  const now = new Date();
  const changed = await prisma.workingPermit.updateMany({
    where: {
      id: workingPermitId,
      status: WorkingPermitStatus.APPROVED,
      receivedById: null,
      WorkerList: {
        is: {
          troubleshooters: { some: { id: userId, isActive: true } },
        },
      },
      ApprovalTable: { some: { role: "FINAL_APPROVER", approvedAt: { not: null } } },
    },
    data: {
      status: WorkingPermitStatus.IN_PROGRESS,
      statusAt: now,
      receivedById: userId,
      receivedAt: now,
    },
  });
  if (changed.count !== 1) {
    throw new Error("Permit is not available to receive or has already been received.");
  }

  const permit = await prisma.workingPermit.findUniqueOrThrow({
    where: { id: workingPermitId },
    select: { requestLevel: true },
  });
  return {
    workingPermitId,
    sequence: permit.requestLevel === RequestLevel.LEVEL_1 ? 3 : 4,
    receivedById: userId,
    status: "IN_PROGRESS" as const,
  };
}

export async function completeWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
): Promise<TroubleshooterResult> {
  if (!workingPermitId.trim() || !Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid completion request.");
  }

  const changed = await prisma.workingPermit.updateMany({
    where: {
      id: workingPermitId,
      status: WorkingPermitStatus.IN_PROGRESS,
      receivedById: userId,
      WorkerList: {
        is: { troubleshooters: { some: { id: userId, isActive: true } } },
      },
    },
    data: {
      status: WorkingPermitStatus.COMPLETED,
      statusAt: new Date(),
    },
  });
  if (changed.count !== 1) {
    throw new Error("Permit is not in progress or was not received by you.");
  }

  const permit = await prisma.workingPermit.findUniqueOrThrow({
    where: { id: workingPermitId },
    select: { requestLevel: true },
  });
  return {
    workingPermitId,
    sequence: permit.requestLevel === RequestLevel.LEVEL_1 ? 3 : 4,
    receivedById: userId,
    status: "COMPLETED" as const,
  };
}
