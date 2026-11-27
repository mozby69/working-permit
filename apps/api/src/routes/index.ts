import { Router } from 'express';
import authRoutes from "../modules/auth/auth.routes";
import accessControlRoutes from "@/modules/admin/access-control/access-control.routes";
import dashboardRoutes from "@/modules/admin/dashboard/dashboard.routes";
import { authenticate } from '@/middleware/authenticate.middleware';
import workingPermitRoute from "@/modules/working_permit/workingpermit.routes";
import branchRoutes from "@/modules/admin/branch/branch.route";
import workingRoute from "@/modules/admin/working/working.route";
import approvalRoute from "@/modules/wp_approval/approval.routes";
import notifcationRoute from "@/modules/notifications/notification.routes";
import pushNotificationRoute from "@/modules/push-notification/push-notification.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use(
    "/admin/access-control",
    authenticate,
    accessControlRoutes
);

router.use(
    "/admin/dashboard",
    authenticate,
    dashboardRoutes
);

router.use("/admin/", branchRoutes);

router.use("/admin/", workingRoute);

router.use("/working-permit",authenticate,workingPermitRoute);
router.use("/approval",authenticate,approvalRoute);
router.use("/notifications",authenticate,notifcationRoute);
router.use("/push-notification",authenticate,pushNotificationRoute);

export default router;