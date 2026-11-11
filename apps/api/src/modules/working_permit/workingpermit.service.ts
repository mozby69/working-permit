import { AddRequestInput } from "@repo/shared";
import  * as workingRepo from "./workingpermit.repository";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";




export async function createRequestService(params: AddRequestInput,id: number) {
  return workingRepo.addRequestRepo({
    //id,
    //referenceNumber: params.referenceNumber,

    fromId: params.fromId,
    requestLevel: params.requestLevel,
    date: params.date,
    requestFor: params.requestFor,
    branchDepartmentId: params.branchDepartmentId,
    requestedBy: params.requestedBy,
    checkedBy: params.checkedBy,
    attachment: params.attachment,
    requestToId: params.requestToId,
    status: "PENDING",
  });
}



export async function getNextReferenceService() {
  return workingRepo.getNextReferenceRepo();
}

export async function getDepartmentBranchesService() {
  return workingRepo.getDepartmentBranchesRepo();
}


export async function getWorkingPermitService(params: QueryParams) {
  const result = await workingRepo.displayWorkingPermit(params);

  const normalized = result.data.map((permit) => ({
    id: permit.id,
    referenceNumber: permit.referenceNumber,
    requestToId: permit.requestToId,
    requestTo: permit.WorkerList.worker_name,
    requestLevel: permit.requestLevel,
    date: permit.date.toISOString(),
    requestFor: permit.requestFor,
    requestedBy: permit.requestedBy,
    checkedBy: permit.checkedBy,
    attachment: permit.attachment,
    status: permit.status,
    CheckedStatus: permit.CheckedStatus,
    approvedFinalApprover: permit.approvedFinalApprover,
    approvedFirstApprover: permit.approvedFirstApprover,

    fromDepartment: {
      entityName: permit.fromDepartment.entity_name,
    },

    branchDepartment: {
      entityName: permit.branchDepartment.entity_name,
    },

    requestToWorker: {
      id: permit.WorkerList.id,
      workerName: permit.WorkerList.worker_name,
      approvedBy: permit.WorkerList.approved_by,
      finalApprovedBy: permit.WorkerList.final_approved_by,
    },
  }));

  return {
    data: normalized,
    pagination: result.pagination,
  };
}

export async function getWorkerListService() {
  return workingRepo.getWorkerRepo();
}