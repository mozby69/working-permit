import api from "@/lib/api/api-client";



import { 
    createPushResponseSchema, 
    PushPublicKeySchema,
    PushSubscribeResponseSchema,
    PushUnsubscribeResponseSchema,
    PushStatusResponseSchema,
    PushTestResponseSchema,
} from "@repo/shared";


import { PushSubscriptionInput, PushEndpointInput} from "@repo/shared";
// import type {
//   PushSubscriptionInput,
//   PushEndpointInput,
// } from "../types/push-notification.types";

const BASE_URL = "/push-notification";

export const pushNotificationService = {
  async getPublicKey() {
    const response = await api.get<unknown>(
      `${BASE_URL}/public-key`
    );

    return createPushResponseSchema(
      PushPublicKeySchema
    ).parse(response.data);
  },

  async subscribe(data: PushSubscriptionInput) {
    const response = await api.post<unknown>(
      `${BASE_URL}/subscribe`,
      data
    );

    return createPushResponseSchema(
      PushSubscribeResponseSchema
    ).parse(response.data);
  },

  async unsubscribe(data: PushEndpointInput) {
    const response = await api.post<unknown>(
      `${BASE_URL}/unsubscribe`,
      data
    );

    return createPushResponseSchema(
      PushUnsubscribeResponseSchema
    ).parse(response.data);
  },

  async getStatus(data: PushEndpointInput) {
    const response = await api.post<unknown>(
      `${BASE_URL}/status`,
      data
    );

    return createPushResponseSchema(
      PushStatusResponseSchema
    ).parse(response.data);
  },

  async sendTest(data: PushEndpointInput) {
    const response = await api.post<unknown>(
      `${BASE_URL}/test`,
      data
    );

    return createPushResponseSchema(
      PushTestResponseSchema
    ).parse(response.data);
  },
};