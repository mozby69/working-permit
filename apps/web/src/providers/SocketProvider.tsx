"use client";

 import { useNotificationSocket } from "@/modules/notification/hooks/useNotificationSocket"; 
import { useWPSocket } from "@/modules/workingPermit/hooks/useWorkingPermitSocket";

export default function SocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useNotificationSocket();
    useWPSocket()
    return (
        <>
            {children}
        </>
    );
}