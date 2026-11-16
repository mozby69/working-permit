
"use client";

import { usePathname } from "next/navigation";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  CheckCheck,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { useState } from "react";

import { navigation } from "@/config/navigation.config";
import { useSidebar } from "./Sidebar-Content";

import {
  useNotifications,
  useUnreadNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/modules/notifications/hooks/useNotification";

import { useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [notificationOpen, setNotificationOpen] = useState(false);

  const currentPage = navigation
    .filter(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" &&
          pathname.startsWith(`${item.href}/`))
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  const pageTitle = currentPage?.title ?? "Overview";

  const {
    collapsed,
    toggleSidebar,
    toggleMobile,
  } = useSidebar();

  // NOTIFICATION QUERIES
  const { data: notificationResponse, isLoading } =
    useNotifications(1, 10);

  const { data: unreadCount = 0 } =
    useUnreadNotifications();

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = notificationResponse?.data ?? [];

  // SIDEBAR TOGGLE
  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      toggleMobile();
    } else {
      toggleSidebar();
    }
  };

  // FORMAT TIME
  const formatTime = (date: string) => {
    const now = new Date();
    const created = new Date(date);

    const diff = Math.floor(
      (now.getTime() - created.getTime()) / 1000
    );

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return created.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
    });
  };

  // OPEN NOTIFICATION
  const handleNotificationClick = async (
    notification: (typeof notifications)[number]
  ) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    setNotificationOpen(false);

    if (notification.workingPermitId) {
      router.push(
        `/workingPermit?id=${encodeURIComponent(
          notification.workingPermitId
        )}`
      );
    }
  };

  return (
    <header
      className="
        relative z-30
        flex h-20.5 shrink-0
        items-center justify-between
        border-b border-[#E2E8F0]
        bg-white/95
        px-4 sm:px-6 lg:px-8
        shadow-[0_1px_3px_rgba(15,23,42,0.025)]
        backdrop-blur-md
      "
    >
      {/* LEFT: SIDEBAR TOGGLE */}

      <div className="flex items-center">
        <button
          type="button"
          onClick={handleSidebarToggle}
          aria-label="Toggle sidebar"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="
            group flex h-10 w-10 shrink-0
            items-center justify-center rounded-xl
            border border-transparent text-[#475569]
            transition-all duration-200
            hover:border-[#C7D2FE]
            hover:bg-[#EEF2FF]
            hover:text-[#4F46E5]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-indigo-500
          "
        >
          <Menu
            size={20}
            strokeWidth={1.8}
            className="lg:hidden"
          />

          {collapsed ? (
            <PanelLeftOpen
              size={20}
              strokeWidth={1.8}
              className="hidden lg:block"
            />
          ) : (
            <PanelLeftClose
              size={20}
              strokeWidth={1.8}
              className="hidden lg:block"
            />
          )}
        </button>
      </div>

      {/* CENTER: PAGE TITLE */}

      <div
        className="
          absolute left-1/2
          flex max-w-[45%]
          -translate-x-1/2
          flex-col items-start gap-0.5
        "
      >
        <p
          className="
            whitespace-nowrap text-[10px]
            font-semibold uppercase
            tracking-[0.16em] text-[#94A3B8]
          "
        >
          User Workspace
        </p>

        <h1
          className="
            max-w-full truncate
            text-[17px] font-semibold
            leading-tight tracking-tight text-[#0F172A]
          "
          title={pageTitle}
        >
          {pageTitle}
        </h1>
      </div>

      {/* RIGHT: NOTIFICATIONS */}

      <div className="flex items-center gap-3">

        <div className="relative">

          {/* BELL BUTTON */}

          <button
            type="button"
            onClick={() => setNotificationOpen((prev) => !prev)}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={notificationOpen}
            className="
              relative flex h-10 w-10
              items-center justify-center
              rounded-xl border border-transparent
              text-[#475569]
              transition-all duration-200
              hover:border-[#C7D2FE]
              hover:bg-[#EEF2FF]
              hover:text-[#4F46E5]
              focus-visible:outline-2
              focus-visible:outline-indigo-500
            "
          >
            <Bell size={21} strokeWidth={1.8} />

            {unreadCount > 0 && (
              <span
                className="
                  absolute -right-1 -top-1
                  flex h-[19px] min-w-[19px]
                  items-center justify-center
                  rounded-full border-2 border-white
                  bg-red-500 px-1
                  text-[10px] font-bold text-white
                "
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}

          {notificationOpen && (
            <>
              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setNotificationOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div
                className="
                  absolute right-0 top-14 z-50
                  w-[min(380px,calc(100vw-2rem))]
                  overflow-hidden rounded-2xl
                  border border-[#E2E8F0]
                  bg-white
                  shadow-[0_12px_40px_rgba(15,23,42,0.14)]
                "
              >
                {/* DROPDOWN HEADER */}

                <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">

                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A]">
                      Notifications
                    </h3>

                    <p className="mt-0.5 text-xs text-[#94A3B8]">
                      {unreadCount} unread notifications
                    </p>
                  </div>

                  <div className="flex items-center gap-1">

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        disabled={markAllAsRead.isPending}
                        onClick={() => markAllAsRead.mutate()}
                        className="
                          flex items-center gap-1.5
                          rounded-lg px-2 py-2
                          text-xs font-medium
                          text-indigo-600
                          transition-colors
                          hover:bg-indigo-50
                          disabled:opacity-50
                        "
                      >
                        <CheckCheck size={15} />
                        Mark all read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      className="
                        flex h-8 w-8 items-center justify-center
                        rounded-lg text-[#94A3B8]
                        hover:bg-[#F1F5F9]
                        hover:text-[#475569]
                      "
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                {/* NOTIFICATION LIST */}

                <div className="max-h-[420px] overflow-y-auto">

                  {isLoading ? (
                    <div className="px-5 py-12 text-center">
                      <p className="text-sm text-[#94A3B8]">
                        Loading notifications...
                      </p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center px-5 py-12 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9]">
                        <Bell
                          size={22}
                          className="text-[#94A3B8]"
                        />
                      </div>

                      <p className="text-sm font-medium text-[#475569]">
                        No notifications yet
                      </p>

                      <p className="mt-1 text-xs text-[#94A3B8]">
                        Youre all caught up.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                        className={`
                          flex w-full items-start gap-3
                          border-b border-[#F1F5F9]
                          px-5 py-4 text-left
                          transition-colors
                          hover:bg-[#F8FAFC]
                          ${
                            !notification.isRead
                              ? "bg-[#F5F7FF]"
                              : "bg-white"
                          }
                        `}
                      >
                        <div
                          className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-xl bg-[#EEF2FF]
                          "
                        >
                          <FileText
                            size={18}
                            className="text-indigo-600"
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-semibold text-[#1E293B]">
                              {notification.title}
                            </p>

                            {!notification.isRead && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                            )}
                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B]">
                            {notification.message}
                          </p>

                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                            <Clock size={12} />
                            {formatTime(notification.createdAt)}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* FOOTER */}

                <div className="border-t border-[#F1F5F9] px-5 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setNotificationOpen(false)}
                    className="
                      text-xs font-semibold
                      text-indigo-600
                      hover:text-indigo-700
                    "
                  >
                    Close notifications
                  </button>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
