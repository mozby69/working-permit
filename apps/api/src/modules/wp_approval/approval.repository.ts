import {Prisma, RequestLevel, WorkingPermitStatus} from "../../../generated/prisma/client.js";
import { APPROVAL_STAGES } from "./approval.config.js"; 
import { prisma } from "@/lib/database/prisma.js";
import { ApprovalResult, ApprovalStage} from "@repo/shared";
import { TroubleshooterResult } from "./approval.types.js";





export async function approveWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
  stage: ApprovalStage
): Promise<ApprovalResult> {
  if (!workingPermitId.trim()) {
    throw new Error("Working Permit ID is required.");
  }

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Valid authenticated user ID is required.");
  }

  const config = APPROVAL_STAGES[stage];

  return prisma.$transaction(async (tx) => {
    // ------------------------------------------------
    // 1. Validate the assigned approver
    // ------------------------------------------------

    const assignmentWhere: Prisma.WorkingPermitWhereInput =
      stage === "CHECKER"
        ? {
            fromDepartment: {
              is: {
                checkerId: userId,
              },
            },
          }
        : stage === "FIRST_APPROVER"
          ? {
              WorkerList: {
                is: {
                  firstApproverUserId: userId,
                },
              },
            }
          : {
              WorkerList: {
                is: {
                  finalApproverUserId: userId,
                },
              },
            };

    // ------------------------------------------------
    // 2. Validate previous approval stages
    // ------------------------------------------------

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

    // ------------------------------------------------
    // 3. Level 1 must never use Final Approver
    // ------------------------------------------------

    const levelWhere: Prisma.WorkingPermitWhereInput =
      stage === "FINAL_APPROVER"
        ? {
            requestLevel: RequestLevel.LEVEL_2,
          }
        : {};

    // ------------------------------------------------
    // 4. Find the eligible Working Permit
    // ------------------------------------------------

    const permit = await tx.workingPermit.findFirst({
      where: {
        id: workingPermitId,
        sequence: config.sequence,

        ...assignmentWhere,
        ...levelWhere,

        ApprovalTable: {
          some: approvalWhere,
        },
      },

      select: {
        id: true,
        requestLevel: true,
        sequence: true,
        requestToId: true,

        ApprovalTable: {
          where: approvalWhere,

          select: {
            id: true,
          },
        },
      },
    });

    if (!permit) {
      throw new Error(
        "Working Permit is not assigned to you, is not at the correct approval stage, or has already been processed."
      );
    }

    if (permit.ApprovalTable.length !== 1) {
      throw new Error(
        "Expected exactly one pending approval record."
      );
    }

    // ------------------------------------------------
    // 5. Determine the next workflow sequence
    // ------------------------------------------------

    let nextSequence: number;

    switch (stage) {
      case "CHECKER":
        nextSequence = 2;
        break;

      case "FIRST_APPROVER":
        // LEVEL_1: sequence 3 = Troubleshooter
        // LEVEL_2: sequence 3 = Final Approver
        nextSequence = 3;
        break;

      case "FINAL_APPROVER":
        // Only LEVEL_2 can reach this stage.
        // Sequence 4 = Troubleshooter
        nextSequence = 4;
        break;
    }

    // ------------------------------------------------
    // 6. Prepare the approval update
    // ------------------------------------------------

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
            };

    // ------------------------------------------------
    // 7. Atomically advance the current stage
    // ------------------------------------------------

    const advanced = await tx.workingPermit.updateMany({
      where: {
        id: workingPermitId,
        sequence: config.sequence,

        ...assignmentWhere,
        ...levelWhere,

        ApprovalTable: {
          some: approvalWhere,
        },
      },

      data: {
        sequence: nextSequence,
      },
    });

    if (advanced.count !== 1) {
      throw new Error(
        "This Working Permit approval stage has already been processed."
      );
    }

    // ------------------------------------------------
    // 8. Update the matching approval record
    // ------------------------------------------------

    const approvalId = permit.ApprovalTable[0].id;

    const updated = await tx.approvalTable.updateMany({
      where: {
        id: approvalId,
        workingPermitId,

        ...approvalWhere,
      },

      data: approvalData,
    });

    if (updated.count !== 1) {
      throw new Error(
        "Failed to update the Working Permit approval status."
      );
    }

    // ------------------------------------------------
    // 9. Return the result
    // ------------------------------------------------

    return {
      workingPermitId,
      sequence: nextSequence,
      stage,
      status: "APPROVED" as const,
    };
  });
}















//receiver

