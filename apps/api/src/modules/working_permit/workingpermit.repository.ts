import { prisma } from "@/lib/database/prisma";
import { getDate } from "@/utils/dateFormatter";
import { AddRequestInput, CheckDuplicateWorkingPermitInput, MyApprovedPermitFilters, UpdateWorkingPermitInput } from "@repo/shared";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";
import { Prisma } from "../../../generated/prisma/client";
import { QueryParamWP, UploadedAttachment } from "./workingpermit.types";
import { WorkingPermitStatus } from "../../../generated/prisma/client";
import { notifyAssignedApproverTx } from "../notifications/notification.service";
import { request } from "node:http";
//import { APPROVAL_WORKFLOW } from "../wp_approval/approval.config.js";


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

    const permit = await tx.workingPermit.create({
      data: {
        referenceNumber: `WP${counter.lastValue}`,
        createdBy: { connect: { id: userId } },
        WorkerList: { connect: { id: worker.id } },
        fromDepartment: { connect: { id: from.id } },
        branchDepartment: { connect: { id: branch.id } },
       ...(data.requestTypeId != null && {
          RequestType: {
            connect: {
              id: Number(data.requestTypeId),
            },
          },
        }),
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

   const notification = await notifyAssignedApproverTx(
      tx,
      permit,
      "CHECKER"
    );

    return {
      permit,
      notification,
    };


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
  const { page = 1, limit = 10, search, userId, roles = [] ,requestToId, date,} = params;
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Authenticated user ID is required.");
  }
  const currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const pageLimit = Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;

  const visible: Prisma.WorkingPermitWhereInput[] = [];
  // if (roles.includes("COORDINATOR")) 
  //   visible.push({ 
  //   createdById: userId
  //  });
  
  if (roles.includes("COORDINATOR")) {
    visible.push({});
  }

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
    status: {
      in: [
        WorkingPermitStatus.PENDING,
        WorkingPermitStatus.IN_PROGRESS,
        WorkingPermitStatus.COMPLETED,
      ],
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
  
     const filterWhere: Prisma.WorkingPermitWhereInput = {
      ...(requestToId !== undefined && {
        requestToId,
      }),

      ...(date && {
        date: new Date(`${date}T00:00:00.000Z`),
      }),
    };


  const where: Prisma.WorkingPermitWhereInput = { AND: [visibilityWhere, searchWhere, filterWhere] };

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
            id: true, sequence: true, role: true, approverId: true, status:true, approvedAt: true, rejectedAt:true,rejectRemarks:true,
            approver: { select: { id: true, name: true } },
          },
          orderBy: { sequence: "asc" },
        },
         remarksList: {
            select: {
              id: true,
              description: true,
              createdAt: true,

              createdBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },

            orderBy: [
              { createdAt: "desc" },
              { id: "desc" },
            ],
          },
          requestTypeId: true,
           RequestType: {
              select: {
                id: true,
                description: true,
              },
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
  removedAttachmentIds: string[]
) {
  return prisma.$transaction(async (tx) => {
    const permit = await tx.workingPermit.findUnique({
      where: { id },
      select: {
        createdById: true,
        status: true,
        requestLevel: true,

        attachments: {
          select: {
            id: true,
            storedName: true,
          },
        },

        ApprovalTable: {
          select: {
            approvedAt: true,
          },
        },
      },
    });

    if (!permit) {
      return { outcome: "NOT_FOUND" as const };
    }

    if (permit.createdById !== userId) {
      return { outcome: "FORBIDDEN" as const };
    }

    if (
      permit.status !== WorkingPermitStatus.PENDING ||
      permit.ApprovalTable.some(
        (approval) => approval.approvedAt !== null
      )
    ) {
      return { outcome: "LOCKED" as const };
    }

    // Validate selected attachments belong to this permit.
    const removalIds = new Set(removedAttachmentIds);

    const attachmentsToRemove = permit.attachments.filter(
      (attachment) => removalIds.has(attachment.id)
    );

    if (attachmentsToRemove.length !== removalIds.size) {
      return { outcome: "INVALID_ATTACHMENTS" as const };
    }

    // Existing - removed + newly uploaded.
    const totalAttachments =
      permit.attachments.length -
      attachmentsToRemove.length +
      attachments.length;

    if (totalAttachments > 5) {
      return { outcome: "TOO_MANY_FILES" as const };
    }

    const department = await tx.departmentBranches.findFirst({
      where: {
        id: data.fromId,
        isBranch: false,
      },
      select: {
        checkerId: true,
        checker: {
          select: {
            name: true,
            isActive: true,
          },
        },
      },
    });

    const branch = await tx.departmentBranches.findUnique({
      where: {
        id: data.branchDepartmentId,
      },
      select: {
        id: true,
      },
    });

    const worker = await tx.workerList.findUnique({
      where: {
        id: data.requestToId,
      },
      select: {
        firstApproverUserId: true,
        finalApproverUserId: true,

        firstApproverUser: {
          select: {
            isActive: true,
          },
        },

        finalApproverUser: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (
      !department?.checkerId ||
      !department.checker?.isActive ||
      !branch ||
      !worker?.finalApproverUserId ||
      !worker.finalApproverUser?.isActive ||
      (data.requestLevel === "LEVEL_2" &&
        (!worker.firstApproverUserId ||
          !worker.firstApproverUser?.isActive))
    ) {
      return { outcome: "INVALID_SELECTION" as const };
    }

    // Guard against approval changes during editing.
    const changed = await tx.workingPermit.updateMany({
      where: {
        id,
        createdById: userId,
        status: WorkingPermitStatus.PENDING,
        ApprovalTable: {
          every: {
            approvedAt: null,
          },
        },
      },
      data: {
        requestToId: data.requestToId,
        fromId: data.fromId,
        branchDepartmentId: data.branchDepartmentId,
        requestLevel: data.requestLevel,
        requestFor: data.requestFor,
        requestedBy: data.requestedBy,
        checkedBy: department.checker.name,

        requestTypeId: data.requestTypeId ?? null,
      },
    });

    if (changed.count !== 1) {
      return { outcome: "LOCKED" as const };
    }

    // Delete selected existing attachment records.
    if (attachmentsToRemove.length > 0) {
      await tx.workingPermitAttachment.deleteMany({
        where: {
          workingPermitId: id,
          id: {
            in: attachmentsToRemove.map(
              (attachment) => attachment.id
            ),
          },
        },
      });
    }

    // Rebuild approval assignments.
    await tx.approvalTable.deleteMany({
      where: {
        workingPermitId: id,
      },
    });

    const assignments = [
      {
        sequence: 1,
        role: "CHECKER",
        approverId: department.checkerId,
      },

      ...(data.requestLevel === "LEVEL_2"
        ? [
            {
              sequence: 2,
              role: "FIRST_APPROVER",
              approverId: worker.firstApproverUserId!,
            },
          ]
        : []),

      {
        sequence: data.requestLevel === "LEVEL_1" ? 2 : 3,
        role: "FINAL_APPROVER",
        approverId: worker.finalApproverUserId,
      },
    ];

    await tx.approvalTable.createMany({
      data: assignments.map((assignment) => ({
        workingPermitId: id,
        ...assignment,
      })),
    });

    // Save new attachment records.
    if (attachments.length > 0) {
      await tx.workingPermitAttachment.createMany({
        data: attachments.map((file) => ({
          workingPermitId: id,
          originalName: file.originalName,
          storedName: file.storedName,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
        })),
      });
    }

    return {
      outcome: "UPDATED" as const,
      id,
      removedFiles: attachmentsToRemove.map(
        (attachment) => ({
          storedName: attachment.storedName,
        })
      ),
    };
  });
}





export async function addWorkingPermitRemarkRepo(
  workingPermitId: string,
  userId: number,
  description: string
) {
  return prisma.$transaction(async (tx) => {

const permit = await prisma.workingPermit.findFirst({
  where: {
    id: workingPermitId,

    // User must be an assigned Troubleshooter
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

    // Final Approver must have approved
    ApprovalTable: {
      some: {
        role: "FINAL_APPROVER",
        status: WorkingPermitStatus.APPROVED,
        approvedAt: {
          not: null,
        },
      },
    },

   status: {
      in: [
        WorkingPermitStatus.PENDING,
        WorkingPermitStatus.IN_PROGRESS,
      ],
    },
  },

  select: {
    id: true,
    status: true,
    receivedById: true,
  },
});

if (!permit) {
  throw new Error(
    "Remarks can only be added by an assigned Troubleshooter " +
    "after final approval while the request is pending or in progress."
  );
}


    // CREATE, not UPDATE — preserves previous remarks
    const remark = await tx.workingPermitRemark.create({
      data: {
        workingPermitId,
        description,
        createdById: userId,
      },

      select: {
        id: true,
        description: true,
        createdAt: true,

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true as const,
      data: remark,
    };
  });
}




export async function getAllRequestTypesRepo() {
  return prisma.requestType.findMany({
    select: {
      id: true,
      description: true,
    },
    orderBy: {
      description: "asc",
    },
  });
}





export async function checkDuplicateWorkingPermitRepo(
  data: CheckDuplicateWorkingPermitInput
) {

    if (data.requestTypeId == null) {
    return {
      isDuplicate: false,
      existingPermit: null,
    };
  }


  const permitDate = getDate();

  const existingPermit = await prisma.workingPermit.findFirst({
    where: {
      requestToId: data.requestToId,
      fromId: data.fromId,
      branchDepartmentId: data.branchDepartmentId,
      requestTypeId: data.requestTypeId,
      date: permitDate,
      status: WorkingPermitStatus.PENDING
    },

    select: {
      id: true,
      referenceNumber: true,
      date: true,
      status: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    isDuplicate: existingPermit !== null,

    existingPermit: existingPermit
      ? {
          id: existingPermit.id,
          referenceNumber: existingPermit.referenceNumber,
          date: existingPermit.date.toISOString().slice(0, 10),
          status: existingPermit.status,
        }
      : null,
  };
}


export async function getMyApprovedPermitRepo(
  userId: number,
  filters: MyApprovedPermitFilters = {}
) {
  const {
    page = 1,
    limit = 6,
    search = "",
    status = "ALL",
  } = filters;

  // ==========================================
  // PAGINATION
  // ==========================================

  const currentPage = Math.max(1, Math.floor(page));
  const pageSize = Math.min(
    100,
    Math.max(1, Math.floor(limit))
  );

  const skip = (currentPage - 1) * pageSize;

  // ==========================================
  // APPROVER FILTER
  // ==========================================

  const approverWhere: Prisma.WorkingPermitWhereInput = {
    ApprovalTable: {
      some: {
        approverId: userId,
        status: {
          in: ["APPROVED", "COMPLETED"],
        },
      },
    },
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================

  const searchWhere: Prisma.WorkingPermitWhereInput =
    search.trim()
      ? {
          OR: [
            {
              referenceNumber: {
                contains: search.trim(),
              },
            },
            {
              requestFor: {
                contains: search.trim(),
              },
            },
            {
              requestedBy: {
                contains: search.trim(),
              },
            },
            {
              branchDepartment: {
                is: {
                  entityName: {
                    contains: search.trim(),
                  },
                },
              },
            },
            {
              WorkerList: {
                is: {
                  workerName: {
                    contains: search.trim(),
                  },
                },
              },
            },
          ],
        }
      : {};

  // ==========================================
  // STATUS FILTER
  // ==========================================

  let statusWhere: Prisma.WorkingPermitWhereInput = {};

  if (status === "UNFINISHED") {
    statusWhere = {
      status: {
        not: "COMPLETED",
      },
    };
  } else if (status !== "ALL") {
    statusWhere = {
      status,
    };
  }

  // ==========================================
  // COMBINED FILTER
  // ==========================================

  const where: Prisma.WorkingPermitWhereInput = {
    AND: [
      approverWhere,
      searchWhere,
      statusWhere,
    ],
  };

  // ==========================================
  // DATABASE QUERIES
  // ==========================================

  const [permits, total, statusCounts] =
    await prisma.$transaction([
      prisma.workingPermit.findMany({
        where,

        skip,
        take: pageSize,

        include: {
          branchDepartment: {
            select: {
              id: true,
              entityName: true,
            },
          },

          fromDepartment: {
            select: {
              id: true,
              entityName: true,
            },
          },

          WorkerList: {
            select: {
              id: true,
              workerName: true,
            },
          },

          receivedBy: {
            select: {
              id: true,
              name: true,
            },
          },

          remarksList: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              description: true,
              createdAt: true,
              createdBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          ApprovalTable: {
            orderBy: {
              sequence: "asc",
            },
            select: {
              id: true,
              sequence: true,
              role: true,
              status: true,
              approvedAt: true,
              rejectedAt: true,
              rejectRemarks: true,
              approver: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },

        orderBy: [
          { updatedAt: "desc" },
          { id: "desc" },
        ],
      }),

      // Total matching records after search/status filters
      prisma.workingPermit.count({
        where,
      }),

      // Summary counts across all approved permits
      prisma.workingPermit.groupBy({
        by: ["status"],
        where: approverWhere,
        _count: {
          _all: true,
        },
      }),
    ]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const getCount = (status: WorkingPermitStatus) =>
    statusCounts.find(
      (item) => item.status === status
    )?._count._all ?? 0;

  const pending = getCount("PENDING");
  const approved = getCount("APPROVED");
  const inProgress = getCount("IN_PROGRESS");
  const completed = getCount("COMPLETED");
  const rejected = getCount("REJECTED");
  const cancelled = getCount("CANCELLED");

  const totalApprovedPermits = statusCounts.reduce(
    (sum, item) => sum + item._count._all,
    0
  );

  return {
    data: permits,

    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },

    summary: {
      total: totalApprovedPermits,
      pending,
      approved,
      inProgress,
      completed,
      rejected,
      cancelled,
      unfinished: totalApprovedPermits - completed,
    },
  };
}