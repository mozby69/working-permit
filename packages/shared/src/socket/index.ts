import type { UserServerToClientEvents } from "./user.events";
import type { NotificationClientToServerEvents, NotificationServerToClientEvents } from "./notification.events";
import type { RoleServerToClientEvents } from "./admin/role.events";
import { WPServerToClientEvents } from "./wp.events";

export interface ServerToClientEvents
    extends UserServerToClientEvents, RoleServerToClientEvents, WPServerToClientEvents,NotificationServerToClientEvents { }

export interface ClientToServerEvents
    extends NotificationClientToServerEvents { }


