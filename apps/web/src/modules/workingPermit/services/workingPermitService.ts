import api from "@/lib/api/api-client";
import { AddRequestInput, DepartmentBranch, DepartmentBranchesResponse, NextReferenceResponse, QueryParams, WorkingPermitResponse, wpListResponseSchema } from "@repo/shared";





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






export async function getDepartmentBranchesService(): Promise<DepartmentBranch[]> {
  const response = await api.get<DepartmentBranchesResponse>(
    "/working-permit/department-branch-list"
  );

  return response.data.data.map((department) => ({
    id: department.id,
    entityName: department.entityName,
    isBranch: department.isBranch,
    checkerId: department.checkerId,
    checker: department.checker,
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



type ApproverUser = {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
};

type WorkerApi = {
  id: number;
  worker_name: string;

  firstApproverUserId: number | null;
  finalApproverUserId: number | null;

  firstApproverUser: ApproverUser | null;
  finalApproverUser: ApproverUser | null;
};

type WorkerListResponse = {
  success: boolean;
  data: WorkerApi[];
};

export type Worker = {
  id: number;
  workerName: string;

  firstApproverUserId: number | null;
  finalApproverUserId: number | null;

  firstApprover: ApproverUser | null;
  finalApprover: ApproverUser | null;
};

export async function getWorkerListService(): Promise<Worker[]> {
  const response = await api.get<WorkerListResponse>(
    "/working-permit/worker-list"
  );

  return response.data.data.map((worker) => ({
    id: worker.id,
    workerName: worker.worker_name,

    firstApproverUserId: worker.firstApproverUserId,
    finalApproverUserId: worker.finalApproverUserId,

    firstApprover: worker.firstApproverUser,
    finalApprover: worker.finalApproverUser,
  }));
}