// export interface NotificationClientToServerEvents {
//     "notification:read": (notificationId: number) => void;
// }

import { NotificationSocketPayload, NotificationUpdatedPayload } from "../types";




export interface NotificationServerToClientEvents {
  "notification:new": (
    notification: NotificationSocketPayload
  ) => void;

  "notification:updated": (
    notification: NotificationUpdatedPayload
  ) => void;
}

export interface NotificationClientToServerEvents {}
