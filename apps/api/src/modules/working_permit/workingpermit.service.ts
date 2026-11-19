import { AddRequestInput, UpdateWorkingPermitInput } from "@repo/shared";
import  * as workingRepo from "./workingpermit.repository";
import { QueryParams } from "../../../../../packages/shared/src/types/query.types";
import { QueryParamWP, UploadedAttachment } from "./workingpermit.types";
import { WorkingPermitStatus } from "../../../generated/prisma/enums";



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
    const approvals = permit.ApprovalTable;
    const byRole = (role: string) => approvals.find(item => item.role === role);
    const checker = byRole("CHECKER");
    const first = byRole("FIRST_APPROVER");
    const final = byRole("FINAL_APPROVER");
    const troubleshoot = byRole("TROUBLESHOOTER");


   const readyForApproval = (role: string): boolean => {
      const current = byRole(role);

      if (
        !current ||
        current.status !== "PENDING" ||
        current.approvedAt !== null ||
        permit.status !== "PENDING"
      ) {
        return false;
      }

      const previous = approvals.filter(
        (item) => item.sequence < current.sequence
      );

      return (
        previous.length === current.sequence - 1 &&
        previous.every(
          (item) =>
            item.status === "APPROVED" &&
            item.approvedAt !== null
        )
      );
    };

    const isAssignedTroubleshooter = permit.WorkerList.troubleshooters.some(
      user => user.id === params.userId,
    );


    const canEdit =
      permit.createdById === params.userId &&
      permit.status === "PENDING" &&
      approvals.every(
        (item) => item.status === "PENDING" &&
                  item.approvedAt === null
      );

    const canApproveChecker = params.roles.includes("CHECKER") &&
      checker?.approverId === params.userId && readyForApproval("CHECKER");

    const canApproveFirstApprover = params.roles.includes("FIRST_APPROVER") &&
      first?.approverId === params.userId && readyForApproval("FIRST_APPROVER");

    const canApproveFinalApprover = params.roles.includes("FINAL_APPROVER") &&
      final?.approverId === params.userId && readyForApproval("FINAL_APPROVER");


    const canReceiveTroubleshooter =
      params.roles.includes("TROUBLESHOOTER") &&
      isAssignedTroubleshooter &&
      final?.status === "APPROVED" &&
      final.approvedAt !== null &&
      permit.status === "PENDING" &&
      permit.receivedById === null;

    const canCompleteTroubleshooter =
      params.roles.includes("TROUBLESHOOTER") &&
      isAssignedTroubleshooter &&
      permit.status === "IN_PROGRESS" &&
      permit.receivedById === params.userId;

      const canAddRemarks =
        params.roles.includes("TROUBLESHOOTER") &&
        isAssignedTroubleshooter &&
        final?.status === "APPROVED" &&
        final.approvedAt !== null &&
        (
          permit.status === "PENDING" ||
          permit.status === "IN_PROGRESS"
        );
        
      // const canAddRemarks =
      //   params.roles.includes("TROUBLESHOOTER") &&
      //   isAssignedTroubleshooter &&
      //   final?.status === "APPROVED" &&
      //   final.approvedAt !== null &&
      //   (
      //     (
      //       permit.status === "PENDING" &&
      //       permit.receivedById === null
      //     ) ||
      //     (
      //       permit.status === "IN_PROGRESS" &&
      //       permit.receivedById === params.userId
      //     )
      //   );

    const stageStatus = (role: string) =>
      byRole(role)?.status ?? WorkingPermitStatus.PENDING;

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
      status: permit.status,
      statusAt: permit.statusAt?.toISOString() ?? null,
      receivedById: permit.receivedById,
      receivedAt: permit.receivedAt?.toISOString() ?? null,
      approvals: approvals.map(item => ({
        id: item.id,
        sequence: item.sequence,
        role: item.role,
        approverId: item.approverId,
        approverName: item.approver.name,
          status: item.status,
        approvedAt: item.approvedAt?.toISOString() ?? null,
      })),
      attachments: permit.attachments.map(file => ({
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
        entityName: permit.fromDepartment.entityName,
      },
      branchDepartment: {
        id: permit.branchDepartment.id,
        entityName: permit.branchDepartment.entityName,
      },
      // Compatibility summary for existing table and modal consumers.
      approval: {
        status: permit.status,
        checkedStatus: stageStatus("CHECKER"),
        firstApproverStatus: stageStatus("FIRST_APPROVER"),
        finalApproverStatus: stageStatus("FINAL_APPROVER"),
        receivedById: permit.receivedById,
        receivedAt: permit.receivedAt?.toISOString() ?? null,
        statusAt: permit.statusAt?.toISOString() ?? null,
        
      },
      requestToWorker: {
        id: permit.WorkerList.id,
        workerName: permit.WorkerList.workerName,
        firstApproverUserId: permit.WorkerList.firstApproverUserId,
        finalApproverUserId: permit.WorkerList.finalApproverUserId,
        firstApprover: permit.WorkerList.firstApproverUser
          ? { id: permit.WorkerList.firstApproverUser.id, name: permit.WorkerList.firstApproverUser.name }
          : null,
        finalApprover: permit.WorkerList.finalApproverUser
          ? { id: permit.WorkerList.finalApproverUser.id, name: permit.WorkerList.finalApproverUser.name }
          : null,
      },
       requestTypeId: permit.RequestType?.id ?? null,
      requestType: permit.RequestType
      ? {
          id: permit.RequestType.id,
          description: permit.RequestType.description,
        }
      : null,

      canAddRemarks,
      remarksList: permit.remarksList.map((remark) => ({
        id: remark.id,
        description: remark.description,
        createdAt: remark.createdAt.toISOString(),
        createdBy: {
          id: remark.createdBy.id,
          name: remark.createdBy.name,
        },

      })),

    };
  });

  return { data: normalized, pagination: result.pagination };
}


export async function getWorkerListService() {
  return workingRepo.getWorkerRepo();
}


export async function updateWorkingPermitService(id: string, userId: number, data: UpdateWorkingPermitInput, attachments: UploadedAttachment[]) {
  return workingRepo.updateWorkingPermitRepo(id, userId, data, attachments);
}



export async function addWorkingPermitRemarkService(
  workingPermitId: string,
  userId: number,
  description: string
) {
  return workingRepo.addWorkingPermitRemarkRepo(
    workingPermitId,
    userId,
    description
  );
}


export async function getAllRequestTypesService() {
  return workingRepo.getAllRequestTypesRepo();
}