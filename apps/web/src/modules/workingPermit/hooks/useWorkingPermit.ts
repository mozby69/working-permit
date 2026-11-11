"use client";


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as serviceWorkingPermit from '../services/workingPermitService'
import { QueryParamsDatatable } from '@repo/shared';



export function useCreateWorkingPermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceWorkingPermit.addWorkingPermitService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permit-display"],
      });
      
    },
  });
};

export function useNextWorkingPermitReference(enabled = true) {
  return useQuery({
    queryKey: ["working-permit-next-reference"],
    queryFn: serviceWorkingPermit.getNextReferenceService,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}


export function useDepartmentBranches() {
  return useQuery({
    queryKey: ["department-branches"],
    queryFn: serviceWorkingPermit.getDepartmentBranchesService,
    staleTime: 5 * 60 * 1000,
  });
}




export function useGetWorkingPermit(params: serviceWorkingPermit.QueryParams) {
  return useQuery({
    queryKey: [
      "working-permit-display",
      params.page,
      params.limit,
      params.search,
    ],
    queryFn: () => serviceWorkingPermit.getWorkingPermitService(params),
  });
}


export function useWorkerList() {
  return useQuery({
    queryKey: ["worker-list"],
    queryFn: serviceWorkingPermit.getWorkerListService,
    staleTime: 5 * 60 * 1000,
  });
}