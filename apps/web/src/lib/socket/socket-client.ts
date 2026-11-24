// import { io, type Socket } from "socket.io-client";

// import type {
//     ClientToServerEvents,
//     ServerToClientEvents,
// } from "@repo/shared";

// const SOCKET_URL =
//     process.env.NEXT_PUBLIC_BACKEND_LAN_URL;

// let socket: Socket<
//     ServerToClientEvents,
//     ClientToServerEvents
// > | null = null;

// export const createSocket = () => {
//     if (!socket) {
//         socket = io(SOCKET_URL!, {
//             //autoConnect: true,
//             autoConnect:false,
//             withCredentials: true,
//         });
//     }

//     return socket;
// };












// import { io, type Socket } from "socket.io-client";

// import type {
//   ClientToServerEvents,
//   ServerToClientEvents,
// } from "@repo/shared";

// const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_LAN_URL;

// type AppSocket = Socket<
//   ServerToClientEvents,
//   ClientToServerEvents
// >;

// let socket: AppSocket | null = null;

// export const createSocket = (): AppSocket => {
//   if (!SOCKET_URL) {
//     throw new Error(
//       "NEXT_PUBLIC_BACKEND_LAN_URL is not configured"
//     );
//   }

//   if (!socket) {
//     socket = io(SOCKET_URL, {
//       autoConnect: false,
//       withCredentials: true,
//       transports: ["websocket"],
//       reconnection: true,
//       reconnectionAttempts: Infinity,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       timeout: 20000,
//     });
//   }

//   return socket;
// };


// export const disconnectSocket = (): void => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };











import { io, type Socket } from "socket.io-client";

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@repo/shared";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_LAN_URL;

export type AppSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

let socket: AppSocket | null = null;

export function createSocket(): AppSocket {
  if (!SOCKET_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_LAN_URL is not configured"
    );
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,

      transports: ["polling", "websocket"],

      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,

      timeout: 20000,
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
  }
}