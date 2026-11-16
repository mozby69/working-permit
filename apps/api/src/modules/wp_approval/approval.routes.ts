
import { authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { Router } from "express";
import * as approvalController from "./approval.controller";

const router = Router();
router.use(authenticate);



router.patch(
  "/:id/checker-approve",
  authenticate,
  authorize({ roles: ["CHECKER"] }),
  approvalController.approveCheckerController
);

router.patch(
  "/:id/first-approve",
  authenticate,
  authorize({ roles: ["FIRST_APPROVER"] }),
  approvalController.approveFirstApproverController
);

router.patch(
  "/:id/final-approve",
  authenticate,
  authorize({ roles: ["FINAL_APPROVER"] }),
  approvalController.approveFinalApproverController
);



router.patch(
  "/:id/receive",
  authenticate,
  authorize({
    roles: ["TROUBLESHOOTER"],
  }),
  approvalController.receiveWorkingPermitController
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize({
    roles: ["TROUBLESHOOTER"],
  }),
  approvalController.completeWorkingPermitController
);


export default router; 