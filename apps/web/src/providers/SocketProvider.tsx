"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  createSocket,
  disconnectSocket,
} from "@/lib/socket/socket-client";

import { useAuth } from
  "@/modules/authentication/hooks/useAuth";

import { useNotificationSocket } from
  "@/modules/notification/hooks/useNotificationSocket";

import { useWPSocket } from
  "@/modules/workingPermit/hooks/useWorkingPermitSocket";

interface SocketProviderProps {
  children: ReactNode;
}

export default function SocketProvider({
  children,
}: SocketProviderProps) {
  const {
    user,
    isAuthenticated,
    isAuthReady,
  } = useAuth();

  const userId = user?.id;

  // Register listeners before connecting.
  useWPSocket();
  useNotificationSocket();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isAuthenticated || !userId) {
      disconnectSocket();
      return;
    }

    const socket = createSocket();

    const handleConnect = () => {
      console.log("[SOCKET] Connected", {
        socketId: socket.id,
        userId,
        transport: socket.io.engine.transport.name,
      });
    };

    const handleDisconnect = (reason: string) => {
      console.warn(
        "[SOCKET] Disconnected:",
        reason
      );
    };

    const handleConnectError = (error: Error) => {
      console.error(
        "[SOCKET] Connection error:",
        error.message
      );
    };

    const handleReconnect = (attempt: number) => {
      console.log(
        "[SOCKET] Reconnected after attempts:",
        attempt
      );
    };

    const handleReconnectAttempt = (
      attempt: number
    ) => {
      console.log(
        "[SOCKET] Reconnection attempt:",
        attempt
      );
    };

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.io.on(
      "reconnect",
      handleReconnect
    );

    socket.io.on(
      "reconnect_attempt",
      handleReconnectAttempt
    );

    if (!socket.connected) {
      console.log(
        "[SOCKET] Connecting user:",
        userId
      );

      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.io.off(
        "reconnect",
        handleReconnect
      );

      socket.io.off(
        "reconnect_attempt",
        handleReconnectAttempt
      );

      socket.disconnect();
    };
  }, [
    isAuthReady,
    isAuthenticated,
    userId,
  ]);

  return <>{children}</>;
}