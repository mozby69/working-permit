import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DepartmentBranchFilter, departmentBranchService, } from "../service/department-branch.service";
import { CreateDepartmentBranchInput, UpdateDepartmentBranchInput } from "@repo/shared";
import { number } from "zod";


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