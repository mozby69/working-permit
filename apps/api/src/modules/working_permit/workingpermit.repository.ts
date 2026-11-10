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
        requestTo: data.requestTo,

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
        status: "PENDING",
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
      entity_name: true,
      isBranch: true,
      checkerId: true,

      CheckerList: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      entity_name: "asc",
    },
  });
}








export async function displayWorkingPermit(params: QueryParams) {
  const {
    page = 1,
    limit = 10,
    search,
  } = params;

  const where: Prisma.WorkingPermitWhereInput = {};

  if (search?.trim()) {
    where.OR = [
      {
        referenceNumber: {
          contains: search.trim(),
        },
      },
      // {
      //   branchDepartment: {
      //     contains: search.trim(),
      //   },
      // },
    ];
  }

  const [wp_data, total] = await prisma.$transaction([
    prisma.workingPermit.findMany({
      where,
      select: {
        id: true,
        referenceNumber: true,
        requestTo: true,
        requestLevel: true,
        date:true,
        requestFor:true,
        requestedBy:true,
        checkedBy:true,
        attachment:true,
        status:true,
  
        fromDepartment: {
          select: {
          entity_name:true,
          },
        },
        branchDepartment:{
          select:{
            entity_name:true,
          }
        },
  
      },

      skip: (page - 1) * limit,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.workingPermit.count({
      where,
    }),
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
      approved_by: true,
      final_approved_by: true,
    },
    orderBy: {
      worker_name: "asc",
    },
  });
}
