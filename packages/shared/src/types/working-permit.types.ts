import { WorkingPermitResponse } from "../schemas";

export type DepartmentBranch = {
  id: number;
  entityName: string;
  isBranch: boolean;
  checkerId: number | null;
  checker: {
    id: number;
    name: string;
    username: string;
    isActive: boolean;
  } | null;
};


export type DepartmentBranchesResponse = {
  success: boolean;
  data: DepartmentBranch[];
};

export type NextReferenceResponse = {
  success: boolean;
  data: {
    referenceNumber: string;
  };
};


export type QueryParams = {
  page: number;
  limit: number;
  search?: string;
};

export interface WPListResponse {
  success: boolean;
  data: WorkingPermitResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;

  };
}



export type CheckerApprovalResponse = {
  success: boolean;
  message: string;
  data: {
    workingPermitId: string;
    sequence: number;
    checkedStatus: "APPROVED";
  };
};


export type ApproverUser = {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
};

export type WorkerApi = {
  id: number;
  worker_name: string;

  firstApproverUserId: number | null;
  finalApproverUserId: number | null;

  firstApproverUser: ApproverUser | null;
  finalApproverUser: ApproverUser | null;
};

export type WorkerListResponse = {
  success: boolean;
  data: WorkerApi[];
};

export type WorkerListItem = {
  id: number;
  workerName: string;

  firstApproverUserId: number | null;
  finalApproverUserId: number | null;

  firstApprover: ApproverUser | null;
  finalApprover: ApproverUser | null;
};

export type WorkingPermitSocketPayload = {
  id: string;
};





export type ApprovalStage =
  | "CHECKER"
  | "FIRST_APPROVER"
  | "FINAL_APPROVER";

export type ApprovalResult = {
  workingPermitId: string;
  sequence: number;
  stage: ApprovalStage;
  status: "APPROVED";
};


export interface ApprovalResponse {
  success: boolean;
  message: string;
  data: {
    workingPermitId: string;
    sequence: number;
    stage: ApprovalStage;
    status: "APPROVED";
  };
}

export const approvalEndpoints: Record<ApprovalStage, string> = {
  CHECKER: "checker-approve",
  FIRST_APPROVER: "first-approve",
  FINAL_APPROVER: "final-approve",
};

export interface ApproveWorkingPermitInput {
  workingPermitId: string;
  stage: ApprovalStage;
}