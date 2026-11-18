import { prisma } from "@/lib/database/prisma";
import { BranchWorkingServiceParams, CreateDepartmentBranchInput, DepartmentBranchFilter, GetBranchWorkingParams, UpdateDepartmentBranchInput } from "@repo/shared";
import { Prisma } from "../../../../generated/prisma/client";


export async function getAllDepartmentBranches(
  filter: DepartmentBranchFilter = {}
) {
  return prisma.departmentBranches.findMany({
    where: {
      isBranch: filter.isBranch,
    },
    include:{
        checker: {
            select: {
                id: true,
                name: true,
                username: true,
                isActive: true
            },
        },
    },
    orderBy: {
      entityName: "asc",
    },
  });
}

export async function getPaginationDepartmentBranches(
  filter: DepartmentBranchFilter = {}
) {
  const page = Math.max(1, Number(filter.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filter.limit) || 10));
  const skip = (page - 1) * limit;

  const search = filter.search?.trim();

  const where: Prisma.DepartmentBranchesWhereInput = {
    ...(filter.isBranch !== undefined && {
      isBranch: filter.isBranch,
    }),

    ...(search && {
      entityName: {
        contains: search,
      },
    }),
  };

  const [data, total] = await prisma.$transaction([
    prisma.departmentBranches.findMany({
      where,
      skip,
      take: limit,
      include: {
        checker: {
          select: {
            id: true,
            name: true,
            username: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { entityName: "asc" },
        { id: "asc" },
      ],
    }),

    prisma.departmentBranches.count({
      where,
    }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


export async function findDepartmentBranchById(id: number) {
    return prisma.departmentBranches.findUnique({
        where:{
            id
        },
    });
    
}

export async function findDepartmentBranchByName(
  name: string,
  isBranch: boolean
) {
  return prisma.departmentBranches.findFirst({
    where: {
      entityName: name,
      isBranch,
    },
  });
}


export async function createDepartmentBranchRepo(
    data: CreateDepartmentBranchInput
) {
    return prisma.departmentBranches.create({
        data: {
            entityName: data.entityName,
            isBranch: data.isBranch,
            checkerId: data.checkerId
        },
    });
}

export async function updateDepartmentBranchRepo(
    id: number,
    data: UpdateDepartmentBranchInput
) {
    return prisma.departmentBranches.update({
        where: {id},
        data,
    });
}

export async function deleteDepartmentBranchRepo(id: number) {
    return prisma.departmentBranches.delete({
        where: {id},
    });
}

export async function getBranchWorkingRepo({
  userId,
  page = 1,
  limit = 10,
  search = "",
}: BranchWorkingServiceParams ) {
  const skip = (page - 1) * limit;
  const keyword = search.trim();

  const where = {
    branchDepartment: {
      is: {
        isBranch: true,
        userAssignments: {
          some: {
            userId,
          },
        },
      },
    },

    ...(keyword
      ? {
          OR: [
            {
              referenceNumber: {
                contains: keyword,
              },
            },
            {
              requestedBy: {
                contains: keyword,
              },
            },
            {
              requestFor: {
                contains: keyword,
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.workingPermit.findMany({
      where,

      select: {
        id: true,
        referenceNumber: true,
        requestLevel: true,
        date: true,
        requestFor: true,
        requestedBy: true,
        checkedBy: true,
        remarks: true,
        createdAt: true,

        fromDepartment: {
          select: {
            id: true,
            entityName: true,
          },
        },

        branchDepartment: {
          select: {
            id: true,
            entityName: true,
          },
        },

        WorkerList: {
          select: {
            id: true,
            workerName: true,

            firstApproverUser: {
              select: {
                id: true,
                name: true,
              },
            },

            finalApproverUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        ApprovalTable: {
          select: {
            status: true,
            checkedStatus: true,
            firstApproverStatus: true,
            finalApproverStatus: true,
            receivedAt: true,
            checkedStatusAt: true,
            firstApproverApprovedAt: true,
            finalApproverApprovedAt: true,
          },
        },

        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.workingPermit.count({
      where,
    }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}