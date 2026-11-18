import { prisma } from "@/lib/database/prisma";
import { getDate } from "@/utils/dateFormatter";
import { AddRequestInput, UpdateWorkingPermitInput } from "@repo/shared";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";
import { Prisma } from "../../../generated/prisma/client";
import { QueryParamWP, UploadedAttachment } from "./workingpermit.types";
import { WorkingPermitStatus } from "../../../generated/prisma/client";
import { APPROVAL_WORKFLOW } from "../wp_approval/approval.config.js";


export async function addRequestRepo(
  data: AddRequestInput,
  userId: number,
  attachments: UploadedAttachment[],
) {
  return prisma.$transaction(async (tx) => {
    const from = await tx.departmentBranches.findFirst({
      where: { id: data.fromId, isBranch: false },
      select: { id: true, checkerId: true, checker: { select: { name: true, isActive: true } } },
    });
    const branch = await tx.departmentBranches.findUnique({
      where: { id: data.branchDepartmentId },
      select: { id: true },
    });
    const worker = await tx.workerList.findUnique({
      where: { id: data.requestToId },
      select: {
        id: true,
        firstApproverUserId: true,
        finalApproverUserId: true,
        firstApproverUser: { select: { isActive: true } },
        finalApproverUser: { select: { isActive: true } },
      },
    });

    if (!from?.checkerId || !from.checker?.isActive) {
      throw new Error("The selected department has no active Checker.");
    }
    if (!branch || !worker || !worker.finalApproverUserId || !worker.finalApproverUser?.isActive) {
      throw new Error("Invalid branch, worker, or inactive Final Approver.");
    }
    if (data.requestLevel === "LEVEL_2" &&
        (!worker.firstApproverUserId || !worker.firstApproverUser?.isActive)) {
      throw new Error("Level 2 requires an active First Approver.");
    }

    const assignments = [
      { sequence: 1, role: "CHECKER", approverId: from.checkerId },
      ...(data.requestLevel === "LEVEL_2"
        ? [{ sequence: 2, role: "FIRST_APPROVER", approverId: worker.firstApproverUserId! }]
        : []),
      {
        sequence: data.requestLevel === "LEVEL_1" ? 2 : 3,
        role: "FINAL_APPROVER",
        approverId: worker.finalApproverUserId,
      },
    ];

    const counter = await tx.referenceCounter.upsert({
      where: { name: "WORKING_PERMIT" },
      create: { name: "WORKING_PERMIT", lastValue: 10001 },
      update: { lastValue: { increment: 1 } },
    });

    return tx.workingPermit.create({
      data: {
        referenceNumber: `WP${counter.lastValue}`,
        createdBy: { connect: { id: userId } },
        WorkerList: { connect: { id: worker.id } },
        fromDepartment: { connect: { id: from.id } },
        branchDepartment: { connect: { id: branch.id } },
        requestLevel: data.requestLevel,
        date: getDate(),
        requestFor: data.requestFor,
        requestedBy: data.requestedBy,
        checkedBy: from.checker.name,
        status: WorkingPermitStatus.PENDING,
        attachments: {
          create: attachments.map(file => ({
            originalName: file.originalName,
            storedName: file.storedName,
            mimeType: file.mimeType,
            fileSize: file.fileSize,
          })),
        },
        ApprovalTable: { create: assignments },
      },
      include: { ApprovalTable: true },
    });
  });
}

export async function getNextReferenceRepo() {
  const counter = await prisma.referenceCounter.findUnique({
    where: {
      name: "WORKING_PERMIT",
    },
  });

  const nextNumber = (counter?.lastValue ?? 10000) + 1;

  return `WP${nextNumber}`;
}


export async function getDepartmentBranchesRepo() {
  return prisma.departmentBranches.findMany({
    select: {
      id: true,
      entityName: true,
      isBranch: true,
      checkerId: true,

      checker: {
        select: {
          id: true,
          name: true,
          username: true,
          isActive: true,
        },
      },
    },

    orderBy: {
      entityName: "asc",
    },
  });
}







