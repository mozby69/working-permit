import api from "@/lib/api/api-client";
import { AddRequestInput, DepartmentBranch, DepartmentBranchesResponse, NextReferenceResponse, QueryParamsDatatable, WorkingPermitResponse, wpListResponseSchema } from "@repo/shared";





export async function addWorkingPermitService(payload: AddRequestInput) {
  const response = await api.post(
    "/working-permit/add-working-permit",
    payload
  );

  return response.data.data;
}





export async function getNextReferenceService(): Promise<string> {
  const response = await api.get<NextReferenceResponse>(
    "/working-permit/next-reference"
  );

  return response.data.data.referenceNumber;

}






export async function getDepartmentBranchesService(): Promise<
  DepartmentBranch[]
> {
  const response = await api.get<DepartmentBranchesResponse>(
    "/working-permit/department-branch-list"
  );

  return response.data.data.map((department) => ({
    id: department.id,
    entityName: department.entity_name,
    isBranch: department.isBranch,
    checkerId: department.checkerId,
    checker: department.CheckerList,
  }));
}

export interface WPListResponse {
  success: boolean;
  data: WorkingPermitResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;

  };
}


export type QueryParams = {
  page: number;
  limit: number;
  search?: string;
};


export async function getWorkingPermitService(
  params: QueryParams
): Promise<WPListResponse> {
  const response = await api.get<unknown>(
    "/working-permit/display-working-permit",
    {
      params,
    }
  );

  return wpListResponseSchema.parse(response.data);
}



export type Worker = {
  id: number;
  workerName: string;
  approvedBy: string;
  finalApprovedBy: string;
};

type WorkerApi = {
  id: number;
  worker_name: string;
  approved_by: string;
  final_approved_by: string;
};

type WorkerListResponse = {
  success: boolean;
  data: WorkerApi[];
};

export async function getWorkerListService(): Promise<Worker[]> {
  const response = await api.get<WorkerListResponse>(
    "/working-permit/worker-list"
  );

  return response.data.data.map((worker) => ({
    id: worker.id,
    workerName: worker.worker_name,
    approvedBy: worker.approved_by,
    finalApprovedBy: worker.final_approved_by,
  }));
}