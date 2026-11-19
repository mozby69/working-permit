import api from "@/lib/api/api-client";
import { AddRequestInput, AddWorkingPermitRemarkInput, approvalEndpoints, ApprovalResponse, ApprovalStage, CheckerApprovalResponse, CreateWorkingPermitPayload, DepartmentBranch, DepartmentBranchesResponse, NextReferenceResponse, QueryParams, RejectApprovalStage, rejectionEndpoints, RejectWorkingPermitResponse, RequestTypesResponse, TroubleshooterActionResponse, WorkerListItem, WorkerListResponse, WorkingPermitRemark, WorkingPermitResponse, WPListResponse, wpListResponseSchema } from "@repo/shared";





export async function addWorkingPermitService(
  payload: CreateWorkingPermitPayload
) {
  const formData = new FormData();

  formData.append("requestToId", String(payload.requestToId));
  formData.append("fromId", String(payload.fromId));
  formData.append(
    "branchDepartmentId",
    String(payload.branchDepartmentId)
  );

  formData.append("requestLevel", payload.requestLevel);
  formData.append("requestFor", payload.requestFor);
  formData.append("requestedBy", payload.requestedBy);

  if (payload.checkedBy) {
    formData.append("checkedBy", payload.checkedBy);
  }
  if (payload.requestTypeId != null) {
    formData.append(
      "requestTypeId",
      String(payload.requestTypeId)
    );
  }
  // Append multiple attachments
  for (const file of payload.attachments) {
    formData.append("attachments", file);
  }

  const response = await api.post(
    "/working-permit/add-working-permit",
    formData
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
    workerName: worker.workerName,
    firstApproverUserId: worker.firstApproverUserId,
    finalApproverUserId: worker.finalApproverUserId,
    firstApprover: worker.firstApproverUser,
    finalApprover: worker.finalApproverUser,
  }));
}




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




export const troubleshooterService = {

  async receiveWorkingPermit(
    workingPermitId: string
  ): Promise<TroubleshooterActionResponse> {
    const response =
      await api.patch<TroubleshooterActionResponse>(
        `/approval/${encodeURIComponent(workingPermitId)}/receive`
      );

    return response.data;
  },


  async completeWorkingPermit(
    workingPermitId: string
  ): Promise<TroubleshooterActionResponse> {
    const response =
      await api.patch<TroubleshooterActionResponse>(
        `/approval/${encodeURIComponent(workingPermitId)}/complete`
      );

    return response.data;
  },
};






export async function getWorkingPermitAttachment(
  permitId: string,
  attachmentId: string
): Promise<Blob> {
  const response = await api.get<Blob>(
    `/working-permit/${encodeURIComponent(permitId)}/attachments/${encodeURIComponent(attachmentId)}`,
    {
      responseType: "blob",
    }
  );

  return response.data;
}


export async function updateWorkingPermitService(
  id: string,
  payload: CreateWorkingPermitPayload
): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append("requestToId", String(payload.requestToId));
  formData.append("fromId", String(payload.fromId));
  formData.append("branchDepartmentId", String(payload.branchDepartmentId));
  formData.append("requestLevel", payload.requestLevel);
  formData.append("requestFor", payload.requestFor);
  formData.append("requestedBy", payload.requestedBy);
  formData.append("checkedBy", payload.checkedBy ?? "");
  for (const file of payload.attachments) formData.append("attachments", file);
  const response = await api.patch<{ success: boolean; data: { id: string } }>(
    `/working-permit/${encodeURIComponent(id)}`,
    formData
  );
  return response.data.data;
}




export async function addWorkingPermitRemarkService(
  workingPermitId: string,
  payload: AddWorkingPermitRemarkInput
): Promise<WorkingPermitRemark> {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: WorkingPermitRemark;
  }>(
    `/working-permit/${encodeURIComponent(workingPermitId)}/remarks`,
    payload
  );

  return response.data.data;
}











export async function rejectWorkingPermitService(
  workingPermitId: string,
  stage: RejectApprovalStage,
  rejectRemarks: string
): Promise<RejectWorkingPermitResponse> {
  const response = await api.patch<RejectWorkingPermitResponse>(
    `/approval/${encodeURIComponent(workingPermitId)}/${rejectionEndpoints[stage]}`,
    {
      rejectRemarks,
    }
  );

  return response.data;
}


export async function getRequestTypes() {
  const response = await api.get<RequestTypesResponse>("/working-permit/get-request-type");
  return response.data.data;
}

