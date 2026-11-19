
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



router.patch(
  "/:id/checker-reject",
  authorize({
    roles: ["CHECKER"],
  }),
  approvalController.rejectCheckerController
);

router.patch(
  "/:id/first-reject",
  authorize({
    roles: ["FIRST_APPROVER"],
  }),
  approvalController.rejectFirstApproverController
);

router.patch(
  "/:id/final-reject",
  authorize({
    roles: ["FINAL_APPROVER"],
  }),
  approvalController.rejectFinalApproverController
);


export default router; 