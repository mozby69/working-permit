import { createHash } from "node:crypto";

import { prisma } from "../../lib/database/prisma";

import type {
  RegisterPushSubscriptionInput,
} from "./push-notification.types";

function hashEndpoint(endpoint: string): string {
  return createHash("sha256")
    .update(endpoint)
    .digest("hex");
}

export const pushNotificationRepository = {
  async subscribe(data: RegisterPushSubscriptionInput) {
    const endpointHash = hashEndpoint(data.endpoint);

    return prisma.pushSubscription.upsert({
      where: {
        endpointHash,
      },

      create: {
        userId: data.userId,
        endpoint: data.endpoint,
        endpointHash,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent,
        isActive: true,
      },

      update: {
        userId: data.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent,
        isActive: true,
      },
    });
  },

  async unsubscribe(
    userId: number,
    endpoint: string
  ) {
    return prisma.pushSubscription.updateMany({
      where: {
        userId,
        endpointHash: hashEndpoint(endpoint),
      },

      data: {
        isActive: false,
      },
    });
  },

  async findByEndpoint(
    userId: number,
    endpoint: string
  ) {
    return prisma.pushSubscription.findFirst({
      where: {
        userId,
        endpointHash: hashEndpoint(endpoint),
        isActive: true,
      },
    });
  },

  async findActiveByUserId(userId: number) {
    return prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  },

  async findActiveByUserIds(userIds: number[]) {
    return prisma.pushSubscription.findMany({
      where: {
        userId: {
          in: userIds,
        },
        isActive: true,
      },
    });
  },

  async updateLastUsedAt(id: string) {
    return prisma.pushSubscription.updateMany({
      where: {
        id,
      },

      data: {
        lastUsedAt: new Date(),
      },
    });
  },

  async deactivate(id: string) {
    return prisma.pushSubscription.updateMany({
      where: {
        id,
      },

      data: {
        isActive: false,
      },
    });
  },

  async deleteExpired(id: string) {
    return prisma.pushSubscription.deleteMany({
      where: {
        id,
      },
    });
  },
};