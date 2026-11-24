"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/modules/authentication/hooks/useAuth";
import { ROUTES } from "@/constants/route.constants";
import type { RoleName } from "@repo/shared";

interface RoleGuardProps {
    roles: RoleName[];
    children: React.ReactNode;
}

export default function RoleGuard({
    roles,
    children,
}: RoleGuardProps) {
    const router = useRouter();

    const {
        isAuthReady,
        isAuthenticated,
        hasRole,
    } = useAuth();

    const isAllowed = roles.some((role) =>
        hasRole(role)
    );

    useEffect(() => {
        if (!isAuthReady) return;

        if (!isAuthenticated) {
            router.replace(ROUTES.LOGIN);
            return;
        }

        if (!isAllowed) {
            router.replace(ROUTES.UNAUTHORIZED);
        }
    }, [
        isAuthReady,
        isAuthenticated,
        isAllowed,
        router,
    ]);

    // Wait until authentication has been resolved
    if (!isAuthReady) {
        return null;
    }

    // Prevent protected content from briefly rendering
    if (!isAuthenticated || !isAllowed) {
        return null;
    }

    return <>{children}</>;
}