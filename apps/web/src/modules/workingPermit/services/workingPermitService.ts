import api from "@/lib/api/api-client";
import { AddRequestInput, approvalEndpoints, ApprovalResponse, ApprovalStage, CheckerApprovalResponse, DepartmentBranch, DepartmentBranchesResponse, NextReferenceResponse, QueryParams, WorkerListItem, WorkerListResponse, WorkingPermitResponse, WPListResponse, wpListResponseSchema } from "@repo/shared";





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







export async function getWorkingPermitService(params: QueryParams): Promise<WPListResponse> {
  const response = await api.get<unknown>(
    "/working-permit/display-working-permit",
    {
      params,
    }
  );

  return wpListResponseSchema.parse(response.data);
}





export async function getWorkerListService(): Promise<WorkerListItem[]> {
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


// export async function approveCheckerService(workingPermitId: string): Promise<CheckerApprovalResponse> {
//   const response = await api.patch<CheckerApprovalResponse>(
//     `/working-permit/${workingPermitId}/checker-approve`
//   );

//   return response.data;
// }

export async function approveWorkingPermitService(
  workingPermitId: string,
  stage: ApprovalStage
): Promise<ApprovalResponse> {
  const endpoint = approvalEndpoints[stage];

  const response = await api.patch<ApprovalResponse>(
    `/approval/${encodeURIComponent(workingPermitId)}/${endpoint}`
  );

  return response.data;
}