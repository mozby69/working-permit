export type NotificationQuery = {
  page: number;
  limit: number;
  userId: number;
};


export type CreateNotificationInput = {
  userId: number;
  title: string;
  message: string;
  type: string;
  workingPermitId?: string;
};


export type PermitNotificationStage =
  | "CHECKER"
  | "FIRST_APPROVER"
  | "FINAL_APPROVER";

export interface PermitNotificationContext {
  id: string;
  referenceNumber: string;
  createdById: number;
  requestLevel: "LEVEL_1" | "LEVEL_2";
  ApprovalTable: {
    role: string;
    approverId: number;
  }[];
}


export type CreatedNotification = {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: string;
  workingPermitId: string | null;
  isRead: boolean;
  createdAt: Date;
};