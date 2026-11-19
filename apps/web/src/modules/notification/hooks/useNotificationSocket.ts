
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createSocket } from "@/lib/socket/socket-client";
import { useAuth } from "@/modules/authentication/hooks/useAuth";
import { notificationKeys } from "./useNotification";

export function useNotificationSocket(): void {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isAuthReady } = useAuth();

  const userId = user?.id;

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !userId) {
      return;
    }

    const socket = createSocket();

    const refreshNotifications = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
        refetchType: "all",
      });
    };

    const handleNewNotification = () => {
      console.log("[SOCKET EVENT] notification:new");
      refreshNotifications();
    };

    const handleUpdatedNotification = () => {
      console.log("[SOCKET EVENT] notification:updated");
      refreshNotifications();
    };

    const handleConnect = () => {
      console.log("[SOCKET CONNECTED]", {
        socketId: socket.id,
        userId,
      });

      refreshNotifications();
    };

    const handleConnectError = (error: Error) => {
      console.error(
        "[SOCKET CONNECTION ERROR]",
        error.message
      );
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:updated", handleUpdatedNotification);

    if (socket.connected) {
      refreshNotifications();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);

      socket.off("notification:new", handleNewNotification);
      socket.off("notification:updated", handleUpdatedNotification);
    };
  }, [
    isAuthReady,
    isAuthenticated,
    userId,
    queryClient,
  ]);
}
