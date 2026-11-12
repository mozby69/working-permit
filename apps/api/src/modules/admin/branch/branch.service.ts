import { getAllDepartmentBranches } from "./branch.repository";


export async function getDepartmentBranchesService(
  isBranch?: boolean
) {
  return getAllDepartmentBranches({ isBranch });
}