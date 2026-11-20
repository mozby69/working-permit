import {
  RequestLevel,
  WorkingPermitStatus,
} from "../../../generated/prisma/client.js";
import { prisma } from "@/lib/database/prisma.js";
import type { ApprovalResult, ApprovalStage } from "@repo/shared";
import type { TroubleshooterResult } from "./approval.types.js";
import { notifyAssignedApproverTx, notifyCoordinatorStatusTx } from "../notifications/notification.service.js";
import { createNotificationTx } from "../notifications/notification.repository.js";

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
): Promise<{
  result: ApprovalResult;
  notifications: Awaited<
    ReturnType<typeof notifyAssignedApproverTx>
  >[];
}> {

  if (
    !workingPermitId.trim() ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw new Error("Invalid approval request.");
  }

  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findUnique({
      where: {
        id: workingPermitId,
      },
      select: {
        id: true,
        requestLevel: true,
        status: true,
        referenceNumber: true,
        createdById: true,
        WorkerList: {
          select: {
            troubleshooters: {
              where: {
                isActive: true,
              },
              select: {
                id: true,
              },
            },
          },
        },
        ApprovalTable: {
          select: {
            id: true,
            sequence: true,
            role: true,
            approverId: true,
            status: true,
            approvedAt: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });

    if (
      !permit ||
      permit.status !== WorkingPermitStatus.PENDING
    ) {
      throw new Error(
        "Working Permit is not pending approval."
      );
    }

    const sequence = getStageSequence(
      permit.requestLevel,
      stage
    );

    const current = permit.ApprovalTable.find(
      (row) =>
        row.sequence === sequence &&
        row.role === stage
    );

    const previous = permit.ApprovalTable.filter(
      (row) => row.sequence < sequence
    );

    // Validate the assigned approver and sequence
    if (
      !current ||
      current.approverId !== userId ||
      current.status !== WorkingPermitStatus.PENDING ||
      current.approvedAt !== null ||
      previous.length !== sequence - 1 ||
      previous.some(
        (row) =>
          row.status !== WorkingPermitStatus.APPROVED ||
          row.approvedAt === null
      )
    ) {
      throw new Error(
        "Approval is unavailable, not assigned to you, or not at the correct stage."
      );
    }

    const now = new Date();

    // Update this approver's status
    const saved = await tx.approvalTable.updateMany({
      where: {
        id: current.id,
        workingPermitId,
        approverId: userId,
        status: WorkingPermitStatus.PENDING,
        approvedAt: null,
      },

      data: {
        status: WorkingPermitStatus.APPROVED,
        approvedAt: now,
      },
    });

    if (saved.count !== 1) {
      throw new Error(
        "This approval stage has already been processed."
      );
    }
    const nextStage =
      stage === "CHECKER"
        ? permit.requestLevel === RequestLevel.LEVEL_2
          ? "FIRST_APPROVER"
          : "FINAL_APPROVER"
        : stage === "FIRST_APPROVER"
          ? "FINAL_APPROVER"
          : null;

    
    const notifications: Awaited<
      ReturnType<typeof createNotificationTx>>[] = [];


    if (nextStage) {
      const notification = await notifyAssignedApproverTx(
        tx,
        permit,
        nextStage
      );

      notifications.push(notification);
    }

    // Notify Troubleshooters after Final Approver approval
      if (stage === "FINAL_APPROVER") {
      const creator = await tx.user.findUnique({
        where: {
          id: permit.createdById,
        },
        select: {
          name: true,
        },
      });

      const creatorName = creator?.name?.trim() || "Unknown User";

      for (const troubleshooter of permit.WorkerList.troubleshooters) {
        const notification = await createNotificationTx(tx, {
          userId: troubleshooter.id,
          title: "New Working Permit",
          message:
            `New Working Permit ${permit.referenceNumber} ` +
            `from ${creatorName}.`,
          type: "WP_TROUBLESHOOTER_ASSIGNED",
          workingPermitId: permit.id,
        });

        notifications.push(notification);
      }
    }
   

   return {
      result: {
        workingPermitId,
        sequence: sequence + 1,
        stage,
        status: "APPROVED" as const,
      },
      notifications,
    };
  });
}




export async function receiveWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
): Promise<{
  result: TroubleshooterResult;
  notifications: Awaited<
    ReturnType<typeof notifyCoordinatorStatusTx>
  >[];
}> {
  if (
    !workingPermitId.trim() ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw new Error("Invalid receive request.");
  }

  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findUnique({
      where: {
        id: workingPermitId,
      },
      select: {
        id: true,
        referenceNumber: true,
        createdById: true,
        requestLevel: true,
        status: true,
        receivedById: true,

        WorkerList: {
          select: {
            troubleshooters: {
              where: {
                id: userId,
                isActive: true,
              },
              select: {
                id: true,
              },
            },
          },
        },

        ApprovalTable: {
          select: {
            sequence: true,
            role: true,
            status: true,
            approvedAt: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });

    if (!permit) {
      throw new Error("Working Permit not found.");
    }

    if (permit.status !== WorkingPermitStatus.PENDING) {
      throw new Error(
        `Cannot receive permit with status ${permit.status}.`
      );
    }

    if (permit.receivedById !== null) {
      throw new Error(
        "This Working Permit has already been received."
      );
    }

    if (permit.WorkerList.troubleshooters.length === 0) {
      throw new Error(
        "You are not assigned as a Troubleshooter for this permit."
      );
    }

    const expectedRoles =
      permit.requestLevel === RequestLevel.LEVEL_1
        ? ["CHECKER", "FINAL_APPROVER"]
        : ["CHECKER", "FIRST_APPROVER", "FINAL_APPROVER"];

    const approvalsComplete =
      permit.ApprovalTable.length === expectedRoles.length &&
      expectedRoles.every((role, index) => {
        const approval = permit.ApprovalTable[index];

        return (
          approval?.role === role &&
          approval.sequence === index + 1 &&
          approval.status === WorkingPermitStatus.APPROVED &&
          approval.approvedAt !== null
        );
      });

    if (!approvalsComplete) {
      throw new Error(
        "All required approval stages must be approved before receiving."
      );
    }

    const now = new Date();

    const changed = await tx.workingPermit.updateMany({
      where: {
        id: workingPermitId,
        status: WorkingPermitStatus.PENDING,
        receivedById: null,

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

        ApprovalTable: {
          some: {
            role: "FINAL_APPROVER",
            status: WorkingPermitStatus.APPROVED,
            approvedAt: {
              not: null,
            },
          },
        },
      },

      data: {
        status: WorkingPermitStatus.IN_PROGRESS,
        statusAt: now,
        receivedById: userId,
        receivedAt: now,
      },
    });

    if (changed.count !== 1) {
      throw new Error(
        "Permit could not be received. It may have been processed by another user."
      );
    }

      const notification = await notifyCoordinatorStatusTx(
      tx,
      {
        id: permit.id,
        referenceNumber: permit.referenceNumber,
        createdById: permit.createdById,
      },
      "IN_PROGRESS"
    );

    return {
      result: {
        workingPermitId,
        sequence:
          permit.requestLevel === RequestLevel.LEVEL_1 ? 3 : 4,
        receivedById: userId,
        status: "IN_PROGRESS" as const,
      },
      notifications: [notification],
    };
  });
}






export async function completeWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
): Promise<{
  result: TroubleshooterResult;
  notifications: Awaited<
    ReturnType<typeof notifyCoordinatorStatusTx>
  >[];
}> {
  if (
    !workingPermitId.trim() ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw new Error("Invalid completion request.");
  }

  return prisma.$transaction(async (tx) => {
    const changed = await tx.workingPermit.updateMany({
      where: {
        id: workingPermitId,
        status: WorkingPermitStatus.IN_PROGRESS,
        //receivedById: userId,

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
      },

      data: {
        status: WorkingPermitStatus.COMPLETED,
        statusAt: new Date(),
        completeById: userId,
      },
    });

    if (changed.count !== 1) {
      throw new Error(
        "Permit is not in progress or was not received by you."
      );
    }

    const permit = await tx.workingPermit.findUniqueOrThrow({
      where: {
        id: workingPermitId,
      },
      select: {
        id: true,
        referenceNumber: true,
        createdById: true,
        requestLevel: true,
      },
    });

    // Notify the Coordinator who created the permit.
    const notification = await notifyCoordinatorStatusTx(
      tx,
      {
        id: permit.id,
        referenceNumber: permit.referenceNumber,
        createdById: permit.createdById,
      },
      "COMPLETED"
    );

    return {
      result: {
        workingPermitId,
        sequence:
          permit.requestLevel === RequestLevel.LEVEL_1 ? 3 : 4,
        receivedById: userId,
        status: "COMPLETED" as const,
      },
      notifications: [notification],
    };
  });
}





