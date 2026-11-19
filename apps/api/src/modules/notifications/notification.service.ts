import * as notificationRepo from "./notification.repository";
import type { NotificationQuery } from "./notification.types";

// ==========================================
// GET NOTIFICATIONS
// ==========================================

export async function getNotificationsService(
  params: NotificationQuery
) {
  return notificationRepo.getNotificationsRepo(params);
}

// ==========================================
// GET UNREAD COUNT
// ==========================================

export async function getUnreadCountService(
  userId: number
) {
  return notificationRepo.getUnreadCountRepo(userId);
}

// ==========================================
// MARK ONE AS READ
// ==========================================

export async function markNotificationAsReadService(
  notificationId: string,
  userId: number
) {
  return notificationRepo.markNotificationAsReadRepo(
    notificationId,
    userId
  );
}

// ==========================================
// MARK ALL AS READ
// ==========================================

export async function markAllNotificationsAsReadService(
  userId: number
) {
  return notificationRepo.markAllNotificationsAsReadRepo(
    userId
  );
}