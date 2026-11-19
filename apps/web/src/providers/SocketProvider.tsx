"use client";

 import { useNotificationSocket } from "@/modules/notification/hooks/useNotificationSocket"; 

export default function SocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useNotificationSocket();

    return (
        <>
            {children}
        </>
    );
}