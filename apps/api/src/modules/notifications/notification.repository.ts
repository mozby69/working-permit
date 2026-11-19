import { prisma } from "@/lib/database/prisma";
import type { CreateNotificationInput, NotificationQuery } from "./notification.types";
import { Prisma } from "../../../generated/prisma/client";

// ==========================================
// GET USER NOTIFICATIONS
// ==========================================

export async function getNotificationsRepo(
  params: NotificationQuery
) {
  const { userId, page, limit } = params;

  const skip = (page - 1) * limit;

  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where: {
        userId,
      },

      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        workingPermitId: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.notification.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    data: notifications,

    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ==========================================
// GET UNREAD COUNT
// ==========================================

export async function getUnreadCountRepo(
  userId: number
) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

export async function markNotificationAsReadRepo(
  notificationId: string,
  userId: number
) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },

    select: {
      id: true,
    },
  });

  if (!notification) {
    return false;
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return true;
}

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export async function markAllNotificationsAsReadRepo(
  userId: number
) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result.count;
}




export async function createNotificationTx(
  tx: Prisma.TransactionClient,
  data: CreateNotificationInput
) {
  return tx.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      workingPermitId: data.workingPermitId ?? null,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      message: true,
      type: true,
      workingPermitId: true,
      isRead: true,
      createdAt: true,
    },
  });
}