export async function receiveWorkingPermitRepo(
  workingPermitId: string,
  userId: number
): Promise<TroubleshooterResult> {
  if (!workingPermitId.trim()) {
    throw new Error("Working Permit ID is required.");
  }

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid authenticated user.");
  }

  return prisma.$transaction(async (tx) => {
    const approval = await tx.approvalTable.findFirst({
      where: {
        workingPermitId,

        status: WorkingPermitStatus.PENDING,
        receivedById: null,

        // Check the Troubleshooter's department
        workingPermit: {
          is: {
            WorkerList: {
              is: {
                troubleshooters: {
                  some: {
                    id: userId,
                    isActive: true,
                  },
                },
              },
            },

            OR: [
              {
                requestLevel: RequestLevel.LEVEL_1,
                sequence: 3,
              },
              {
                requestLevel: RequestLevel.LEVEL_2,
                sequence: 4,
              },
            ],
          },
        },
      },

      select: {
        id: true,
        workingPermitId: true,
        checkedStatus: true,
        firstApproverStatus: true,
        finalApproverStatus: true,

        workingPermit: {
          select: {
            sequence: true,
            requestLevel: true,
          },
        },
      },
    });

    if (!approval) {
      throw new Error(
        "Working Permit is unavailable, already received, or not assigned to your department."
      );
    }

    const approvalsComplete =
      approval.checkedStatus === WorkingPermitStatus.APPROVED &&
      approval.firstApproverStatus === WorkingPermitStatus.APPROVED &&
      (
        approval.workingPermit.requestLevel === RequestLevel.LEVEL_1 ||
        approval.finalApproverStatus === WorkingPermitStatus.APPROVED
      );

    if (!approvalsComplete) {
      throw new Error(
        "All required approvals must be completed before receiving this request."
      );
    }

    const now = new Date();

    // Atomic claim: only one Troubleshooter can receive.
    const updated = await tx.approvalTable.updateMany({
      where: {
        id: approval.id,
        workingPermitId,
        status: WorkingPermitStatus.PENDING,
        receivedById: null,

        checkedStatus: WorkingPermitStatus.APPROVED,
        firstApproverStatus: WorkingPermitStatus.APPROVED,

        ...(approval.workingPermit.requestLevel === RequestLevel.LEVEL_2
          ? {
              finalApproverStatus: WorkingPermitStatus.APPROVED,
            }
          : {}),

        workingPermit: {
          is: {
            WorkerList: {
              is: {
                troubleshooters: {
                  some: {
                    id: userId,
                    isActive: true,
                  },
                },
              },
            },

            requestLevel: approval.workingPermit.requestLevel,
            sequence: approval.workingPermit.sequence,
          },
        },
      },

      data: {
        receivedById: userId,
        receivedAt: now,
        status: WorkingPermitStatus.IN_PROGRESS,
        statusAt: now,
      },
    });

    if (updated.count !== 1) {
      throw new Error(
        "Another Troubleshooter has already received this request."
      );
    }

    return {
      workingPermitId,
      sequence: approval.workingPermit.sequence,
      receivedById: userId,
      status: "IN_PROGRESS",
    };
  });
}

// ==================================================
// COMPLETE WORKING PERMIT
// ==================================================

export async function completeWorkingPermitRepo(
  workingPermitId: string,
  userId: number
): Promise<TroubleshooterResult> {
  if (!workingPermitId.trim()) {
    throw new Error("Working Permit ID is required.");
  }

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Invalid authenticated user.");
  }

  return prisma.$transaction(async (tx) => {
    const approval = await tx.approvalTable.findFirst({
      where: {
        workingPermitId,

        status: WorkingPermitStatus.IN_PROGRESS,
        receivedById: userId,

        workingPermit: {
          is: {
            WorkerList: {
              is: {
                troubleshooters: {
                  some: {
                    id: userId,
                    isActive: true,
                  },
                },
              },
            },

            OR: [
              {
                requestLevel: RequestLevel.LEVEL_1,
                sequence: 3,
              },
              {
                requestLevel: RequestLevel.LEVEL_2,
                sequence: 4,
              },
            ],
          },
        },
      },

      select: {
        id: true,

        workingPermit: {
          select: {
            sequence: true,
            requestLevel: true,
          },
        },
      },
    });

    if (!approval) {
      throw new Error(
        "Working Permit is not in progress or was not received by you."
      );
    }

    const now = new Date();

    const updated = await tx.approvalTable.updateMany({
      where: {
        id: approval.id,
        workingPermitId,
        status: WorkingPermitStatus.IN_PROGRESS,
        receivedById: userId,

        workingPermit: {
          is: {
            WorkerList: {
              is: {
                troubleshooters: {
                  some: {
                    id: userId,
                    isActive: true,
                  },
                },
              },
            },

            requestLevel: approval.workingPermit.requestLevel,
            sequence: approval.workingPermit.sequence,
          },
        },
      },

      data: {
        status: WorkingPermitStatus.COMPLETED,
        statusAt: now,
      },
    });

    if (updated.count !== 1) {
      throw new Error(
        "Working Permit has already been completed or its status has changed."
      );
    }

    return {
      workingPermitId,
      sequence: approval.workingPermit.sequence,
      receivedById: userId,
      status: "COMPLETED",
    };
  });
}