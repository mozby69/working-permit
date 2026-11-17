import { prisma } from "@/lib/database/prisma";
import { CreateWorkingInput, UpdateWorkingInput } from "@repo/shared";





export async function getAllWorkingRepo() {
  return prisma.workerList.findMany({
    select: {
      id: true,
      workerName: true,
      firstApproverUserId: true,
      finalApproverUserId: true,
      createdAt: true,

      firstApproverUser: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },

      finalApproverUser: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findWorkingById(id: number) {
    return prisma.workerList.findUnique({
        where: {id},
    });
}

export async function findWorkingByWorkerNameRepo(name: string) {
    return prisma.workerList.findFirst({
        where:{
            workerName: name
        },
    });
}

export async function createWorkingRepo(data: CreateWorkingInput) {

    return prisma.workerList.create({
        data:{
            workerName: data.workerName,
            firstApproverUserId: data.firstApproverUserId,
            finalApproverUserId: data.firstApproverUserId
        },
    });
}

export async function updateWorkingRepo(
    id: number,
    data: UpdateWorkingInput
) {
    return prisma.workerList.update({
        where: {id},
        data
    })
}


