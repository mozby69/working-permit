import { prisma } from "@/lib/database/prisma";
import { getDate } from "@/utils/dateFormatter";
import { AddRequestInput, UpdateWorkingPermitInput } from "@repo/shared";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";
import { Prisma } from "../../../generated/prisma/client";
import { QueryParamWP, UploadedAttachment } from "./workingpermit.types";
import { WorkingPermitStatus } from "../../../generated/prisma/client";
import { APPROVAL_WORKFLOW } from "../wp_approval/approval.config.js";


export async function addRequestRepo(data: AddRequestInput, userId: number,attachments: UploadedAttachment[]) {
  return prisma.$transaction(async (tx) => {

    const fromDepartment = await tx.departmentBranches.findFirst({
      where: {
        id: data.fromId,
        isBranch: false,
      },
      select: {
        id: true,
      },
    });

    if (!fromDepartment) {
      throw new Error(
        "Invalid FROM department. Please select a department, not a branch."
      );
    }

   
    const branchDepartment = await tx.departmentBranches.findFirst({
      where: {
        id: data.branchDepartmentId,
      },
      select: {
        id: true,
      },
    });

    if (!branchDepartment) {
      throw new Error(
        "Invalid branch selection. Please select a valid branch."
      );
    }

      const worker = await tx.workerList.findUnique({
      where: {
        id: data.requestToId,
      },
      select: {
        id: true,
      },
    });

    if (!worker) {
      throw new Error("Selected request recipient does not exist.");
    }

    // 3. Generate reference number
    const counter = await tx.referenceCounter.upsert({
      where: {
        name: "WORKING_PERMIT",
      },
      create: {
        name: "WORKING_PERMIT",
        lastValue: 10001,
      },
      update: {
        lastValue: {
          increment: 1,
        },
      },
    });

    const referenceNumber = `WP${counter.lastValue}`;

     return tx.workingPermit.create({
          data: {
            referenceNumber,

          createdBy: {
            connect: {
              id: userId,
            },
          },
            WorkerList: {
              connect: {
                id: worker.id,
              },
            },

            fromDepartment: {
              connect: {
                id: fromDepartment.id,
              },
            },

            branchDepartment: {
              connect: {
                id: branchDepartment.id,
              },
            },

            requestLevel: data.requestLevel,
            date: getDate(),
            requestFor: data.requestFor,
            requestedBy: data.requestedBy,
            checkedBy: data.checkedBy ?? null,
            attachments: {
              create: attachments.map((file) => ({
                originalName: file.originalName,
                storedName: file.storedName,
                mimeType: file.mimeType,
                fileSize: file.fileSize,
              })),
            },


            ApprovalTable: {
              create: APPROVAL_WORKFLOW[data.requestLevel].map((role, index) => ({
                sequence: index + 1,
                role,
                status: WorkingPermitStatus.PENDING,
              })),
            },
          },

          include: {
            ApprovalTable: true,
          },
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
    throw new Error("Authenticated user ID is required");
  }

  const currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const pageLimit = Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;
  const visibilityFilters: Prisma.WorkingPermitWhereInput[] = [];

  if (roles.includes("COORDINATOR")) {
    visibilityFilters.push({ createdById: userId });
  }
  if (roles.includes("CHECKER")) {
    visibilityFilters.push({ fromDepartment: { is: { checkerId: userId } } });
  }
  if (roles.includes("FIRST_APPROVER")) {
    visibilityFilters.push({
      requestLevel: "LEVEL_2",
      WorkerList: { is: { firstApproverUserId: userId } },
      ApprovalTable: { some: { role: "CHECKER", status: WorkingPermitStatus.APPROVED } },
    });
  }
  if (roles.includes("FINAL_APPROVER")) {
    visibilityFilters.push({
      WorkerList: { is: { finalApproverUserId: userId } },
      OR: [
        {
          requestLevel: "LEVEL_1",
          ApprovalTable: { some: { role: "CHECKER", status: WorkingPermitStatus.APPROVED } },
        },
        {
          requestLevel: "LEVEL_2",
          ApprovalTable: { some: { role: "FIRST_APPROVER", status: WorkingPermitStatus.APPROVED } },
        },
      ],
    });
  }
  if (roles.includes("TROUBLESHOOTER")) {
    visibilityFilters.push({
      WorkerList: {
        is: { troubleshooters: { some: { id: userId, isActive: true } } },
      },
      ApprovalTable: {
        some: { role: "FINAL_APPROVER", status: WorkingPermitStatus.APPROVED },
      },
    });
  }

  const visibilityWhere: Prisma.WorkingPermitWhereInput =
    roles.includes("ADMIN") ? {} :
    visibilityFilters.length ? { OR: visibilityFilters } : { id: { in: [] } };

  const term = search?.trim();
  const searchWhere: Prisma.WorkingPermitWhereInput = term
    ? {
        OR: [
          { referenceNumber: { contains: term } },
          { WorkerList: { is: { workerName: { contains: term } } } },
        ],
      }
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
        receivedById: true,
        receivedAt: true,
        attachments: {
          select: {
            id: true,
            workingPermitId: true,
            originalName: true,
            storedName: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        WorkerList: {
          select: {
            id: true,
            workerName: true,
            firstApproverUserId: true,
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
        fromDepartment: {
          select: { id: true, entityName: true, checkerId: true },
        },
        branchDepartment: {
          select: { id: true, entityName: true },
        },
        ApprovalTable: {
          select: {
            id: true,
            sequence: true,
            role: true,
            status: true,
            statusAt: true,
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



export async function updateWorkingPermitRepo(id: string, userId: number, data: UpdateWorkingPermitInput, attachments: UploadedAttachment[]) {
  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findUnique({
      where: { id },
      select: { createdById: true, attachments: { select: { id: true } } },
    });
    if (!permit) return { outcome: "NOT_FOUND" as const };
    if (permit.createdById !== userId) return { outcome: "FORBIDDEN" as const };
    if (permit.attachments.length + attachments.length > 5) return { outcome: "TOO_MANY_FILES" as const };

    const department = await tx.departmentBranches.findFirst({
      where: { id: data.fromId, isBranch: false },
      select: { checker: { select: { name: true } } },
    });
    const branch = await tx.departmentBranches.findUnique({ where: { id: data.branchDepartmentId }, select: { id: true } });
    const worker = await tx.workerList.findUnique({ where: { id: data.requestToId }, select: { id: true } });
    if (!department?.checker?.name || !branch || !worker) return { outcome: "INVALID_SELECTION" as const };

    // Only the creator may edit until the checker processes the request.
    const changed = await tx.workingPermit.updateMany({
      where: {
        id,
        createdById: userId,
        ApprovalTable: { some: { sequence: 1, role: "CHECKER", status: WorkingPermitStatus.PENDING } },
      },
      data: {
        requestToId: data.requestToId,
        fromId: data.fromId,
        branchDepartmentId: data.branchDepartmentId,
        requestLevel: data.requestLevel,
        requestFor: data.requestFor,
        requestedBy: data.requestedBy,
        checkedBy: department.checker.name,
      },
    });
    if (changed.count !== 1) return { outcome: "LOCKED" as const };

    // Rebuild pending stages if the creator changes the level before checker approval.
    if (data.requestLevel !== undefined) {
      await tx.approvalTable.deleteMany({
        where: { workingPermitId: id, role: { not: "CHECKER" } },
      });
      await tx.approvalTable.createMany({
        data: APPROVAL_WORKFLOW[data.requestLevel].slice(1).map((role, index) => ({
          workingPermitId: id,
          sequence: index + 2,
          role,
          status: WorkingPermitStatus.PENDING,
        })),
      });
    }

    if (attachments.length > 0) await tx.workingPermitAttachment.createMany({
      data: attachments.map(file => ({
        workingPermitId: id,
        originalName: file.originalName,
        storedName: file.storedName,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
      })),
    });
    return { outcome: "UPDATED" as const, id };
  });
}