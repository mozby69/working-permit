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