"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { AuthenticatedUser, PermissionName } from "@repo/shared";

import { AuthContext } from "../context/AuthContext";
import { Authme, LogoutService } from "../services/auth.service";

const AUTH_USER_QUERY_KEY = ["auth", "me"] as const;

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        data: user = null,
        isPending,
        refetch,
    } = useQuery({
        queryKey: AUTH_USER_QUERY_KEY,
        queryFn: async (): Promise<AuthenticatedUser | null> => {
            try {
                const response = await Authme();
                return response.data;
            } catch {
                return null;
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const isAuthenticated = user !== null;
    const isAuthReady = !isPending;

    const refreshUser = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const login = useCallback(
        (authenticatedUser: AuthenticatedUser) => {
            queryClient.setQueryData(
                AUTH_USER_QUERY_KEY,
                authenticatedUser
            );

            const roles = authenticatedUser.roles.map((role) =>
                role.toUpperCase()
            );

            if (roles.includes("ADMIN")) {
                router.replace("/admin/access-control");
                return;
            }

            if (roles.includes("BRANCH")) {
                router.replace("/branch/dashboard");
                return;
            }

            if (roles.includes("COORDINATOR")) {
                router.replace("/workingPermit");
                return;
            }

            router.replace("/");
        },
        [queryClient, router]
    );

    const logout = useCallback(async () => {
        try {
            await LogoutService();
        } catch (error) {
            console.error(error);
        } finally {
            queryClient.setQueryData(
                AUTH_USER_QUERY_KEY,
                null
            );

            router.replace("/login");
        }
    }, [queryClient, router]);


    const hasRole = useCallback(
        (role: string) => {
            if (!user) {
                return false;
            }

            return user.roles.some(
                (userRole) =>
                    userRole.toUpperCase() === role.toUpperCase()
            );
        },
        [user]
    );

    const hasPermission = useCallback(
        (permission: PermissionName): boolean => {
            return user?.permissions.includes(permission) ?? false;
        },
        [user]
    );

    const value = useMemo(
        () => ({
            user,
            isAuthenticated,
            isAuthReady,
            login,
            logout,
            hasRole,
            refreshUser,
            hasPermission,
        }),
        [
            user,
            isAuthenticated,
            isAuthReady,
            login,
            logout,
            hasRole,
            refreshUser,
            hasPermission,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}