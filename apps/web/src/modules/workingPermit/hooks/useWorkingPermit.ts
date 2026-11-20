"use client";


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as serviceWorkingPermit from '../services/workingPermitService'
import { AddRemarkParams, ApprovalResponse, ApproveWorkingPermitInput, CheckDuplicateWorkingPermitInput, CreateWorkingPermitPayload, QueryParams, RejectWorkingPermitInput, RejectWorkingPermitResponse, RequestType, TroubleshooterActionResponse, TroubleshooterMutationInput, UpdateWorkingPermitParams } from '@repo/shared';



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
       await queryClient.invalidateQueries({
        queryKey: ["ongoing-permit"],
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
      params.requestToId,
      params.date,
    ],

    queryFn: () =>
      serviceWorkingPermit.getWorkingPermitService(params),
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

  return useMutation<
    ApprovalResponse,
    Error,
    ApproveWorkingPermitInput
  >({
    mutationFn: ({ workingPermitId, stage }) =>
      serviceWorkingPermit.approveWorkingPermitService(
        workingPermitId,
        stage
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permit-display"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["ongoing-permit"],
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
        await queryClient.invalidateQueries({
        queryKey: ["ongoing-permit"],
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
      await queryClient.invalidateQueries({
        queryKey: ["ongoing-permit"],
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




export function useAddWorkingPermitRemark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workingPermitId,
      payload,
    }: AddRemarkParams) =>
      serviceWorkingPermit.addWorkingPermitRemarkService(
        workingPermitId,
        payload
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permit-display"],
      });
    },
  });
}





export function useRejectWorkingPermit() {
  const queryClient = useQueryClient();

  return useMutation<
    RejectWorkingPermitResponse,
    Error,
    RejectWorkingPermitInput
  >({
    mutationFn: ({ workingPermitId, stage, rejectRemarks }) =>
  serviceWorkingPermit.rejectWorkingPermitService(
    workingPermitId,
    stage,
    rejectRemarks
  ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["working-permit-display"],
      });
    },
  });
}



export const requestTypeKeys = {
  all: ["request-types"] as const,
  list: () => [...requestTypeKeys.all, "list"] as const,
};

export function useRequestTypes() {
  return useQuery<RequestType[], Error>({
    queryKey: requestTypeKeys.list(),
    queryFn: serviceWorkingPermit.getRequestTypes,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}



export function useCheckDuplicateWorkingPermit() {
  return useMutation({
    mutationFn: (payload: CheckDuplicateWorkingPermitInput) =>
      serviceWorkingPermit.checkDuplicateWorkingPermitService(payload),
  });
}