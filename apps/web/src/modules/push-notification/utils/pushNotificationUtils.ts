import { PushSubscriptionSchema, PushSubscriptionInput, PushBrowserState} from "@repo/shared";




export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function urlBase64ToUint8Array(
  base64String: string
): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(
    rawData.length
  );

  for (
    let index = 0;
    index < rawData.length;
    index++
  ) {
    outputArray[index] =
      rawData.charCodeAt(index);
  }

  return outputArray;
}

export async function registerPushServiceWorker():
  Promise<ServiceWorkerRegistration> {
  if (!isPushNotificationSupported()) {
    throw new Error(
      "Push notifications are not supported in this browser."
    );
  }

  await navigator.serviceWorker.register(
    "/sw.js",
    {
      scope: "/",
    }
  );

  return navigator.serviceWorker.ready;
}

export async function getExistingPushSubscription():
  Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  const registration =
    await navigator.serviceWorker.getRegistration("/");

  if (!registration) {
    return null;
  }

  return registration.pushManager.getSubscription();
}

export async function createBrowserPushSubscription(
  publicKey: string
): Promise<PushSubscription> {
  const registration =
    await registerPushServiceWorker();

  const existingSubscription =
    await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,

    applicationServerKey:
      urlBase64ToUint8Array(publicKey),
  });
}

export function serializePushSubscription(
  subscription: PushSubscription
): PushSubscriptionInput {
  const serialized = subscription.toJSON();

  return PushSubscriptionSchema.parse({
    endpoint: subscription.endpoint,

    keys: {
      p256dh: serialized.keys?.p256dh,
      auth: serialized.keys?.auth,
    },
  });
}







export async function getPushBrowserState():
  Promise<PushBrowserState> {
  const supported = isPushNotificationSupported();

  if (!supported) {
    return {
      supported: false,
      permission: "unsupported",
      endpoint: null,
    };
  }

  const subscription =
    await getExistingPushSubscription();

  return {
    supported: true,
    permission: Notification.permission,
    endpoint: subscription?.endpoint ?? null,
  };
}