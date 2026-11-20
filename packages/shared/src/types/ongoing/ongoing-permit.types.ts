
export type PermitStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "IN_PROGRESS";

export interface PermitRemark {
  id: number;
  description: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
  };
}

export interface PermitApproval2 {
  id: string;
  sequence: number;
  role: string;
  status: PermitStatus;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectRemarks: string | null;
  approver: {
    id: number;
    name: string;
  };
}

export interface OngoingPermit {
  id: string;
  referenceNumber: string;
  requestLevel: "LEVEL_1" | "LEVEL_2";
  date: string;
  requestFor: string;
  requestedBy: string;
  checkedBy: string | null;
  status: PermitStatus;
  statusAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;

  branchDepartment: {
    id: number;
    entityName: string;
  };

  fromDepartment: {
    id: number;
    entityName: string;
  };

  WorkerList: {
    id: number;
    workerName: string;
  };

  receivedBy: {
    id: number;
    name: string;
  } | null;

  remarksList: PermitRemark[];
  ApprovalTable: PermitApproval2[];
}

export interface MyApprovedPermitFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PermitStatus | "ALL" | "UNFINISHED";
}

// ==========================================
// PAGINATION
// ==========================================

export interface MyApprovedPermitPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==========================================
// SUMMARY
// ==========================================

export interface MyApprovedPermitSummary {
  total: number;
  pending: number;
  approved: number;
  inProgress: number;
  completed: number;
  rejected: number;
  cancelled: number;
  unfinished: number;
}

// ==========================================
// API RESPONSE
// ==========================================

export interface MyApprovedPermitResponse {
  success: boolean;
  message?: string;
  data: OngoingPermit[];
  pagination: MyApprovedPermitPagination;
  summary: MyApprovedPermitSummary;
}
