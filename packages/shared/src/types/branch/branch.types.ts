import { PaginationMeta } from "../api-response.types";
import { DepartmentBranch } from "../working-permit.types";


export interface DepartmentBranchFilter {
  isBranch?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface DepartmentBranchPaginationResponse {
  success: boolean;
  message?: string;
  data: DepartmentBranch[];
  pagination: PaginationMeta;
}

export type BranchPermitStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "IN_PROGRESS";

export type BranchApprovalRole =
  | "CHECKER"
  | "FIRST_APPROVER"
  | "FINAL_APPROVER"
  | "TROUBLESHOOTER";

export interface BranchPermitUser {
  id: number;
  name: string;
  username: string;
}
export interface BranchPermitApproval {
  id: string;
  indexNum: number;
  sequence: number;
  role: BranchApprovalRole | (string & {});
  status: BranchPermitStatus;
  approvedAt: string | null;
  approverId: number;
  approver: BranchPermitUser;
  createdAt: string;
  updatedAt: string | null;
}

export interface BranchPermitRemark {
  id: number;
  workingPermitId: string;
  description: string;
  createdById: number;
  createdAt: string;
  createdBy?: {
    name: true;
  }
}

export interface BranchWorkingPermit {
  id: string;
  referenceNumber: string;
  requestLevel: "LEVEL_1" | "LEVEL_2";
  date: string;
  requestFor: string;
  requestedBy: string;
  checkedBy: string | null;

  status: BranchPermitStatus;
  statusAt: string | null;

  receivedById: number | null;
  receivedAt: string | null;

  createdAt: string;
  updatedAt: string;

  fromDepartment: {
    id: number;
    entityName: string;
  };

  branchDepartment: {
    id: number;
    entityName: string;
    isBranch: boolean;
  };

  WorkerList: {
    id: number;
    workerName: string;
    firstApproverUser: {
      id: number;
      name: string;
    } | null;
    finalApproverUser: {
      id: number;
      name: string;
    } | null;
  };

  ApprovalTable: BranchPermitApproval[];

  remarksList: BranchPermitRemark[];

  attachments: {
    id: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
  }[];

  receivedBy: BranchPermitUser | null;
  createdBy: BranchPermitUser;
}


export interface BranchWorkingResponse {
  success: boolean;
  message?: string;
  data: BranchWorkingPermit[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface BranchWorkingFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BranchWorkingServiceParams {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
}

export type GetBranchWorkingParams = {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
};
