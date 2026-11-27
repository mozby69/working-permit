import type {
  Request,
  Response,
  NextFunction,
} from "express";


import { SubscribePushSchema,UnsubscribePushSchema,PushStatusSchema, TestPushSchema} from "@repo/shared";
import {
  pushNotificationService,
} from "./push-notification.service";

export const pushNotificationController = {
  getPublicKey(
    _req: Request,
    res: Response
  ) {
    return res.status(200).json({
      success: true,
      message: "Web Push configuration retrieved",
      data: pushNotificationService.getPublicKey(),
    });
  },

  async subscribe(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const parsed = SubscribePushSchema.safeParse(
        req.body
      );

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid push subscription",
          errors: parsed.error.flatten(),
        });
      }

      if (!pushNotificationService.getPublicKey().enabled) {
        return res.status(503).json({
          success: false,
          message: "Web Push is not configured",
        });
      }

      const data =
        await pushNotificationService.subscribe({
          userId,
          endpoint: parsed.data.endpoint,
          p256dh: parsed.data.keys.p256dh,
          auth: parsed.data.keys.auth,
          userAgent: req.get("user-agent"),
        });

      return res.status(200).json({
        success: true,
        message: "Push notifications enabled",
        data,
      });
    } catch (error: unknown) {
      next(error);
    }
  },

  async unsubscribe(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const parsed =
        UnsubscribePushSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription endpoint",
          errors: parsed.error.flatten(),
        });
      }

      const data =
        await pushNotificationService.unsubscribe(
          userId,
          parsed.data.endpoint
        );

      return res.status(200).json({
        success: true,
        message: "Push notifications disabled",
        data,
      });
    } catch (error: unknown) {
      next(error);
    }
  },

  async getStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const parsed = PushStatusSchema.safeParse(
        req.body
      );

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription endpoint",
          errors: parsed.error.flatten(),
        });
      }

      const data =
        await pushNotificationService.getStatus(
          userId,
          parsed.data.endpoint
        );

      return res.status(200).json({
        success: true,
        message: "Subscription status retrieved",
        data,
      });
    } catch (error: unknown) {
      next(error);
    }
  },

  async sendTest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const parsed = TestPushSchema.safeParse(
        req.body
      );

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription endpoint",
          errors: parsed.error.flatten(),
        });
      }

      const data =
        await pushNotificationService.sendTest(
          userId,
          parsed.data.endpoint
        );

      return res.status(data.sent ? 200 : 400).json({
        success: data.sent,

        message: data.sent
          ? "Test notification submitted"
          : "Unable to send test notification",

        data,
      });
    } catch (error: unknown) {
      next(error);
    }
  },
};