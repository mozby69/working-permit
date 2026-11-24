"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createSocket } from "@/lib/socket/socket-client";
import { useAuth } from "@/modules/authentication/hooks/useAuth";

export function useWPSocket(): void {
  const queryClient = useQueryClient();

  const {
    user,
    isAuthenticated,
    isAuthReady,
  } = useAuth();

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

    const refreshWorkingPermits = () => {
      void queryClient.invalidateQueries({
        queryKey: ["working-permit-display"],
        refetchType: "active",
      });

      void queryClient.invalidateQueries({
        queryKey: ["ongoing-permit"],
        refetchType: "active",
      });
    };

    const handleWPCreated = () => {
      console.log("[WP SOCKET] wp:created");

      refreshWorkingPermits();
    };

    const handleWPUpdated = () => {
      console.log("[WP SOCKET] wp:updated");

      refreshWorkingPermits();
    };

    const handleConnect = () => {
      console.log(
        "[WP SOCKET] Connected - refreshing tables"
      );

      refreshWorkingPermits();
    };

    socket.on("wp:created", handleWPCreated);

    socket.on("wp:updated", handleWPUpdated);

    socket.on("connect", handleConnect);

    // Handle cases where the socket is already connected.
    if (socket.connected) {
      refreshWorkingPermits();
    }

    return () => {
      socket.off("wp:created", handleWPCreated);

      socket.off("wp:updated", handleWPUpdated);

      socket.off("connect", handleConnect);
    };
  }, [
    queryClient,
    isAuthReady,
    isAuthenticated,
    userId,
  ]);
}