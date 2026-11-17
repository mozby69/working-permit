"use client";


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as serviceWorkingPermit from '../services/workingPermitService'
import { ApproveWorkingPermitInput, CreateWorkingPermitPayload, QueryParams, TroubleshooterActionResponse, TroubleshooterMutationInput, UpdateWorkingPermitParams } from '@repo/shared';



export function useCreateWorkingPermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateWorkingPermitPayload
    ) => serviceWorkingPermit.addWorkingPermitService(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permit-display"],
      });
    },
  });
}

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




export function useGetWorkingPermit(params: QueryParams) {
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












// export function useApproveChecker() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (workingPermitId: string) =>
//       serviceWorkingPermit.approveCheckerService(workingPermitId),

//     onSuccess: async () => {
//       await queryClient.invalidateQueries({
//         queryKey: ["working-permits"],
//       });
//     },
//   });
// }


export function useApproveWorkingPermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workingPermitId,
      stage,
    }: ApproveWorkingPermitInput) =>
      serviceWorkingPermit.approveWorkingPermitService(workingPermitId, stage),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permits"],
      });
    },
  });
}





export function useReceiveWorkingPermit() {
  const queryClient = useQueryClient();

  return useMutation<
    TroubleshooterActionResponse,
    Error,
    TroubleshooterMutationInput
  >({
    mutationFn: ({ workingPermitId }) =>
      serviceWorkingPermit.troubleshooterService.receiveWorkingPermit(
        workingPermitId
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permits"],
      });
    },
  });
}


export function useCompleteWorkingPermit() {
  const queryClient = useQueryClient();

  return useMutation<
    TroubleshooterActionResponse,
    Error,
    TroubleshooterMutationInput
  >({
    mutationFn: ({ workingPermitId }) =>
       serviceWorkingPermit.troubleshooterService.completeWorkingPermit(
        workingPermitId
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permits"],
      });
    },
  });
}



export function useUpdateWorkingPermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: UpdateWorkingPermitParams) => {
      return serviceWorkingPermit.updateWorkingPermitService(id, payload);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permit-display"],
      });
    },
  });
}