"use client";

import { useState } from "react";
import axios from "axios";

import {
  BellRing,
  BellOff,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  usePushNotification,
} from "../hooks/usePushNotification";

type PushNotificationSettingsProps = {
  userId: number;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

function getErrorMessage(
  error: unknown
): string {
  if (
    axios.isAxiosError<{
      message?: string;
    }>(error)
  ) {
    return (
      error.response?.data?.message ??
      error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function PushNotificationSettings({
  userId,
}: PushNotificationSettingsProps) {
  const {
    supported,
    configured,
    subscribed,
    blocked,
    permission,
    isLoading,
    isUpdating,
    isEnabling,
    isDisabling,
    isTesting,
    queryError,
    enablePush,
    disablePush,
    testPush,
  } = usePushNotification(userId);

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  // ==========================================
  // ENABLE / DISABLE
  // ==========================================

  async function handleToggle() {
    setFeedback(null);

    try {
      if (subscribed) {
        await disablePush();

        setFeedback({
          type: "success",
          message:
            "Push notifications disabled.",
        });

        return;
      }

      await enablePush();

      setFeedback({
        type: "success",
        message:
          "Push notifications enabled.",
      });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  }

  // ==========================================
  // TEST NOTIFICATION
  // ==========================================

  async function handleTest() {
    setFeedback(null);

    try {
      await testPush();

      setFeedback({
        type: "success",
        message:
          "Test notification submitted successfully.",
      });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  }

  // ==========================================
  // STATUS
  // ==========================================

  const statusText = isLoading
    ? "Checking notification status..."
    : queryError
      ? "Unable to retrieve notification status"
      : !supported
        ? "Not supported on this browser"
        : !configured
          ? "Web Push is not configured"
          : blocked
            ? "Notifications blocked by browser"
            : subscribed
              ? "Push notifications enabled"
              : "Push notifications disabled";

  const statusColor = isLoading
    ? "bg-slate-400"
    : queryError
      ? "bg-red-500"
      : !supported || !configured
        ? "bg-slate-400"
        : blocked
          ? "bg-amber-500"
          : subscribed
            ? "bg-emerald-500"
            : "bg-slate-400";

  const toggleDisabled =
    isLoading ||
    isUpdating ||
    isTesting ||
    Boolean(queryError) ||
    !supported ||
    (!subscribed && (!configured || blocked));

  return (
    <section
      className="
        space-y-4 rounded-xl
        border border-slate-200
        bg-white p-4
      "
    >
      {/* Header */}

      <div className="flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div
            className={`
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-lg
              ${
                subscribed
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-500"
              }
            `}
          >
            {subscribed ? (
              <BellRing size={19} />
            ) : (
              <BellOff size={19} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">
              Push Notifications
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Receive notifications on this device.
            </p>
          </div>
        </div>

        {/* Toggle */}

        <button
          type="button"
          role="switch"
          aria-checked={subscribed}
          aria-label="Push notifications"
          disabled={toggleDisabled}
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11
            shrink-0 items-center rounded-full
            transition-colors
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-500
            focus-visible:ring-offset-2
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${
              subscribed
                ? "bg-emerald-600"
                : "bg-slate-300"
            }
          `}
        >
          <span
            className={`
              inline-block h-4 w-4
              transform rounded-full
              bg-white shadow-sm
              transition-transform
              ${
                subscribed
                  ? "translate-x-6"
                  : "translate-x-1"
              }
            `}
          />
        </button>
      </div>

      {/* Status */}

      <div className="border-t border-slate-100 pt-3">

        <div className="flex items-center gap-2">

          {isLoading || isUpdating ? (
            <Loader2
              size={13}
              className="animate-spin text-slate-500"
            />
          ) : (
            <span
              className={`
                h-2 w-2 shrink-0
                rounded-full ${statusColor}
              `}
            />
          )}

          <span className="text-xs font-medium text-slate-600">
            {isEnabling
              ? "Enabling push notifications..."
              : isDisabling
                ? "Disabling push notifications..."
                : statusText}
          </span>
        </div>
      </div>

      {/* Information */}

      <div
        className="
          flex items-start gap-2
          rounded-lg bg-slate-50 p-3
        "
      >
        <Info
          size={15}
          className="mt-0.5 shrink-0 text-slate-500"
        />

        <p className="text-xs leading-relaxed text-slate-600">
          Receive working permit notifications even
          when the website is in the background.
          You can disable this feature at any time.
        </p>
      </div>

      {/* Unsupported browser */}

      {!isLoading && !supported && (
        <div
          className="
            rounded-lg border border-amber-200
            bg-amber-50 p-3
            text-xs text-amber-700
          "
        >
          Push notifications require a supported
          browser and a secure HTTPS connection
          or localhost.
        </div>
      )}

      {/* Browser permission blocked */}

      {blocked && (
        <div
          className="
            flex items-start gap-2
            rounded-lg border border-amber-200
            bg-amber-50 p-3
          "
        >
          <AlertCircle
            size={15}
            className="shrink-0 text-amber-600"
          />

          <p className="text-xs leading-relaxed text-amber-700">
            Notifications are blocked. Open your
            browser&apos;s site settings and allow
            notifications, then return to this page.
          </p>
        </div>
      )}

      {/* Permission required */}

      {supported &&
        permission === "default" &&
        !subscribed && (
          <p className="text-xs text-slate-500">
            Enabling this feature will request
            notification permission from your browser.
          </p>
        )}

      {/* Test notification button */}

      <button
        type="button"
        disabled={
          !subscribed ||
          !configured ||
          isLoading ||
          isUpdating ||
          isTesting ||
          Boolean(queryError)
        }
        onClick={handleTest}
        className="
          flex w-full items-center justify-center
          gap-2 rounded-lg border
          border-slate-200 px-3 py-2.5
          text-xs font-medium text-slate-700
          transition-colors
          hover:border-slate-300
          hover:bg-slate-50
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isTesting ? (
          <Loader2
            size={15}
            className="animate-spin"
          />
        ) : (
          <BellRing size={15} />
        )}

        {isTesting
          ? "Sending notification..."
          : "Send Test Notification"}
      </button>

      {/* Feedback */}

      {feedback && (
        <div
          role="status"
          className={`
            flex items-start gap-2
            rounded-lg border p-3
            ${
              feedback.type === "success"
                ? `
                  border-emerald-200
                  bg-emerald-50
                  text-emerald-700
                `
                : `
                  border-red-200
                  bg-red-50
                  text-red-700
                `
            }
          `}
        >
          {feedback.type === "success" ? (
            <CheckCircle2
              size={15}
              className="shrink-0"
            />
          ) : (
            <AlertCircle
              size={15}
              className="shrink-0"
            />
          )}

          <p className="text-xs">
            {feedback.message}
          </p>
        </div>
      )}
    </section>
  );
}