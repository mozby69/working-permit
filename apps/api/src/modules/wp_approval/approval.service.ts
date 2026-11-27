
import type { ApprovalResult } from "@repo/shared";

import {
  approveWorkingPermitRepo,
  receiveWorkingPermitRepo,
  completeWorkingPermitRepo,
  rejectWorkingPermitRepo,
} from "./approval.repository.js";
import { emitNotificationCreated } from "@/socket/emitters/notification.emitter.js";
import { CreatedNotification } from "../notifications/notification.types.js";
import { sendNotificationPush } from "../notifications/notification.service.js";



function dispatchNotifications(
  notifications: CreatedNotification[]
): void {
  for (const notification of notifications) {
 
    try {
      emitNotificationCreated({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
      });
    } catch (error: unknown) {
      console.error(
        "[NOTIFICATION] Socket emit failed",
        {
          notificationId: notification.id,
          error,
        }
      );
    }

    // New Web Push notification
    // Do not block the approval response.
    void sendNotificationPush(notification);
  }
}


export async function approveCheckerService(
  workingPermitId: string,
  userId: number
): Promise<ApprovalResult> {
  const { result, notifications } =
    await approveWorkingPermitRepo(
      workingPermitId,
      userId,
      "CHECKER"
    );


  dispatchNotifications(notifications);
  // for (const notification of notifications) {
  //   try {
  //     console.log("[CHECKER NOTIFICATION EMIT]", {
  //       recipientId: notification.userId,
  //       notificationId: notification.id,
  //     });

  //     emitNotificationCreated({
  //       ...notification,
  //       createdAt: notification.createdAt.toISOString(),
  //     });
  //   } catch (error: unknown) {
  //     console.error(
  //       "Failed to emit next approver notification:",
  //       error
  //     );
  //   }
  // }

  return result;
}

// Final approval changes WorkingPermit.status to APPROVED.
export async function approveFinalApproverService(
  workingPermitId: string,
  userId: number
): Promise<ApprovalResult> {
  const { result, notifications } =
    await approveWorkingPermitRepo(
      workingPermitId,
      userId,
      "FINAL_APPROVER"
    );


  // for (const notification of notifications) {
  //   try {
  //     emitNotificationCreated({
  //       ...notification,
  //       createdAt: notification.createdAt.toISOString(),
  //     });
  //   } catch (error: unknown) {
  //     console.error(
  //       "Failed to emit Final Approver notification:",
  //       error
  //     );
  //   }
  // }


  dispatchNotifications(notifications);

  return result;
}

// FIRST_APPROVER is only required for Level 2.
export async function approveFirstApproverService(
  workingPermitId: string,
  userId: number
): Promise<ApprovalResult> {
  const { result, notifications } =
    await approveWorkingPermitRepo(
      workingPermitId,
      userId,
      "FIRST_APPROVER"
    );

     dispatchNotifications(notifications);
  // for (const notification of notifications) {
  //   emitNotificationCreated({
  //     ...notification,
  //     createdAt: notification.createdAt.toISOString(),
  //   });
  // }

  return result;
}

// ==================================================
// TROUBLESHOOTER - RECEIVE
// ==================================================

export async function receiveWorkingPermitService(
  workingPermitId: string,
  userId: number
) {
  const { result, notifications } =
    await receiveWorkingPermitRepo(
      workingPermitId,
      userId
    );

  // for (const notification of notifications) {
  //   try {
  //     emitNotificationCreated({
  //       ...notification,
  //       createdAt: notification.createdAt.toISOString(),
  //     });
  //   } catch (error: unknown) {
  //     console.error(
  //       "Failed to emit Coordinator IN_PROGRESS notification:",
  //       error
  //     );
  //   }
  // }


  dispatchNotifications(notifications);

  return result;
}
// ==================================================
// TROUBLESHOOTER - COMPLETE
// ==================================================

export async function completeWorkingPermitService(
  workingPermitId: string,
  userId: number
) {
  const { result, notifications } =
    await completeWorkingPermitRepo(
      workingPermitId,
      userId
    );

      dispatchNotifications(notifications);

  // for (const notification of notifications) {
  //   try {
  //     emitNotificationCreated({
  //       ...notification,
  //       createdAt: notification.createdAt.toISOString(),
  //     });
  //   } catch (error: unknown) {
  //     console.error(
  //       "Failed to emit Coordinator COMPLETED notification:",
  //       error
  //     );
  //   }
  // }

  return result;
}




//REJECT


export async function rejectCheckerService(
  workingPermitId: string,
  userId: number,
  rejectRemarks: string
) {
  return rejectWorkingPermitRepo(
    workingPermitId,
    userId,
    "CHECKER",
    rejectRemarks
  );
}

export async function rejectFirstApproverService(
  workingPermitId: string,
  userId: number,
  rejectRemarks: string
) {
  return rejectWorkingPermitRepo(
    workingPermitId,
    userId,
    "FIRST_APPROVER",
    rejectRemarks
  );
}

export async function rejectFinalApproverService(
  workingPermitId: string,
  userId: number,
  rejectRemarks: string
) {
  return rejectWorkingPermitRepo(
    workingPermitId,
    userId,
    "FINAL_APPROVER",
    rejectRemarks
  );
}
