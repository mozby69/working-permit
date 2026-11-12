import { prisma } from "@/lib/database/prisma";
import { CreateDepartmentBranchInput, UpdateDepartmentBranchInput } from "@repo/shared";

type DepartmentBranchFilter = {
  isBranch?: boolean;
};

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