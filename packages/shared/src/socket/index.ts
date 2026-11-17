import type { UserServerToClientEvents } from "./user.events";
import type { NotificationClientToServerEvents } from "./notification.events";
import type { RoleServerToClientEvents } from "./admin/role.events";
import { WPServerToClientEvents } from "./wp.events";

export interface ServerToClientEvents
    extends UserServerToClientEvents, RoleServerToClientEvents, WPServerToClientEvents { }

export interface ClientToServerEvents
    extends NotificationClientToServerEvents { }


