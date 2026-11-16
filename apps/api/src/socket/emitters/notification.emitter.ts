
import { getIO } from "@/socket";
import type {
  NotificationSocketPayload,
  NotificationUpdatedPayload,
} from "@repo/shared";

// ==========================================
// EMIT NEW NOTIFICATION TO ONE USER
// ==========================================

export function emitNotificationCreated(
  notification: NotificationSocketPayload
) {
  getIO()
    .to(`user:${notification.userId}`)
    .emit("notification:new", notification);
}

// ==========================================
// EMIT READ STATUS TO ONE USER
// ==========================================

export function emitNotificationUpdated(
  userId: number,
  notification: NotificationUpdatedPayload
) {
  getIO()
    .to(`user:${userId}`)
    .emit("notification:updated", notification);
}
