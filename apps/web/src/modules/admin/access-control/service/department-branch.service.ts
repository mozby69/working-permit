import api from "@/lib/api/api-client";
import { ApiResponse, CreateDepartmentBranchInput, DepartmentBranch, DepartmentBranchFilter, DepartmentBranchPaginationResponse, UpdateDepartmentBranchInput } from "@repo/shared";





type DepartmentBranchResponse = {
  success: boolean;
  data: DepartmentBranch[];
};
const API_URL = "/admin/department-branches";

export const departmentBranchService = {

 async getAll(
  params: DepartmentBranchFilter = {}
): Promise<DepartmentBranchResponse> {
  const response = await api.get<DepartmentBranchResponse>(
    "/admin/department-branches",
    { params }
  );

  return response.data;
},
    // New endpoint - for paginated tables
    async getPaginated(
        params: DepartmentBranchFilter = {}
    ): Promise<DepartmentBranchPaginationResponse> {
        const response =
        await api.get<DepartmentBranchPaginationResponse>(
            "/admin/pagination-branches",
            { params }
        );

        return response.data;
    },

    async create(payload: CreateDepartmentBranchInput){
        const response = await api.post<
            ApiResponse<DepartmentBranch>
        >(API_URL, payload);
        
        return response.data.data;
    },

    async update(
        id:number,
        payload: UpdateDepartmentBranchInput
    ){
        const response = await api.patch<
            ApiResponse<DepartmentBranch>
            >(`${API_URL}/${id}`, payload);
            
        return response.data.data;
    },

    async delete(id: number){
        await api.delete(`${API_URL}/${id}`);
    }

}