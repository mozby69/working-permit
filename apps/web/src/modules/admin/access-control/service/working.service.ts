import api from "@/lib/api/api-client";
import { ApiResponse, CreateWorkingInput, UpdateWorkingInput, WorkingType } from "@repo/shared";

const API_URL = "/admin/working";

export const workingService = {
  async getAll(): Promise<ApiResponse<WorkingType[]>> {
    const response = await api.get<ApiResponse<WorkingType[]>>(
      API_URL
    );

    return response.data;
  },

  async create(payload: CreateWorkingInput){
    const response = await api.post<
      ApiResponse<WorkingType>
      >(API_URL, payload);

      return response.data.data;
  },

  async update(
    id:number,
    payload: UpdateWorkingInput){
    const response =  await api.patch<
      ApiResponse<WorkingType>
      >(`${API_URL}/${id}`, payload);

      return response.data.data;
  }

  
};

