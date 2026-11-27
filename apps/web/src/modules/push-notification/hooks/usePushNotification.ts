"use client";


import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { pushNotificationService } from "../services/pushNotifcationService";
import { isPushNotificationSupported,getExistingPushSubscription,createBrowserPushSubscription,serializePushSubscription, getPushBrowserState } from "../utils/pushNotificationUtils";
import { PushBrowserState } from "@repo/shared";
import { useEffect } from "react";


export const pushNotificationKeys = {
  all: ["push-notification"] as const,

  browser: () =>
    [
      ...pushNotificationKeys.all,
      "browser",
    ] as const,

  publicKey: () =>
    [
      ...pushNotificationKeys.all,
      "public-key",
    ] as const,

  status: (
    userId: number,
    endpoint: string | null
  ) =>
    [
      ...pushNotificationKeys.all,
      "status",
      userId,
      endpoint,
    ] as const,
};

const initialBrowserState: PushBrowserState = {
  supported: false,
  permission: "unknown",
  endpoint: null,
};

export function usePushNotification(
  userId: number
) {
  const queryClient = useQueryClient();


// ==========================================
// BROWSER STATE
// ==========================================

const browserStateQuery = useQuery({
  queryKey: pushNotificationKeys.browser(),

  queryFn: getPushBrowserState,

  enabled: typeof window !== "undefined",

  staleTime: 0,

  refetchOnWindowFocus: "always",

  refetchOnReconnect: true,

  retry: false,
});

const browserState =
  browserStateQuery.data ?? initialBrowserState;

const isInitializing = browserStateQuery.isPending;

const refreshBrowserState = async () => {
  await browserStateQuery.refetch();
};

  // Refresh permission when the user returns
  // from browser settings.

  useEffect(() => {
    function handleFocus() {
      void refreshBrowserState().catch(
        (error: unknown) => {
          console.error(
            "[WEB PUSH] Refresh failed",
            error
          );
        }
      );
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [refreshBrowserState]);

  // ==========================================
  // PUBLIC KEY QUERY
  // ==========================================

  const publicKeyQuery = useQuery({
    queryKey:
      pushNotificationKeys.publicKey(),

    queryFn:
      pushNotificationService.getPublicKey,

    enabled:
      browserState.supported &&
      !isInitializing,

    staleTime: Infinity,

    retry: 1,
  });

  const publicKey =
    publicKeyQuery.data?.data.publicKey;

  const configured =
    publicKeyQuery.data?.data.enabled ?? false;

  // ==========================================
  // SUBSCRIPTION STATUS QUERY
  // ==========================================

  const statusQuery = useQuery({
    queryKey:
      pushNotificationKeys.status(
        userId,
        browserState.endpoint
      ),

    queryFn: () => {
      if (!browserState.endpoint) {
        throw new Error(
          "No browser subscription found."
        );
      }

      return pushNotificationService.getStatus({
        endpoint: browserState.endpoint,
      });
    },

    enabled:
      browserState.supported &&
      Boolean(browserState.endpoint) &&
      !isInitializing,

    staleTime: 30_000,

    retry: 1,
  });

  // ==========================================
  // ENABLE PUSH NOTIFICATIONS
  // ==========================================

  const enableMutation = useMutation({
    mutationFn: async () => {
      if (!isPushNotificationSupported()) {
        throw new Error(
          "Push notifications are not supported."
        );
      }

      if (!configured || !publicKey) {
        throw new Error(
          "Web Push is not configured on the server."
        );
      }

      if (Notification.permission === "denied") {
        throw new Error(
          "Notifications are blocked by your browser."
        );
      }

      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

            await refreshBrowserState();

      if (permission !== "granted") {
        throw new Error(
          "Notification permission was not granted."
        );
      }

      const subscription =
        await createBrowserPushSubscription(
          publicKey
        );

      const payload =
        serializePushSubscription(subscription);

      return pushNotificationService.subscribe(
        payload
      );
    },

    onSuccess: async () => {
      await refreshBrowserState();

      await queryClient.invalidateQueries({
        queryKey: pushNotificationKeys.all,
      });
    },

    onError: () => {
      void refreshBrowserState().catch(
        console.error
      );
    },
  });

  // ==========================================
  // DISABLE PUSH NOTIFICATIONS
  // ==========================================

  const disableMutation = useMutation({
    mutationFn: async () => {
      const subscription =
        await getExistingPushSubscription();

      if (!subscription) {
        return;
      }

      // Disable backend subscription first.
      await pushNotificationService.unsubscribe({
        endpoint: subscription.endpoint,
      });

      // Remove the browser subscription.
      await subscription.unsubscribe();
    },

    onSuccess: async () => {
      await refreshBrowserState();

      await queryClient.invalidateQueries({
        queryKey: pushNotificationKeys.all,
      });
    },

    onError: () => {
      void refreshBrowserState().catch(
        console.error
      );
    },
  });

  // ==========================================
  // TEST PUSH NOTIFICATION
  // ==========================================

  const testMutation = useMutation({
    mutationFn: async () => {
      const subscription =
        await getExistingPushSubscription();

      if (!subscription) {
        throw new Error(
          "Enable push notifications first."
        );
      }

      const response =
        await pushNotificationService.sendTest({
          endpoint: subscription.endpoint,
        });

      if (!response.data.sent) {
        throw new Error(
          "Unable to send test notification."
        );
      }

      return response;
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: pushNotificationKeys.all,
      });
    },
  });

  // ==========================================
  // DERIVED STATE
  // ==========================================

  const subscribed =
    browserState.permission === "granted" &&
    Boolean(browserState.endpoint) &&
    (statusQuery.data?.data.subscribed ?? false);

  const isLoading =
    isInitializing ||
    (
      browserState.supported &&
      publicKeyQuery.isPending
    ) ||
    (
      Boolean(browserState.endpoint) &&
      statusQuery.isPending
    );

  const isUpdating =
    enableMutation.isPending ||
    disableMutation.isPending;

  return {
    supported: browserState.supported,

    permission: browserState.permission,

    endpoint: browserState.endpoint,

    configured,

    subscribed,

    blocked:
      browserState.permission === "denied",

    isLoading,

    isUpdating,

    isEnabling: enableMutation.isPending,

    isDisabling: disableMutation.isPending,

    isTesting: testMutation.isPending,

    queryError:
      browserStateQuery.error ??
      publicKeyQuery.error ??
      statusQuery.error,

    enablePush: enableMutation.mutateAsync,

    disablePush: disableMutation.mutateAsync,

    testPush: testMutation.mutateAsync,

    refreshBrowserState,
  };
}
