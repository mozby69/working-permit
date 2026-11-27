export type PushNotificationPayload = {
  title: string;
  body: string;

  icon?: string;
  badge?: string;
  tag?: string;

  data?: {
    url?: string;
    permitId?: string;
    notificationId?: string;
    type?: string;
  };
};

export type RegisterPushSubscriptionInput = {
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

export type PushDeliveryResult = {
  total: number;
  sent: number;
  failed: number;
  expired: number;
};

export type SinglePushDeliveryResult =
  | "sent"
  | "failed"
  | "expired";