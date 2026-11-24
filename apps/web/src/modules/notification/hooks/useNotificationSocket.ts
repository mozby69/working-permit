"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type {
  NotificationSocketPayload,
} from "@repo/shared";

import { createSocket } from "@/lib/socket/socket-client";
import { useAuth } from "@/modules/authentication/hooks/useAuth";

import { notificationKeys } from "./useNotification";
import { useNotificationSound } from "./useNotificationSound";

const REQUEST_NOTIFICATION_TYPES = new Set<string>([
  "WP_APPROVAL_REQUIRED",
  "WP_TROUBLESHOOTER_ASSIGNED",
]);

export function useNotificationSocket(): void {
  const queryClient = useQueryClient();

  const {
    user,
    isAuthenticated,
    isAuthReady,
  } = useAuth();

  const { play } = useNotificationSound();

  const userId = user?.id;

  useEffect(() => {
    if (
      !isAuthReady ||
      !isAuthenticated ||
      !userId
    ) {
      return;
    }

    const socket = createSocket();

    const refreshNotifications = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
        refetchType: "all",
      });
    };

    const handleNewNotification = (
      notification: NotificationSocketPayload
    ) => {
      console.log(
        "[NOTIFICATION SOCKET] notification:new",
        notification
      );

      if (notification.userId !== userId) {
        console.warn(
          "[NOTIFICATION SOCKET] User ID mismatch"
        );

        return;
      }

      refreshNotifications();

      if (
        REQUEST_NOTIFICATION_TYPES.has(
          notification.type
        )
      ) {
        console.log(
          "[NOTIFICATION SOCKET] Playing request sound"
        );

        play();
      }
    };

    const handleUpdatedNotification = () => {
      console.log(
        "[NOTIFICATION SOCKET] notification:updated"
      );

      refreshNotifications();
    };

    const handleConnect = () => {
      console.log(
        "[NOTIFICATION SOCKET] Refreshing notifications"
      );

      refreshNotifications();
    };

    socket.on(
      "notification:new",
      handleNewNotification
    );

    socket.on(
      "notification:updated",
      handleUpdatedNotification
    );

    socket.on("connect", handleConnect);

    if (socket.connected) {
      refreshNotifications();
    }

    return () => {
      socket.off(
        "notification:new",
        handleNewNotification
      );

      socket.off(
        "notification:updated",
        handleUpdatedNotification
      );

      socket.off("connect", handleConnect);
    };
  }, [
    queryClient,
    isAuthReady,
    isAuthenticated,
    userId,
    play,
  ]);
}