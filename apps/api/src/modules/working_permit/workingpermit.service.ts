import { AddRequestInput } from "@repo/shared";
import  * as workingRepo from "./workingpermit.repository";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";
import { QueryParamWP } from "./workingpermit.types";



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


export async function getWorkingPermitService(params: QueryParamWP) {
  const result = await workingRepo.displayWorkingPermit(params);

  const normalized = result.data.map((permit) => {
    const approval = permit.ApprovalTable[0];

    const isChecker = params.roles.includes("CHECKER");
    const isFirstApprover = params.roles.includes("FIRST_APPROVER");
    const isFinalApprover = params.roles.includes("FINAL_APPROVER");

    // SEQUENCE 1: CHECKER
    const canApproveChecker =
      isChecker &&
      permit.sequence === 1 &&
      permit.fromDepartment.checkerId === params.userId &&
      approval?.status === "PENDING" &&
      approval?.checkedStatus === "PENDING";

    // SEQUENCE 2: FIRST APPROVER
    const canApproveFirstApprover =
      isFirstApprover &&
      permit.sequence === 2 &&
      permit.WorkerList.firstApproverUserId === params.userId &&
      approval?.status === "PENDING" &&
      approval?.checkedStatus === "APPROVED" &&
      approval?.firstApproverStatus === "PENDING";

    // SEQUENCE 3: FINAL APPROVER
    const canApproveFinalApprover =
      isFinalApprover &&
      permit.sequence === 3 &&
      permit.WorkerList.finalApproverUserId === params.userId &&
      approval?.status === "PENDING" &&
      approval?.checkedStatus === "APPROVED" &&
      approval?.firstApproverStatus === "APPROVED" &&
      approval?.finalApproverStatus === "PENDING";

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

      canApproveChecker,
      canApproveFirstApprover,
      canApproveFinalApprover,

      fromDepartment: {
        entityName: permit.fromDepartment.entityName ?? "",
      },

      branchDepartment: {
        entityName: permit.branchDepartment.entityName ?? "",
      },

      approval: {
        status: approval?.status ?? "PENDING",
        checkedStatus: approval?.checkedStatus ?? "PENDING",
        firstApproverStatus:
          approval?.firstApproverStatus ?? "PENDING",
        finalApproverStatus:
          approval?.finalApproverStatus ?? "PENDING",
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





// export async function approveWorkingPermitByCheckerService(
//   workingPermitId: string,
//   userId: number
// ) {
//   return workingRepo.approveWorkingPermitByCheckerRepo(
//     workingPermitId,
//     userId
//   );
// }