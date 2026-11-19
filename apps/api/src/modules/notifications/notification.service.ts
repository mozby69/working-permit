import { Prisma } from "../../../generated/prisma/client";
import * as notificationRepo from "./notification.repository";
import type { NotificationQuery, PermitNotificationContext, PermitNotificationStage } from "./notification.types";

// ==========================================
// GET NOTIFICATIONS
// ==========================================

export async function getNotificationsService(
  params: NotificationQuery
) {
  return notificationRepo.getNotificationsRepo(params);
}

// ==========================================
// GET UNREAD COUNT
// ==========================================

export async function getUnreadCountService(
  userId: number
) {
  return notificationRepo.getUnreadCountRepo(userId);
}

// ==========================================
// MARK ONE AS READ
// ==========================================

export async function markNotificationAsReadService(
  notificationId: string,
  userId: number
) {
  return notificationRepo.markNotificationAsReadRepo(
    notificationId,
    userId
  );
}

// ==========================================
// MARK ALL AS READ
// ==========================================

export async function markAllNotificationsAsReadService(
  userId: number
) {
  return notificationRepo.markAllNotificationsAsReadRepo(
    userId
  );
}




export async function notifyAssignedApproverTx(
    tx: Prisma.TransactionClient,
    permit: PermitNotificationContext,
    stage: PermitNotificationStage
  ) {
    
  const assignment = permit.ApprovalTable.find(
    (item) => item.role === stage
  );

  if (!assignment) {
    throw new Error(`Missing ${stage} assignment.`);
  }

  return notificationRepo.createNotificationTx(tx, {
    userId: assignment.approverId,
    title: "New Working Permit",
    message: `New Working Permit ${permit.referenceNumber} from User ID ${permit.createdById}.`,
    type: "WP_APPROVAL_REQUIRED",
    workingPermitId: permit.id,
  });
}

export async function notifyCoordinatorStatusTx(
  tx: Prisma.TransactionClient,
  permit: {
    id: string;
    referenceNumber: string;
    createdById: number;
  },
  status: "IN_PROGRESS" | "COMPLETED"
) {
  const statusLabel =
    status === "IN_PROGRESS"
      ? "In Progress"
      : "Completed";

  return notificationRepo.createNotificationTx(tx, {
    userId: permit.createdById,
    title: `Working Permit ${statusLabel}`,
    message: `Your Working Permit ${permit.referenceNumber} is now ${statusLabel}.`,
    type: `WP_${status}`,
    workingPermitId: permit.id,
  });
}