export async function displayWorkingPermit(params: QueryParamWP) {
  const { page = 1, limit = 10, search, userId, roles = [] } = params;
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Authenticated user ID is required.");
  }
  const currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const pageLimit = Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;

  const visible: Prisma.WorkingPermitWhereInput[] = [];
  if (roles.includes("COORDINATOR")) visible.push({ createdById: userId });
  if (roles.includes("CHECKER")) {
    visible.push({ ApprovalTable: { some: { role: "CHECKER", approverId: userId } } });
  }
  if (roles.includes("FIRST_APPROVER")) {
    visible.push({
      requestLevel: "LEVEL_2",
      ApprovalTable: {
        some: { role: "FIRST_APPROVER", approverId: userId },
      },
      AND: [{ ApprovalTable: {
        some: { role: "CHECKER", approvedAt: { not: null } },
      } }],
    });
  }
  if (roles.includes("FINAL_APPROVER")) {
    visible.push({
      ApprovalTable: { some: { role: "FINAL_APPROVER", approverId: userId } },
      OR: [
        { requestLevel: "LEVEL_1", ApprovalTable: {
          some: { role: "CHECKER", approvedAt: { not: null } },
        } },
        { requestLevel: "LEVEL_2", ApprovalTable: {
          some: { role: "FIRST_APPROVER", approvedAt: { not: null } },
        } },
      ],
    });
  }
  if (roles.includes("TROUBLESHOOTER")) {
    visible.push({
      status: { in: [WorkingPermitStatus.APPROVED, WorkingPermitStatus.IN_PROGRESS, WorkingPermitStatus.COMPLETED] },
      WorkerList: {
        is: { troubleshooters: { some: { id: userId, isActive: true } } },
      },
    });
  }

  const visibilityWhere: Prisma.WorkingPermitWhereInput = roles.includes("ADMIN")
    ? {} : visible.length > 0 ? { OR: visible } : { id: { in: [] } };
  const term = search?.trim();
  const searchWhere: Prisma.WorkingPermitWhereInput = term
    ? { OR: [
        { referenceNumber: { contains: term } },
        { WorkerList: { is: { workerName: { contains: term } } } },
      ] }
    : {};
  const where: Prisma.WorkingPermitWhereInput = { AND: [visibilityWhere, searchWhere] };

  const [wp_data, total] = await prisma.$transaction([
    prisma.workingPermit.findMany({
      where,
      select: {
        id: true,
        referenceNumber: true,
        requestToId: true,
        requestLevel: true,
        date: true,
        requestFor: true,
        requestedBy: true,
        checkedBy: true,
        createdById: true,
        status: true,
        statusAt: true,
        receivedById: true,
        receivedAt: true,
        attachments: {
          select: {
            id: true, workingPermitId: true, originalName: true, storedName: true,
            mimeType: true, fileSize: true, createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        WorkerList: {
          select: {
            id: true, workerName: true, firstApproverUserId: true,
            finalApproverUserId: true,
            troubleshooters: {
              where: { id: userId, isActive: true },
              select: { id: true },
            },
            firstApproverUser: {
              select: { id: true, name: true, username: true, isActive: true },
            },
            finalApproverUser: {
              select: { id: true, name: true, username: true, isActive: true },
            },
          },
        },
        fromDepartment: { select: { id: true, entityName: true, checkerId: true } },
        branchDepartment: { select: { id: true, entityName: true } },
        ApprovalTable: {
          select: {
            id: true, sequence: true, role: true, approverId: true, approvedAt: true,
            approver: { select: { id: true, name: true } },
          },
          orderBy: { sequence: "asc" },
        },
      },
      skip: (currentPage - 1) * pageLimit,
      take: pageLimit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.workingPermit.count({ where }),
  ]);

  return {
    data: wp_data,
    pagination: {
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
}

export async function getWorkerRepo() {
  return prisma.workerList.findMany({
    select: {
      id: true,
      workerName: true,

      firstApproverUserId: true,
      finalApproverUserId: true,

      firstApproverUser: {
        select: {
          id: true,
          name: true,
          username: true,
          isActive: true,
        },
      },

      finalApproverUser: {
        select: {
          id: true,
          name: true,
          username: true,
          isActive: true,
        },
      },
    },

    orderBy: {
      workerName: "asc",
    },
  });
}









export async function findAttachmentRepo(
  permitId: string,
  attachmentId: string
) {
  return prisma.workingPermitAttachment.findFirst({
    where: {
      id: attachmentId,
      workingPermitId: permitId,
    },
  });
}



export async function updateWorkingPermitRepo(
  id: string,
  userId: number,
  data: UpdateWorkingPermitInput,
  attachments: UploadedAttachment[],
) {
  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findUnique({
      where: { id },
      select: {
        createdById: true, status: true, requestLevel: true,
        attachments: { select: { id: true } },
        ApprovalTable: { select: { approvedAt: true } },
      },
    });
    if (!permit) return { outcome: "NOT_FOUND" as const };
    if (permit.createdById !== userId) return { outcome: "FORBIDDEN" as const };
    if (permit.attachments.length + attachments.length > 5) {
      return { outcome: "TOO_MANY_FILES" as const };
    }
    if (permit.status !== WorkingPermitStatus.PENDING ||
        permit.ApprovalTable.some(a => a.approvedAt !== null)) {
      return { outcome: "LOCKED" as const };
    }

    const department = await tx.departmentBranches.findFirst({
      where: { id: data.fromId, isBranch: false },
      select: { checkerId: true, checker: { select: { name: true, isActive: true } } },
    });
    const branch = await tx.departmentBranches.findUnique({
      where: { id: data.branchDepartmentId },
      select: { id: true },
    });
    const worker = await tx.workerList.findUnique({
      where: { id: data.requestToId },
      select: {
        firstApproverUserId: true, finalApproverUserId: true,
        firstApproverUser: { select: { isActive: true } },
        finalApproverUser: { select: { isActive: true } },
      },
    });
    if (!department?.checkerId || !department.checker?.isActive || !branch ||
        !worker?.finalApproverUserId || !worker.finalApproverUser?.isActive ||
        (data.requestLevel === "LEVEL_2" &&
          (!worker.firstApproverUserId || !worker.firstApproverUser?.isActive))) {
      return { outcome: "INVALID_SELECTION" as const };
    }

    // Conditional guard: an approval cannot be added while editing.
    const changed = await tx.workingPermit.updateMany({
      where: {
        id, createdById: userId, status: WorkingPermitStatus.PENDING,
        ApprovalTable: { every: { approvedAt: null } },
      },
      data: {
        requestToId: data.requestToId, fromId: data.fromId,
        branchDepartmentId: data.branchDepartmentId,
        requestLevel: data.requestLevel,
        requestFor: data.requestFor,
        requestedBy: data.requestedBy,
        checkedBy: department.checker.name,
      },
    });
    if (changed.count !== 1) return { outcome: "LOCKED" as const };

    await tx.approvalTable.deleteMany({ where: { workingPermitId: id } });
    const assignments = [
      { sequence: 1, role: "CHECKER", approverId: department.checkerId },
      ...(data.requestLevel === "LEVEL_2"
        ? [{ sequence: 2, role: "FIRST_APPROVER", approverId: worker.firstApproverUserId! }]
        : []),
      {
        sequence: data.requestLevel === "LEVEL_1" ? 2 : 3,
        role: "FINAL_APPROVER",
        approverId: worker.finalApproverUserId,
      },
    ];
    await tx.approvalTable.createMany({
      data: assignments.map(item => ({ workingPermitId: id, ...item })),
    });

    if (attachments.length > 0) {
      await tx.workingPermitAttachment.createMany({
        data: attachments.map(file => ({
          workingPermitId: id, originalName: file.originalName,
          storedName: file.storedName, mimeType: file.mimeType, fileSize: file.fileSize,
        })),
      });
    }
    return { outcome: "UPDATED" as const, id };
  });
}
