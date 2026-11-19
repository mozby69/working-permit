import { AddRequestInput, AddRequestSchema, AddWorkingPermitRemarkInput, WorkingPermitResponse } from "../schemas";

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
  createdAt?: string ;
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
  requestToId?: number;
  date?: string; 
};

// export interface WPListResponse {
//   success: boolean;
//   data: WorkingPermitResponse[];
//   pagination: {
//     total: number;
//     page: number;
//     limit: number;

//   };
// }



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
  workerName: string;

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

// A normalized database approval row as returned by the Working Permit API.
export type WorkingPermitApprovalRow = WorkingPermitResponse["approvals"][number];

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



export type TroubleshooterStatus =
  | "IN_PROGRESS"
  | "COMPLETED";

export interface TroubleshooterActionResponse {
  success: boolean;
  message: string;
  data: {
    workingPermitId: string;
    sequence: number;
    receivedById: number;
    status: TroubleshooterStatus;
  };
}

export interface TroubleshooterMutationInput {
  workingPermitId: string;
}

export type CreateWorkingPermitPayload = Omit<
  AddRequestSchema,
  "attachment"
> & {
  attachments: File[];
};



export type Attachment = {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
};

export type Props = {
  permitId: string;
  attachment: Attachment;
};

export type UpdateWorkingPermitParams = {
  id: string;
  payload: CreateWorkingPermitPayload;
};


export type AddRemarkParams = {
  workingPermitId: string;
  payload: AddWorkingPermitRemarkInput;
};


//reject button 

export const rejectionEndpoints: Record<
  RejectApprovalStage,
  string
> = {
  CHECKER: "checker-reject",
  FIRST_APPROVER: "first-reject",
  FINAL_APPROVER: "final-reject",
};

export type RejectApprovalStage =
  | "CHECKER"
  | "FIRST_APPROVER"
  | "FINAL_APPROVER";

export interface RejectWorkingPermitInput {
  workingPermitId: string;
  stage: RejectApprovalStage;
  rejectRemarks: string;
}

export interface RejectWorkingPermitResponse {
  success: boolean;
  message: string;
  data: {
    workingPermitId: string;
    sequence: number;
    stage: RejectApprovalStage;
    status: "REJECTED";
    statusAt: string;
  };
}


export interface RequestType {
  id: number;
  description: string;
}

export interface RequestTypesResponse {
  success: boolean;
  message?: string;
  data: RequestType[];
}