


"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSocket } from "@/lib/socket/socket-client";

export function useWPSocket() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = createSocket();

        const handleWPCreated = () => {
            queryClient.invalidateQueries({
                queryKey: ["working-permit-display"],
            });
        };

        const handleWPUpdated = () => {
            queryClient.invalidateQueries({
                queryKey: ["working-permit-display"],
            });
        };

        socket.on("wp:created", handleWPCreated);
        socket.on("wp:updated", handleWPUpdated);

        return () => {
            socket.off("wp:created", handleWPCreated);
            socket.off("wp:updated", handleWPUpdated);
        };
    }, [queryClient]);
}