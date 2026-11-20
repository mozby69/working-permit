
import api from "@/lib/api/api-client";
import { MyApprovedPermitFilters, MyApprovedPermitResponse } from "@repo/shared";



export const ongoingPermitService = {
  async getMyApproved(
    filters: MyApprovedPermitFilters = {}
  ): Promise<MyApprovedPermitResponse> {
    const response =
      await api.get<MyApprovedPermitResponse>(
        "/working-permit/my-approved-permit",
        {
          params: {
            page: filters.page ?? 1,
            limit: filters.limit ?? 6,
            search: filters.search ?? "",
            status: filters.status ?? "ALL",
          },
        }
      );

    return response.data;
  },
};
