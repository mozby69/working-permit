import { Prisma } from "../../../generated/prisma/client";
import { pushNotificationService } from "../push-notification/push-notification.service";
import * as notificationRepo from "./notification.repository";
import type { CreatedNotification, NotificationQuery, PermitNotificationContext, PermitNotificationStage } from "./notification.types";

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

  // Fetch the name of the user who created the permit.
  const creator = await tx.user.findUnique({
    where: {
      id: permit.createdById,
    },
    select: {
      name: true,
    },
  });

  const creatorName =
    creator?.name?.trim() || "Unknown User";

  return notificationRepo.createNotificationTx(tx, {
    userId: assignment.approverId,
    title: "New Working Permit",
    message:
      `New Working Permit ${permit.referenceNumber} ` +
      `from ${creatorName}.`,
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





// ==========================================
// SEND WEB PUSH NOTIFICATION
// CALL ONLY AFTER TRANSACTION COMMIT
// ==========================================

export async function sendNotificationPush(
  notification: CreatedNotification
): Promise<void> {
  try {
    const config =
      pushNotificationService.getPublicKey();

    if (!config.enabled) {
      return;
    }

    const result =
      await pushNotificationService.sendToUser(
        notification.userId,
        {
          title: notification.title,

          body: notification.message,

          icon: "/jgc-logo-indigo.svg",

          tag: `notification-${notification.id}`,

          data: {
            notificationId: notification.id,

            permitId:
              notification.workingPermitId ??
              undefined,

            type: notification.type,

            url: "/workingPermit",
          },
        }
      );

    if (result.total > 0) {
      console.info("[WEB PUSH] Notification processed", {
        notificationId: notification.id,
        userId: notification.userId,
        total: result.total,
        sent: result.sent,
        failed: result.failed,
        expired: result.expired,
      });
    }
  } catch (error: unknown) {
    console.error("[WEB PUSH] Notification failed", {
      notificationId: notification.id,
      userId: notification.userId,

      error:
        error instanceof Error
          ? error.name
          : "Unknown error",
    });
  }
}