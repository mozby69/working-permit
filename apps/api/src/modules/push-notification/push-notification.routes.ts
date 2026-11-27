import { Router } from "express";

import {
  pushNotificationController,
} from "./push-notification.controller";

const router = Router();

router.get(
  "/public-key",
  pushNotificationController.getPublicKey
);

router.post(
  "/subscribe",
  pushNotificationController.subscribe
);

router.post(
  "/unsubscribe",
  pushNotificationController.unsubscribe
);

router.post(
  "/status",
  pushNotificationController.getStatus
);

router.post(
  "/test",
  pushNotificationController.sendTest
);

export default router;