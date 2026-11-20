"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSocket } from "@/lib/socket/socket-client";

export function useWPSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = createSocket();

    const invalidateWorkingPermits = () => {
      void queryClient.invalidateQueries({
        queryKey: ["working-permit-display"],
      });
    };

    const invalidateOngoingPermits = () => {
      void queryClient.invalidateQueries({
        queryKey: ["ongoing-permit"],
      });
    };

    const handleWPCreated = () => {
      invalidateWorkingPermits();
      invalidateOngoingPermits();
    };

    const handleWPUpdated = () => {
      invalidateWorkingPermits();
      invalidateOngoingPermits();
    };

    socket.on("wp:created", handleWPCreated);
    socket.on("wp:updated", handleWPUpdated);

    return () => {
      socket.off("wp:created", handleWPCreated);
      socket.off("wp:updated", handleWPUpdated);
    };
  }, [queryClient]);
}