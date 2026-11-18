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

export interface BranchPermitApproval {
  status: BranchPermitStatus;
  checkedStatus: BranchPermitStatus;
  firstApproverStatus: BranchPermitStatus;
  finalApproverStatus: BranchPermitStatus;

  receivedAt: string | null;
  checkedStatusAt: string | null;
  firstApproverApprovedAt: string | null;
  finalApproverApprovedAt: string | null;
}

export interface BranchWorkingPermit {
  id: string;
  referenceNumber: string;
  requestLevel: "LEVEL_1" | "LEVEL_2";
  date: string;
  requestFor: string;
  requestedBy: string;
  checkedBy: string | null;
  remarks: string | null;
  createdAt: string;

  fromDepartment: {
    id: number;
    entityName: string;
  };

  branchDepartment: {
    id: number;
    entityName: string;
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

  attachments: {
    id: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
  }[];
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
