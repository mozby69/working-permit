
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSocket } from "@/lib/socket/socket-client";
import { useAuth } from "@/modules/authentication/hooks/useAuth";
import { notificationKeys } from "./useNotification";



export function useNotificationSocket(): void {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !user) {
      return;
    }

    const socket = createSocket();

    const refreshNotifications = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    };

    socket.on("notification:new", refreshNotifications);
    socket.on("notification:updated", refreshNotifications);
    socket.on("connect", refreshNotifications);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("notification:new", refreshNotifications);
      socket.off("notification:updated", refreshNotifications);
      socket.off("connect", refreshNotifications);
    };
  }, [isAuthReady, isAuthenticated, user?.id, queryClient]);
}
