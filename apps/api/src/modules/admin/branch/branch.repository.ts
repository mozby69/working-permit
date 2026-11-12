import { prisma } from "@/lib/database/prisma";

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
    orderBy: {
      entity_name: "asc",
    },
  });
}