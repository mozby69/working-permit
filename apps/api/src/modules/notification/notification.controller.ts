
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import * as notificationService from "./notification.service";

// ==========================================
// AUTHENTICATED USER HELPER
// ==========================================

function getUserId(req: Request): number | null {
  const userId = req.user?.id;

  if (
    typeof userId !== "number" ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    return null;
  }

  return userId;
}

// ==========================================
// GET NOTIFICATIONS
// ==========================================

export async function getNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const pageValue = Number(req.query.page);
    const limitValue = Number(req.query.limit);

    const page =
      Number.isSafeInteger(pageValue) && pageValue > 0
        ? pageValue
        : 1;

    const limit =
      Number.isSafeInteger(limitValue) && limitValue > 0
        ? Math.min(limitValue, 50)
        : 10;

    const result =
      await notificationService.getNotificationsService({
        userId,
        page,
        limit,
      });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    next(error);
  }
}

// ==========================================
// GET UNREAD COUNT
// ==========================================

export async function getUnreadCountController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const count =
      await notificationService.getUnreadCountService(userId);

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

// ==========================================
// MARK ONE AS READ
// ==========================================

export async function markNotificationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    const notificationId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (
      typeof notificationId !== "string" ||
      !notificationId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
      return;
    }

    const updated =
      await notificationService.markNotificationAsReadService(
        notificationId,
        userId
      );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error: unknown) {
    next(error);
  }
}

// ==========================================
// MARK ALL AS READ
// ==========================================

export async function markAllNotificationsAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const updatedCount =
      await notificationService.markAllNotificationsAsReadService(
        userId
      );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        updatedCount,
        unreadCount: 0,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
