import { getIO } from "@/socket";
import type {
  NotificationSocketPayload,
  NotificationUpdatedPayload,
} from "@repo/shared";


export function emitNotificationCreated(
  notification: NotificationSocketPayload
): void {
  getIO()
    .to(`user:${notification.userId}`)
    .emit("notification:new", notification);
}

export function emitNotificationUpdated(
  userId: number,
  notification: NotificationUpdatedPayload
): void {
  getIO()
    .to(`user:${userId}`)
    .emit("notification:updated", notification);
}