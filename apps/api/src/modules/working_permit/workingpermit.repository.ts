import { prisma } from "@/lib/database/prisma";
import { getDate } from "@/utils/dateFormatter";
import { AddRequestInput } from "@repo/shared";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";
import { Prisma } from "../../../generated/prisma/client";



export async function addRequestRepo(data: AddRequestInput, userId: number) {
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
            attachment: data.attachment ?? null,


            ApprovalTable: {
              create: {
                status: "PENDING",
                checkedStatus: "PENDING",
                firstApproverStatus: "PENDING",
                finalApproverStatus: "PENDING",

                statusAt: null,
                checkedStatusAt: null,
                firstApproverApprovedAt: null,
                finalApproverApprovedAt: null,
              },
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






export type QueryParamWP = {
  page?: number;
  limit?: number;
  search?: string;
  userId: number;
  roles: string[];
};

export async function displayWorkingPermit(params: QueryParamWP) {
  const {
    page = 1,
    limit = 10,
    search,
    userId,
    roles = [],
  } = params;


  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw new Error(
      "Authenticated user ID is required"
    );
  }


  const currentPage =
    Number.isSafeInteger(page) && page > 0
      ? page
      : 1;

  const pageLimit =
    Number.isSafeInteger(limit) && limit > 0
      ? Math.min(limit, 100)
      : 10;


  const visibilityFilters: Prisma.WorkingPermitWhereInput[] = [];

  const isAdmin = roles.includes("ADMIN");
  const isCoordinator = roles.includes("COORDINATOR");
  const isChecker = roles.includes("CHECKER");

  if (isCoordinator) {
    visibilityFilters.push({
      createdById: userId,
    });
  }

  if (isChecker) {
    visibilityFilters.push({
      sequence: 1,

      fromDepartment: {
        is: {
          checkerId: userId,
        },
      },

      ApprovalTable: {
        some: {
          status: "PENDING",
          checkedStatus: "PENDING",
        },
      },
    });
  }

  // -------------------------------------------
  // 4. Build Prisma WHERE
  // -------------------------------------------

  const where: Prisma.WorkingPermitWhereInput = {};

  if (!isAdmin) {
    if (visibilityFilters.length === 0) {
      // No permitted role: return no records
      where.id = {
        in: [],
      };
    } else {
      where.OR = visibilityFilters;
    }
  }

  // -------------------------------------------
  // 5. Apply search without overriding roles
  // -------------------------------------------

  const term = search?.trim();

  if (term) {
    const searchFilter: Prisma.WorkingPermitWhereInput = {
      OR: [
        {
          referenceNumber: {
            contains: term,
          },
        },
        {
          WorkerList: {
            is: {
              worker_name: {
                contains: term,
              },
            },
          },
        },
      ],
    };

    // AND ensures both visibility and search match.
    const visibilityWhere: Prisma.WorkingPermitWhereInput = {
      ...where,
    };

    delete where.OR;
    delete where.id;

    where.AND = [
      visibilityWhere,
      searchFilter,
    ];
  }

  // -------------------------------------------
  // 6. Fetch Working Permits and total count
  // -------------------------------------------

  const [wp_data, total] = await prisma.$transaction([
    prisma.workingPermit.findMany({
      where,

      select: {
        id: true,
        referenceNumber: true,
        sequence: true,
        requestToId: true,
        requestLevel: true,
        date: true,
        requestFor: true,
        requestedBy: true,
        checkedBy: true,
        attachment: true,
        createdById: true,

        WorkerList: {
          select: {
            id: true,
            worker_name: true,
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
        },

        fromDepartment: {
          select: {
            id: true,
            entityName: true,
            checkerId: true,
          },
        },

        branchDepartment: {
          select: {
            entityName: true,
          },
        },

        ApprovalTable: {
          select: {
            status: true,
            checkedStatus: true,
            finalApproverStatus: true,
            firstApproverStatus: true,
            statusAt: true,
            checkedStatusAt: true,
            firstApproverApprovedAt: true,
            finalApproverApprovedAt: true,
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },
      },

      skip: (currentPage - 1) * pageLimit,
      take: pageLimit,

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.workingPermit.count({
      where,
    }),
  ]);

  // -------------------------------------------
  // 7. Return data with pagination
  // -------------------------------------------

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
      worker_name: true,

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
      worker_name: "asc",
    },
  });
}




export async function approveWorkingPermitByCheckerRepo(
  workingPermitId: string,
  userId: number
) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify the permit is assigned to this Checker
    const permit = await tx.workingPermit.findFirst({
      where: {
        id: workingPermitId,
        sequence: 1,

        fromDepartment: {
          is: {
            checkerId: userId,
          },
        },

        ApprovalTable: {
          some: {
            status: "PENDING",
            checkedStatus: "PENDING",
          },
        },
      },

      select: {
        id: true,
        ApprovalTable: {
          where: {
            status: "PENDING",
            checkedStatus: "PENDING",
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!permit) {
      throw new Error(
        "Working Permit is not assigned to you or is no longer pending."
      );
    }

    if (permit.ApprovalTable.length !== 1) {
      throw new Error(
        "Expected exactly one pending approval record."
      );
    }

    // 2. Claim this stage atomically to prevent duplicate approvals
    const advanced = await tx.workingPermit.updateMany({
      where: {
        id: workingPermitId,
        sequence: 1,
        fromDepartment: {
          is: {
            checkerId: userId,
          },
        },
      },
      data: {
        sequence: 2,
      },
    });

    if (advanced.count !== 1) {
      throw new Error(
        "This Working Permit has already been processed."
      );
    }

    // 3. Approve the Checker stage
    const approval = await tx.approvalTable.updateMany({
      where: {
        id: permit.ApprovalTable[0].id,
        workingPermitId,
        status: "PENDING",
        checkedStatus: "PENDING",
      },

      data: {
        checkedStatus: "APPROVED",
        checkedStatusAt: new Date(),
      },
    });

    if (approval.count !== 1) {
      throw new Error(
        "Checker approval could not be updated."
      );
    }

    return {
      workingPermitId,
      sequence: 2,
      checkedStatus: "APPROVED" as const,
    };
  });
}