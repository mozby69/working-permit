
import { Router } from "express";

import { authenticate } from "@/middleware/authenticate.middleware";

import * as notificationController from "./notification.controller";

const router = Router();

// All notification endpoints require authentication.
router.use(authenticate);

// GET /api/notifications
router.get(
  "/",
  notificationController.getNotificationsController
);

// GET /api/notifications/unread-count
router.get(
  "/unread-count",
  notificationController.getUnreadCountController
);

// PATCH /api/notifications/read-all
router.patch(
  "/read-all",
  notificationController.markAllNotificationsAsReadController
);

// PATCH /api/notifications/:id/read
router.patch(
  "/:id/read",
  notificationController.markNotificationAsReadController
);

export default router;