//REJECT backend
export async function rejectWorkingPermitRepo(
  workingPermitId: string,
  userId: number,
  stage: ApprovalStage,
    rejectRemarks: string
) {

  const remarks = rejectRemarks.trim();

if (remarks.length < 5 || remarks.length > 500) {
  throw new Error(
    "Rejection remarks must contain between 5 and 500 characters."
  );
}


  if (
    !workingPermitId.trim() ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw new Error("Invalid rejection request.");
  }

  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findUnique({
      where: {
        id: workingPermitId,
      },
      select: {
        id: true,
        requestLevel: true,
        status: true,
        ApprovalTable: {
          select: {
            id: true,
            sequence: true,
            role: true,
            approverId: true,
            status: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });

    if (!permit) {
      throw new Error("Working Permit not found.");
    }

    if (permit.status !== WorkingPermitStatus.PENDING) {
      throw new Error(
        "Only pending Working Permits can be rejected."
      );
    }

    const sequence = getStageSequence(
      permit.requestLevel,
      stage
    );

    const current = permit.ApprovalTable.find(
      (item) =>
        item.sequence === sequence &&
        item.role === stage
    );

    if (!current) {
      throw new Error(
        "Approval stage not found for this request level."
      );
    }

    if (current.approverId !== userId) {
      throw new Error(
        "You are not assigned to reject this approval stage."
      );
    }

    if (current.status !== WorkingPermitStatus.PENDING) {
      throw new Error(
        "This approval stage has already been processed."
      );
    }

    const previous = permit.ApprovalTable.filter(
      (item) => item.sequence < sequence
    );

    if (
      previous.length !== sequence - 1 ||
      previous.some(
        (item) =>
          item.status !== WorkingPermitStatus.APPROVED
      )
    ) {
      throw new Error(
        "Previous approval stages must be approved first."
      );
    }

    const now = new Date();

    // Claim the main permit first. This prevents concurrent
    // approval/rejection when all status-changing operations
    // use the same conditional permit guard.
    const permitUpdate = await tx.workingPermit.updateMany({
      where: {
        id: workingPermitId,
        status: WorkingPermitStatus.PENDING,
        receivedById: null,
      },
      data: {
        status: WorkingPermitStatus.REJECTED,
        statusAt: now,
      },
    });

    if (permitUpdate.count !== 1) {
      throw new Error(
        "Working Permit has already been processed."
      );
    }

    // Reject only the current approval stage.
 const stageUpdate = await tx.approvalTable.updateMany({
  where: {
    id: current.id,
    workingPermitId,
    sequence,
    role: stage,
    approverId: userId,
    status: WorkingPermitStatus.PENDING,
  },
  data: {
    status: WorkingPermitStatus.REJECTED,
    rejectedAt: now,
    rejectRemarks: remarks,
  },
});

    if (stageUpdate.count !== 1) {
      throw new Error(
        "This approval stage has already been processed."
      );
    }

    return {
      workingPermitId,
      sequence,
      stage,
      status: "REJECTED" as const,
      statusAt: now.toISOString(),
    };
  });
}
