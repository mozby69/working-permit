import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {  departmentBranchService, } from "../service/department-branch.service";
import { CreateDepartmentBranchInput, DepartmentBranchFilter, UpdateDepartmentBranchInput } from "@repo/shared";


const queryKey = ["department-branches"] as const;

export function useDepartmentBranches(
  params: DepartmentBranchFilter = {}
) {
  return useQuery({
    queryKey: [...queryKey, params.isBranch ?? "all"],
    queryFn: () => departmentBranchService.getAll(params),
    select: (response) => response.data,
    staleTime: 60_000,
  });
}

// New hook - paginated tables
export function usePaginatedDepartmentBranches(
  params: DepartmentBranchFilter = {}
) {
  return useQuery({
    queryKey: ["department-branches", "paginated", params],
    queryFn: () => departmentBranchService.getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });
}


export function useCreateDepartmentBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDepartmentBranchInput) =>
            departmentBranchService.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey,
            });
        },
    });
}


export function useUpdateDepartmentBranch() {
    const queryClient = useQueryClient();

   return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: number;
            payload: UpdateDepartmentBranchInput;
        }) => departmentBranchService.update(id, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey,
            });
        },
    })
        
}

export function useDeleteDepartmentBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            departmentBranchService.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey,
            });
        },
    });
}