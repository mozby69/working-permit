"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { notificationService } from "../services/notificationService";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (page: number, limit: number) =>
    ["notifications", "list", page, limit] as const,
  unread: ["notifications", "unread-count"] as const,
};

// ==========================================
// GET NOTIFICATIONS
// ==========================================

export function useNotifications(
  page = 1,
  limit = 10
) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit),
    queryFn: () =>
      notificationService.getNotifications(page, limit),
    staleTime: 30_000,
  });
}

// ==========================================
// GET UNREAD COUNT
// ==========================================

export function useUnreadNotifications() {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: notificationService.getUnreadCount,
    staleTime: 30_000,
  });
}

// ==========================================
// MARK ONE AS READ
// ==========================================

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      notificationService.markAsRead(id),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unread,
        }),
      ]);
    },
  });
}

// ==========================================
// MARK ALL AS READ
// ==========================================

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unread,
        }),
      ]);
    },
  });
}