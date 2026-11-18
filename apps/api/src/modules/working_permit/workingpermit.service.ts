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
    const stages = permit.ApprovalTable;
    const byRole = (role: string) => stages.find((item) => item.role === role);
    const checker = byRole("CHECKER");
    const first = byRole("FIRST_APPROVER");
    const final = byRole("FINAL_APPROVER");
    const troubleshoot = byRole("TROUBLESHOOTER");

    const ready = (role: string): boolean => {
      const target = byRole(role);
      return Boolean(
        target &&
        target.status === "PENDING" &&
        stages.filter((item) => item.sequence < target.sequence)
          .every((item) => item.status === "APPROVED") &&
        stages.filter((item) => item.sequence < target.sequence).length === target.sequence - 1
      );
    };

    const canApproveChecker =
      params.roles.includes("CHECKER") &&
      permit.fromDepartment.checkerId === params.userId &&
      ready("CHECKER");

    const canApproveFirstApprover =
      params.roles.includes("FIRST_APPROVER") &&
      permit.WorkerList.firstApproverUserId === params.userId &&
      ready("FIRST_APPROVER");

    const canApproveFinalApprover =
      params.roles.includes("FINAL_APPROVER") &&
      permit.WorkerList.finalApproverUserId === params.userId &&
      ready("FINAL_APPROVER");

    const isTroubleshooterDepartment = permit.WorkerList.troubleshooters.some(
      (user) => user.id === params.userId
    );

    const canReceiveTroubleshooter =
      params.roles.includes("TROUBLESHOOTER") &&
      isTroubleshooterDepartment &&
      permit.receivedById === null &&
      ready("TROUBLESHOOTER");

    const canCompleteTroubleshooter =
      params.roles.includes("TROUBLESHOOTER") &&
      isTroubleshooterDepartment &&
      permit.receivedById === params.userId &&
      troubleshoot?.status === "IN_PROGRESS";

    const canEdit =
      permit.createdById === params.userId &&
      checker?.status === "PENDING";

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

      approvals: stages.map((item) => ({
        id: item.id,
        sequence: item.sequence,
        role: item.role,
        status: item.status,
        statusAt: item.statusAt?.toISOString() ?? null,
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

      // Keep the existing UI status contract while exposing the normalized stage rows.
      approval: {
        status: troubleshoot?.status ?? "PENDING",
        checkedStatus: checker?.status ?? "PENDING",
        firstApproverStatus: first?.status ?? "PENDING",
        finalApproverStatus: final?.status ?? "PENDING",
        receivedById: permit.receivedById,
        receivedAt: permit.receivedAt?.toISOString() ?? null,
        statusAt: troubleshoot?.statusAt?.toISOString() ?? null,
      },

      requestToWorker: {
        id: permit.WorkerList.id,
        workerName: permit.WorkerList.workerName,
        firstApproverUserId: permit.WorkerList.firstApproverUserId,
        finalApproverUserId: permit.WorkerList.finalApproverUserId,
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


