import { AddRequestInput } from "@repo/shared";
import  * as workingRepo from "./workingpermit.repository";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";



export async function createRequestService(
  params: AddRequestInput,
  userId: number
) {
  return workingRepo.addRequestRepo(
    {
      fromId: params.fromId,
      requestLevel: params.requestLevel,
      date: params.date,
      requestFor: params.requestFor,
      branchDepartmentId: params.branchDepartmentId,
      requestedBy: params.requestedBy,
      checkedBy: params.checkedBy,
      attachment: params.attachment,
      requestToId: params.requestToId,
    },
    userId
  );
}


export async function getNextReferenceService() {
  return workingRepo.getNextReferenceRepo();
}

export async function getDepartmentBranchesService() {
  return workingRepo.getDepartmentBranchesRepo();
}


export async function getWorkingPermitService(params: workingRepo.QueryParamWP) {
  const result = await workingRepo.displayWorkingPermit(params);

  const normalized = result.data.map((permit) => {
    const approval = permit.ApprovalTable[0];

    return {
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

      fromDepartment: {
        entityName: permit.fromDepartment.entityName,
      },

      branchDepartment: {
        entityName: permit.branchDepartment.entityName,
      },

      approval: {
        status: approval?.status ?? "PENDING",
        checkedStatus: approval?.checkedStatus ?? "PENDING",
        firstApproverStatus: approval?.firstApproverStatus ?? "PENDING",
        finalApproverStatus: approval?.finalApproverStatus ?? "PENDING",  
      },

     requestToWorker: {
          id: permit.WorkerList.id,
          workerName: permit.WorkerList.worker_name,

          firstApproverUserId:
            permit.WorkerList.firstApproverUserId,

          finalApproverUserId:
            permit.WorkerList.finalApproverUserId,

          firstApprover: permit.WorkerList.firstApproverUser
            ? {
                id: permit.WorkerList.firstApproverUser.id,
                name: permit.WorkerList.firstApproverUser.name,
              }
            : null,

          finalApprover: permit.WorkerList.finalApproverUser
            ? {
                id: permit.WorkerList.finalApproverUser.id,
                name: permit.WorkerList.finalApproverUser.name,
              }
            : null,
        },
    };
  });

  return {
    data: normalized,
    pagination: result.pagination,
  };
}

export async function getWorkerListService() {
  return workingRepo.getWorkerRepo();
}