import webpush, {
  webPushConfig,
} from "./push-notification.config";

import {
  pushNotificationRepository,
} from "./push-notification.repository";

import type {
  RegisterPushSubscriptionInput,
  PushNotificationPayload,
  PushDeliveryResult,
  SinglePushDeliveryResult,
} from "./push-notification.types";

type ActiveSubscription = Awaited<
  ReturnType<
    typeof pushNotificationRepository.findActiveByUserId
  >
>[number];

function getStatusCode(
  error: unknown
): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return undefined;
}

async function sendToSubscription(
  subscription: ActiveSubscription,
  payload: PushNotificationPayload
): Promise<SinglePushDeliveryResult> {
  if (!webPushConfig.enabled) {
    return "failed";
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,

        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },

      JSON.stringify(payload),

      {
        TTL: 60 * 60,
        urgency: "high",
        timeout: 10000,
      }
    );
  } catch (error: unknown) {
    const statusCode = getStatusCode(error);

    if (statusCode === 404 || statusCode === 410) {
      try {
        await pushNotificationRepository.deleteExpired(
          subscription.id
        );
      } catch {
        console.error(
          "[WEB PUSH] Failed to remove expired subscription",
          subscription.id
        );
      }

      return "expired";
    }

    console.error("[WEB PUSH] Delivery failed", {
      subscriptionId: subscription.id,
      statusCode,
    });

    return "failed";
  }

  try {
    await pushNotificationRepository.updateLastUsedAt(
      subscription.id
    );
  } catch {
    console.error(
      "[WEB PUSH] Failed to update lastUsedAt",
      subscription.id
    );
  }

  return "sent";
}

async function deliverNotifications(
  subscriptions: ActiveSubscription[],
  payload: PushNotificationPayload
): Promise<PushDeliveryResult> {
  const result: PushDeliveryResult = {
    total: subscriptions.length,
    sent: 0,
    failed: 0,
    expired: 0,
  };

  const batchSize = 10;

  for (
    let index = 0;
    index < subscriptions.length;
    index += batchSize
  ) {
    const batch = subscriptions.slice(
      index,
      index + batchSize
    );

    const deliveries = await Promise.allSettled(
      batch.map((subscription) =>
        sendToSubscription(subscription, payload)
      )
    );

    for (const delivery of deliveries) {
      if (delivery.status === "rejected") {
        result.failed++;
        continue;
      }

      result[delivery.value]++;
    }
  }

  return result;
}

export const pushNotificationService = {
  getPublicKey() {
    return {
      publicKey: webPushConfig.publicKey,
      enabled: webPushConfig.enabled,
    };
  },

  async subscribe(
    data: RegisterPushSubscriptionInput
  ) {
    if (!webPushConfig.enabled) {
      throw new Error(
        "Web Push is not configured"
      );
    }

    const subscription =
      await pushNotificationRepository.subscribe(data);

    return {
      id: subscription.id,
      isActive: subscription.isActive,
      createdAt: subscription.createdAt,
    };
  },

  async unsubscribe(
    userId: number,
    endpoint: string
  ) {
    await pushNotificationRepository.unsubscribe(
      userId,
      endpoint
    );

    return {
      subscribed: false,
    };
  },

  async getStatus(
    userId: number,
    endpoint: string
  ) {
    const subscription =
      await pushNotificationRepository.findByEndpoint(
        userId,
        endpoint
      );

    return {
      subscribed: Boolean(subscription),
      configured: webPushConfig.enabled,
    };
  },

  async sendToUser(
    userId: number,
    payload: PushNotificationPayload
  ): Promise<PushDeliveryResult> {
    const subscriptions =
      await pushNotificationRepository.findActiveByUserId(
        userId
      );

    return deliverNotifications(
      subscriptions,
      payload
    );
  },

  async sendToUsers(
    userIds: number[],
    payload: PushNotificationPayload
  ): Promise<PushDeliveryResult> {
    const uniqueUserIds = [...new Set(userIds)];

    const subscriptions =
      await pushNotificationRepository.findActiveByUserIds(
        uniqueUserIds
      );

    return deliverNotifications(
      subscriptions,
      payload
    );
  },

  async sendTest(
    userId: number,
    endpoint: string
  ) {
    const subscription =
      await pushNotificationRepository.findByEndpoint(
        userId,
        endpoint
      );

    if (!subscription) {
      return {
        subscribed: false,
        sent: false,
      };
    }

    const result = await sendToSubscription(
      subscription,
      {
        title: "Working Permit System",

        body: "Your push notifications are working!",

        icon: "/icons/icon-192x192.png",

        tag: "wp-test-notification",

        data: {
          url: "/",
          type: "TEST",
        },
      }
    );

    return {
      subscribed: result !== "expired",
      sent: result === "sent",
    };
  },
};


