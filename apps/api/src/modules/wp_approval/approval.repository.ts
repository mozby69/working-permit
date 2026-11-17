
import {
  Prisma,
  RequestLevel,
  WorkingPermitStatus,
} from "../../../generated/prisma/client.js";

import { prisma } from "@/lib/database/prisma.js";

import type {
  ApprovalResult,
  ApprovalStage,
} from "@repo/shared";

import type {
  TroubleshooterResult,
} from "./approval.types";



function getStageSequence(
  level: RequestLevel,
  stage: ApprovalStage
): number {
  if (stage === "CHECKER") {
    return 1;
  }

  if (level === RequestLevel.LEVEL_1) {
    if (stage === "FINAL_APPROVER") {
      return 2;
    }

    throw new Error(
      "LEVEL_1 does not require First Approver approval."
    );
  }

  if (stage === "FIRST_APPROVER") {
    return 2;
  }

  if (stage === "FINAL_APPROVER") {
    return 3;
  }

  throw new Error("Invalid approval stage.");
}

// ==================================================
// APPROVAL CONDITIONS
// ==================================================

function getApprovalWhere(
  level: RequestLevel,
  stage: ApprovalStage
): Prisma.ApprovalTableWhereInput {
  const base: Prisma.ApprovalTableWhereInput = {
    status: WorkingPermitStatus.PENDING,
  };

  switch (stage) {
    case "CHECKER":
      return {
        ...base,
        checkedStatus: WorkingPermitStatus.PENDING,
        firstApproverStatus: WorkingPermitStatus.PENDING,
        finalApproverStatus: WorkingPermitStatus.PENDING,
      };

  case "FIRST_APPROVER":
  return {
    ...base,
    checkedStatus: WorkingPermitStatus.APPROVED,
    firstApproverStatus: WorkingPermitStatus.PENDING,
  };

case "FINAL_APPROVER":
  return {
    ...base,
    checkedStatus: WorkingPermitStatus.APPROVED,
    finalApproverStatus: WorkingPermitStatus.PENDING,

    ...(level === RequestLevel.LEVEL_2
      ? {
          firstApproverStatus:
            WorkingPermitStatus.APPROVED,
        }
      : {
          firstApproverStatus:
            WorkingPermitStatus.PENDING,
        }),
  };
  }
}

// ==================================================
// APPROVER ASSIGNMENT
// ==================================================

function getAssignmentWhere(
  stage: ApprovalStage,
  userId: number
): Prisma.WorkingPermitWhereInput {
  switch (stage) {
    case "CHECKER":
      return {
        fromDepartment: {
          is: {
            checkerId: userId,
          },
        },
      };

    case "FIRST_APPROVER":
      return {
        WorkerList: {
          is: {
            firstApproverUserId: userId,
          },
        },
      };

    case "FINAL_APPROVER":
      return {
        WorkerList: {
          is: {
            finalApproverUserId: userId,
          },
        },
      };
  }
}

// ==================================================
// APPROVAL UPDATE DATA
// ==================================================

function getApprovalUpdateData(
  stage: ApprovalStage,
  now: Date
): Prisma.ApprovalTableUpdateManyMutationInput {
  switch (stage) {
    case "CHECKER":
      return {
        checkedStatus: WorkingPermitStatus.APPROVED,
        checkedStatusAt: now,
      };

    case "FIRST_APPROVER":
      return {
        firstApproverStatus:
          WorkingPermitStatus.APPROVED,
        firstApproverApprovedAt: now,
      };

    case "FINAL_APPROVER":
      return {
        finalApproverStatus:
          WorkingPermitStatus.APPROVED,
        finalApproverApprovedAt: now,
      };
  }
}

// ==================================================
// APPROVE WORKING PERMIT
// ==================================================

