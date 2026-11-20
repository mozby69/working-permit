
"use client";

import { useQuery } from "@tanstack/react-query";

import { branchWorkingService } from "../services/branchWorking.service";
import { BranchWorkingFilters } from "@repo/shared";


export function useBranchWorking(
  filters: BranchWorkingFilters = {}
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const search = filters.search ?? "";

  return useQuery({
    queryKey: [
      "branch-working-permits",
      page,
      limit,
      search,
    ],

    queryFn: () =>
      branchWorkingService.getAll({
        page,
        limit,
        search,
      }),

    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
