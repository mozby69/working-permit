import api from "@/lib/api/api-client";
import { BranchWorkingFilters, BranchWorkingResponse } from "@repo/shared";


export const branchWorkingService = {
  async getAll(
    params: BranchWorkingFilters = {}
  ): Promise<BranchWorkingResponse> {
    const response = await api.get<BranchWorkingResponse>(
      "/admin/my-working-permits",
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search: params.search ?? "",
        },
      }
    );

    return response.data;
  },
};
