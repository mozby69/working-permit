import { authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { Router } from "express";
import * as workingController from './workingpermit.controller';
import { uploadWorkingPermitAttachment } from "@/middleware/uploadAttachement";



const router = Router();



router.use(authenticate);

router.post(
  "/add-working-permit",
  authorize({ roles: ["COORDINATOR", "CHECKER"] }),
  uploadWorkingPermitAttachment.array("attachments", 5),
  workingController.createRequestController
);
router.get("/next-reference",authenticate,workingController.getNextReferenceController);
router.get("/department-branch-list",authenticate,workingController.getDepartmentBranchesController);
router.get("/display-working-permit",authorize({roles:["COORDINATOR","ADMIN","CHECKER","FIRST_APPROVER","FINAL_APPROVER","TROUBLESHOOTER"]}),authenticate,workingController.getWorkingPermitController);
router.get("/worker-list",authenticate,authorize({ roles: ["COORDINATOR", "ADMIN","CHECKER"] }),workingController.getWorkerListController);
//router.patch("/:id/checker-approve",authenticate,authorize({ roles: ["CHECKER"]}),workingController.approveWorkingPermitByCheckerController);


export default router; 