import api from "@/lib/api/api-client";
import { NotificationResponse, UnreadCountResponse } from "@repo/shared";

export const notificationService = {

  // GET NOTIFICATIONS
  async getNotifications(
    page = 1,
    limit = 10
  ): Promise<NotificationResponse> {
    const response = await api.get<NotificationResponse>(
      "/notifications",
      {
        params: { page, limit },
      }
    );

    return response.data;
  },

  // GET UNREAD COUNT
  async getUnreadCount(): Promise<number> {
    const response = await api.get<UnreadCountResponse>(
      "/notifications/unread-count"
    );

    return response.data.data.unreadCount;
  },

  // MARK ONE AS READ
  async markAsRead(id: string): Promise<void> {
    await api.patch(
      `/notifications/${encodeURIComponent(id)}/read`
    );
  },

  // MARK ALL AS READ
  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};