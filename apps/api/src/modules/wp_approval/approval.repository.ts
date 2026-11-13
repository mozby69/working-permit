import {Prisma, WorkingPermitStatus} from "../../../generated/prisma/client.js";
import { APPROVAL_STAGES } from "./approval.config.js"; 
import { prisma } from "@/lib/database/prisma.js";
import { ApprovalResult, ApprovalStage} from "@repo/shared";

export async function approveWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
  stage: ApprovalStage
): Promise<ApprovalResult> {

  const config = APPROVAL_STAGES[stage];

  return prisma.$transaction(async (tx) => {

    const assignmentWhere: Prisma.WorkingPermitWhereInput =
      stage === "CHECKER"
        ? {
            fromDepartment: {
              is: { checkerId: userId },
            },
          }
        : stage === "FIRST_APPROVER"
          ? {
              WorkerList: {
                is: { firstApproverUserId: userId },
              },
            }
          : {
              WorkerList: {
                is: { finalApproverUserId: userId },
              },
            };

  
    const approvalWhere: Prisma.ApprovalTableWhereInput =
      stage === "CHECKER"
        ? {
            status: WorkingPermitStatus.PENDING,
            checkedStatus: WorkingPermitStatus.PENDING,
          }
        : stage === "FIRST_APPROVER"
          ? {
              status: WorkingPermitStatus.PENDING,
              checkedStatus: WorkingPermitStatus.APPROVED,
              firstApproverStatus: WorkingPermitStatus.PENDING,
            }
          : {
              status: WorkingPermitStatus.PENDING,
              checkedStatus: WorkingPermitStatus.APPROVED,
              firstApproverStatus: WorkingPermitStatus.APPROVED,
              finalApproverStatus: WorkingPermitStatus.PENDING,
            };

    const permit = await tx.workingPermit.findFirst({
      where: {
        id: workingPermitId,
        sequence: config.sequence,
        ...assignmentWhere,
        ApprovalTable: {
          some: approvalWhere,
        },
      },
      select: {
        id: true,
        ApprovalTable: {
          where: approvalWhere,
          select: { id: true },
        },
      },
    });

    if (!permit || permit.ApprovalTable.length !== 1) {
      throw new Error(
        "Permit is not assigned to you, is not at this stage, or has already been processed."
      );
    }

    const now = new Date();

    
    const approvalData: Prisma.ApprovalTableUpdateManyMutationInput =
      stage === "CHECKER"
        ? {
            checkedStatus: WorkingPermitStatus.APPROVED,
            checkedStatusAt: now,
          }
        : stage === "FIRST_APPROVER"
          ? {
              firstApproverStatus: WorkingPermitStatus.APPROVED,
              firstApproverApprovedAt: now,
            }
          : {
              finalApproverStatus: WorkingPermitStatus.APPROVED,
              finalApproverApprovedAt: now,
             // status: WorkingPermitStatus.COMPLETED,
             // statusAt: now,
            };

    // Atomically claim the current sequence.
    const advanced = await tx.workingPermit.updateMany({
      where: {
        id: workingPermitId,
        sequence: config.sequence,
        ...assignmentWhere,
        ApprovalTable: {
          some: approvalWhere,
        },
      },
      data: {
        sequence: config.nextSequence,
      },
    });

    if (advanced.count !== 1) {
      throw new Error("This approval stage has already been processed.");
    }

    // Update the matching approval record.
    const updated = await tx.approvalTable.updateMany({
      where: {
        id: permit.ApprovalTable[0].id,
        workingPermitId,
        ...approvalWhere,
      },
      data: approvalData,
    });

    if (updated.count !== 1) {
      throw new Error("Failed to update the approval status.");
    }

    return {
      workingPermitId,
      sequence: config.nextSequence,
      stage,
      status: "APPROVED",
    };
  });
}

