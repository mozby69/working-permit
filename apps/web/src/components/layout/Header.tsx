
"use client";

import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { navigation } from "@/config/navigation.config";
import { useSidebar } from "./Sidebar-Content"; 

// import NotificationBell from "@/modules/user/notifications/components/NotificationBell";

export default function Header() {
  const pathname = usePathname();

  // ==========================================
  // CURRENT PAGE
  // ==========================================

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

  // ==========================================
  // SIDEBAR TOGGLE
  // ==========================================

  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      toggleMobile();
    } else {
      toggleSidebar();
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
      {/* ======================================
          LEFT: SIDEBAR TOGGLE
      ====================================== */}

      <div className="flex items-center">
        <button
          type="button"
          onClick={handleSidebarToggle}
          aria-label="Toggle sidebar"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="
            group flex h-10 w-10
            shrink-0 items-center justify-center
            rounded-xl
            border border-transparent
            text-[#475569]
            transition-all duration-200
            hover:border-[#C7D2FE]
            hover:bg-[#EEF2FF]
            hover:text-[#4F46E5]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-indigo-500
          "
        >
          {/* MOBILE ICON */}

          <Menu
            size={20}
            strokeWidth={1.8}
            className="lg:hidden"
          />

          {/* DESKTOP ICON */}

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

      {/* ======================================
          CENTER: PAGE TITLE
      ====================================== */}

      <div
        className="
          absolute left-1/2
          flex max-w-[45%]
          -translate-x-1/2
          flex-col items-start
          gap-0.5
        "
      >
        <p
          className="
            whitespace-nowrap
            text-[10px] font-semibold
            uppercase tracking-[0.16em]
            text-[#94A3B8]
          "
        >
          User Workspace
        </p>

        <h1
          className="
            max-w-full truncate
            text-[17px] font-semibold
            leading-tight tracking-tight
            text-[#0F172A]
          "
          title={pageTitle}
        >
          {pageTitle}
        </h1>
      </div>

      {/* ======================================
          RIGHT: NOTIFICATIONS
      ====================================== */}

      <div className="flex items-center gap-3">
        <div
          className="
            flex h-10 min-w-10
            items-center justify-center
            rounded-xl
            transition-colors duration-200
            hover:bg-[#EEF2FF]
          "
        >
          {/* <NotificationBell /> */}
        </div>
      </div>
    </header>
  );
}
