
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import { ongoingPermitService } from "../services/ongoing-permit.service";
import { MyApprovedPermitFilters } from "@repo/shared";


export const ongoingPermitKeys = {
  all: ["ongoing-permit"] as const,

  myApproved: (filters: MyApprovedPermitFilters) =>
    [
      ...ongoingPermitKeys.all,
      "my-approved",
      filters,
    ] as const,
};

export function useMyApprovedPermits(
  filters: MyApprovedPermitFilters = {}
) {
  return useQuery({
    queryKey: ongoingPermitKeys.myApproved(filters),

    queryFn: () =>
      ongoingPermitService.getMyApproved(filters),

    placeholderData: keepPreviousData,

    staleTime: 30_000,

    refetchOnWindowFocus: true,
  });
}
