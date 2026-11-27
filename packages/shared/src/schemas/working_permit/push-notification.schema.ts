import { z } from "zod";

const endpointSchema = z
  .url()
  .max(4096)
  .refine(
    (value) => new URL(value).protocol === "https:",
    "Push endpoint must use HTTPS"
  );

export const SubscribePushSchema = z.object({
  endpoint: endpointSchema,

  keys: z.object({
    p256dh: z.string().min(1).max(255),
    auth: z.string().min(1).max(255),
  }),
});

export const UnsubscribePushSchema = z.object({
  endpoint: endpointSchema,
});

export const PushStatusSchema = z.object({
  endpoint: endpointSchema,
});

export const TestPushSchema = z.object({
  endpoint: endpointSchema,
});

export type SubscribePushInput = z.infer<
  typeof SubscribePushSchema
>;

export type UnsubscribePushInput = z.infer<
  typeof UnsubscribePushSchema
>;

export type PushStatusInput = z.infer<
  typeof PushStatusSchema
>;

export type TestPushInput = z.infer<
  typeof TestPushSchema
>;





//push



export const PushSubscriptionSchema = z.object({
  endpoint: z.url(),

  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const PushEndpointSchema = z.object({
  endpoint: z.url(),
});

export const PushPublicKeySchema = z.object({
  publicKey: z.string(),
  enabled: z.boolean(),
});

export const PushSubscribeResponseSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const PushUnsubscribeResponseSchema = z.object({
  subscribed: z.boolean(),
});

export const PushStatusResponseSchema = z.object({
  subscribed: z.boolean(),
  configured: z.boolean(),
});

export const PushTestResponseSchema = z.object({
  subscribed: z.boolean(),
  sent: z.boolean(),
});

export function createPushResponseSchema<
  T extends z.ZodType
>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema,
  });
}

export type PushSubscriptionInput = z.infer<
  typeof PushSubscriptionSchema
>;

export type PushEndpointInput = z.infer<
  typeof PushEndpointSchema
>;

export type PushPublicKey = z.infer<
  typeof PushPublicKeySchema
>;

export type PushSubscribeResponse = z.infer<
  typeof PushSubscribeResponseSchema
>;

export type PushUnsubscribeResponse = z.infer<
  typeof PushUnsubscribeResponseSchema
>;

export type PushStatusResponse = z.infer<
  typeof PushStatusResponseSchema
>;

export type PushTestResponse = z.infer<
  typeof PushTestResponseSchema
>;

export type PushPermission =
  | NotificationPermission
  | "unsupported"
  | "unknown";

export type PushBrowserState = {
  supported: boolean;
  permission: PushPermission;
  endpoint: string | null;
};