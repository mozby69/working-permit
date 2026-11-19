import { getIO } from "@/socket";
import type {
  NotificationSocketPayload,
  NotificationUpdatedPayload,
} from "@repo/shared";



export function emitNotificationCreated(notification: NotificationSocketPayload) {
  getIO()
    .to(`user:${notification.userId}`)
    .emit("notification:new", notification);
}


// export function emitNotificationCreated(
//   notification: NotificationSocketPayload
// ): void {
//   const io = getIO();
//   const room = `user:${notification.userId}`;

//   console.log("[NOTIFICATION EMIT]", {
//     room,
//     notificationId: notification.id,
//     connectedClients: io.sockets.adapter.rooms.get(room)?.size ?? 0,
//   });

//   io.to(room).emit("notification:new", notification);
// }


// export function emitNotificationUpdated(
//   userId: number,
//   notification: NotificationUpdatedPayload
// ) {
//   getIO()
//     .to(`user:${userId}`)
//     .emit("notification:updated", notification);
// }

