export type NotificationSocketPayload = {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: string;
  workingPermitId: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationUpdatedPayload = {
  id: string;
  isRead: boolean;
  readAt: string | null;
};






export type NotificationItem = {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: string;
  workingPermitId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationResponse = {
  success: boolean;
  data: NotificationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type UnreadCountResponse = {
  success: boolean;
  data: {
    unreadCount: number;
  };
};


