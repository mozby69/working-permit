import { AddRequestInput, UpdateWorkingPermitInput } from "@repo/shared";
import  * as workingRepo from "./workingpermit.repository";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";
import { QueryParamWP, UploadedAttachment } from "./workingpermit.types";



export async function createRequestService(
  params: AddRequestInput,
  userId: number,
  attachments: UploadedAttachment[]
) {
  return workingRepo.addRequestRepo(
    params,
    userId,
    attachments
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
    const isTroubleshooter = params.roles.includes("TROUBLESHOOTER");

    

    const canEdit =
      permit.createdById === params.userId &&
      permit.sequence === 1 &&
      approval?.status === "PENDING" &&
      approval?.checkedStatus === "PENDING";

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


      const isTroubleshooterDepartment =
      permit.WorkerList.troubleshooters.some(
        (user) => user.id === params.userId
      );

    const isTroubleshooterSequence =
      (permit.requestLevel === "LEVEL_1" &&
        permit.sequence === 3) ||
      (permit.requestLevel === "LEVEL_2" &&
        permit.sequence === 4);

    const requiredApprovalsCompleted =
      approval?.checkedStatus === "APPROVED" &&
      approval?.firstApproverStatus === "APPROVED" &&
      (
        permit.requestLevel === "LEVEL_1" ||
        approval?.finalApproverStatus === "APPROVED"
      );

    const canReceiveTroubleshooter =
      isTroubleshooter &&
      isTroubleshooterDepartment &&
      isTroubleshooterSequence &&
      requiredApprovalsCompleted &&
      approval?.status === "PENDING" &&
      approval?.receivedById === null;

    const canCompleteTroubleshooter =
      isTroubleshooter &&
      isTroubleshooterDepartment &&
      isTroubleshooterSequence &&
      requiredApprovalsCompleted &&
      approval?.status === "IN_PROGRESS" &&
      approval?.receivedById === params.userId;

    return {
      id: permit.id,
      referenceNumber: permit.referenceNumber,
      requestToId: permit.requestToId,
      requestTo: permit.WorkerList.workerName,
      requestLevel: permit.requestLevel,
      date: permit.date.toISOString(),
      requestFor: permit.requestFor,
      requestedBy: permit.requestedBy,
      checkedBy: permit.checkedBy,
       attachments: permit.attachments.map((file) => ({
          id: file.id,
          workingPermitId: file.workingPermitId,
          originalName: file.originalName,
          storedName: file.storedName,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          createdAt: file.createdAt.toISOString(),
        })),


      canEdit,
      canApproveChecker,
      canApproveFirstApprover,
      canApproveFinalApprover,
      canReceiveTroubleshooter,
      canCompleteTroubleshooter,

      fromDepartment: {
        id: permit.fromDepartment.id,
        entityName: permit.fromDepartment.entityName ?? "",
      },

      branchDepartment: {
         id: permit.branchDepartment.id,
        entityName: permit.branchDepartment.entityName ?? "",
      },

      approval: {
        status: approval?.status ?? "PENDING",
        checkedStatus: approval?.checkedStatus ?? "PENDING",
        firstApproverStatus:
          approval?.firstApproverStatus ?? "PENDING",
        finalApproverStatus:
          approval?.finalApproverStatus ?? "PENDING",

        receivedById: approval?.receivedById ?? null,
        receivedAt: approval?.receivedAt?.toISOString() ?? null,
        statusAt: approval?.statusAt?.toISOString() ?? null,
      },

      requestToWorker: {
        id: permit.WorkerList.id,
        workerName: permit.WorkerList.workerName,

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


export async function updateWorkingPermitService(id: string, userId: number, data: UpdateWorkingPermitInput, attachments: UploadedAttachment[]) {
  return workingRepo.updateWorkingPermitRepo(id, userId, data, attachments);
}


