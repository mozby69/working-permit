import { useQuery } from "@tanstack/react-query";
import { DepartmentBranchFilter, getDepartmentBranches } from "../service/department-branch.service";



export function useDepartmentBranches(
  params: DepartmentBranchFilter = {}
) {
  return useQuery({
    queryKey: ["department-branches", params.isBranch ?? "all"],
    queryFn: () => getDepartmentBranches(params),
    select: (response) => response.data,
    staleTime: 60_000,
  });
}