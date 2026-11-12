import { prisma } from "@/lib/database/prisma";
import { getDate } from "@/utils/dateFormatter";
import { AddRequestInput } from "@repo/shared";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";
import { Prisma } from "../../../generated/prisma/client";



export async function addRequestRepo(data: AddRequestInput) {
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
                CheckedStatus: "PENDING",
                approvedFirstApprover: "PENDING",
                approvedFinalApprover: "PENDING",

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






export async function displayWorkingPermit(params: QueryParams) {
  const { page = 1, limit = 10, search, userId } = params;

  const where: Prisma.WorkingPermitWhereInput = {};

  if (search?.trim()) {
    const term = search.trim();

    where.OR = [
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
    ];
  }

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
        attachment: true,

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
            entityName: true,
          },
        },

        branchDepartment: {
          select: {
            entityName: true,
          },
        },
        
        
        ApprovalTable:{
          select:{
            status:true,
            CheckedStatus:true,
            FirstApproverStatus:true,
            FinalApproverStatus:true,
            statusAt:true,
            checkedStatusAt:true,
            firstApproverApprovedAt:true,
            finalApproverApprovedAt:true,
          }
        }
      },

      skip: (page - 1) * limit,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.workingPermit.count({ where }),
  ]);

  return {
    data: wp_data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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