export async function approveWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
  stage: ApprovalStage
): Promise<ApprovalResult> {
  if (!workingPermitId.trim()) {
    throw new Error("Working Permit ID is required.");
  }

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error(
      "Valid authenticated user ID is required."
    );
  }

  return prisma.$transaction(async (tx) => {
    // 1. Determine request level.
    const currentPermit =
      await tx.workingPermit.findUnique({
        where: {
          id: workingPermitId,
        },
        select: {
          id: true,
          requestLevel: true,
        },
      });

    if (!currentPermit) {
      throw new Error("Working Permit not found.");
    }

    const level = currentPermit.requestLevel;

    // 2. Calculate the correct sequence.
    const currentSequence = getStageSequence(
      level,
      stage
    );

    const nextSequence = currentSequence + 1;

    // 3. Build assignment and approval guards.
    const assignmentWhere = getAssignmentWhere(
      stage,
      userId
    );

    const approvalWhere = getApprovalWhere(
      level,
      stage
    );

    const permitWhere: Prisma.WorkingPermitWhereInput = {
      id: workingPermitId,
      requestLevel: level,
      sequence: currentSequence,

      ...assignmentWhere,

      ApprovalTable: {
        some: approvalWhere,
      },
    };

    // 4. Find the eligible permit.
    const permit = await tx.workingPermit.findFirst({
      where: permitWhere,

      select: {
        id: true,
        requestLevel: true,
        sequence: true,

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
        "This request is not assigned to you, " +
        "is not at the correct approval stage, " +
        "or has already been processed."
      );
    }

    if (permit.ApprovalTable.length !== 1) {
      throw new Error(
        "Expected exactly one pending approval record."
      );
    }

    const approvalId = permit.ApprovalTable[0].id;
    const now = new Date();

    // 5. Advance sequence atomically.
    const advanced = await tx.workingPermit.updateMany({
      where: permitWhere,

      data: {
        sequence: nextSequence,
      },
    });

    if (advanced.count !== 1) {
      throw new Error(
        "This approval stage has already been processed."
      );
    }

    // 6. Update the matching approval record.
    const updated = await tx.approvalTable.updateMany({
      where: {
        id: approvalId,
        workingPermitId,

        ...approvalWhere,
      },

      data: getApprovalUpdateData(stage, now),
    });

    if (updated.count !== 1) {
      throw new Error(
        "Failed to update the Working Permit approval status."
      );
    }

    // Both changes commit together.
    return {
      workingPermitId,
      sequence: nextSequence,
      stage,
      status: "APPROVED" as const,
    };
  });
}

// ==================================================
// RECEIVE WORKING PERMIT
// ==================================================

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
        "Working Permit is unavailable, already received, " +
        "or not assigned to your department."
      );
    }

    const level = approval.workingPermit.requestLevel;

    const approvalsComplete =
      approval.checkedStatus ===
        WorkingPermitStatus.APPROVED &&
      approval.firstApproverStatus ===
        WorkingPermitStatus.APPROVED &&
      (
        level === RequestLevel.LEVEL_1 ||
        approval.finalApproverStatus ===
          WorkingPermitStatus.APPROVED
      );

    if (!approvalsComplete) {
      throw new Error(
        "All required approvals must be completed " +
        "before receiving this request."
      );
    }

    const now = new Date();

    // Atomic claim prevents two troubleshooters
    // from receiving the same request.
    const updated = await tx.approvalTable.updateMany({
      where: {
        id: approval.id,
        workingPermitId,

        status: WorkingPermitStatus.PENDING,
        receivedById: null,

        checkedStatus: WorkingPermitStatus.APPROVED,
        firstApproverStatus:
          WorkingPermitStatus.APPROVED,

        ...(level === RequestLevel.LEVEL_2
          ? {
              finalApproverStatus:
                WorkingPermitStatus.APPROVED,
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

            requestLevel: level,
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
        "Another Troubleshooter has already received " +
        "this request."
      );
    }

    return {
      workingPermitId,
      sequence: approval.workingPermit.sequence,
      receivedById: userId,
      status: "IN_PROGRESS" as const,
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
        "Working Permit is not in progress or " +
        "was not received by you."
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

            requestLevel:
              approval.workingPermit.requestLevel,

            sequence:
              approval.workingPermit.sequence,
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
        "Working Permit has already been completed " +
        "or its status has changed."
      );
    }

    return {
      workingPermitId,
      sequence: approval.workingPermit.sequence,
      receivedById: userId,
      status: "COMPLETED" as const,
    };
  });
}
