
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers3,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";

import { navigation } from "@/config/navigation.config";
import { useAuth } from "@/modules/authentication/hooks/useAuth";
import { useSidebar } from "./Sidebar-Content"; 

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const {
    collapsed,
    mobileOpen,
    closeMobile,
  } = useSidebar();

  // ==========================================
  // FILTER NAVIGATION
  // ==========================================

  const menu = navigation.filter((item) => {
    if (
      item.roles &&
      !item.roles.some((role) =>
        user?.roles?.includes(role)
      )
    ) {
      return false;
    }

    if (
      item.permissions &&
      !item.permissions.some((permission) =>
        user?.permissions?.includes(permission)
      )
    ) {
      return false;
    }

    return true;
  });

  // ==========================================
  // USER INITIALS
  // ==========================================

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "U";

  return (
    <>
      {/* ======================================
          MOBILE BACKDROP
      ====================================== */}

      {mobileOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-slate-950/40
            backdrop-blur-[2px]
            transition-opacity
            lg:hidden
          "
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-dvh flex-col
          border-r border-[#E2E8F0]
          bg-[#EEF2F7]
          shadow-[2px_0_12px_rgba(15,23,42,0.025)]
          transition-[width,transform]
          duration-300 ease-in-out
          w-56
          ${collapsed ? "lg:w-18" : "lg:w-56"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* ====================================
            BRANDING
        ==================================== */}

        <div
          className={`
            flex h-20.5 shrink-0 items-center
            border-b border-[#E2E8F0]
            ${collapsed ? "lg:justify-center lg:px-2" : "px-4"}
          `}
        >
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              bg-[#171B4B]
              text-white
              shadow-sm
              ring-1 ring-white/10
            "
          >
            <Layers3
              size={19}
              strokeWidth={1.8}
            />
          </div>

          <div
            className={`
              ml-3 min-w-0 overflow-hidden
              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            <h2 className="text-[15px] font-bold tracking-[0.02em] text-[#171B35]">
              WPR
            </h2>

            <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium text-slate-500">
              Working Permit
            </p>
          </div>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close sidebar"
            className="
              ml-auto rounded-lg p-2
              text-slate-500
              transition-colors
              hover:bg-indigo-100
              hover:text-indigo-700
              lg:hidden
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* ====================================
            NAVIGATION
        ==================================== */}

        <nav
          aria-label="Main navigation"
          className={`
            flex-1 space-y-1.5
            overflow-y-auto
            pt-5 pb-4
            scrollbar-thin
            scrollbar-thumb-slate-200
            ${collapsed ? "lg:px-2" : "px-3"}
          `}
        >
          {menu.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={`${item.title}-${item.href}`}
                href={item.href}
                onClick={closeMobile}
                title={collapsed ? item.title : undefined}
                aria-label={item.title}
                aria-current={active ? "page" : undefined}
                className={`
                  group relative
                  flex h-10.5 items-center gap-3
                  rounded-xl px-3
                  text-[13px] font-medium
                  transition-all duration-200
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-indigo-500

                  ${
                    collapsed
                      ? "lg:justify-center lg:px-0"
                      : ""
                  }

                  ${
                    active
                      ? `
                        bg-[#E0E7FF]
                        text-[#3730A3]
                        shadow-[inset_0_0_0_1px_#C7D2FE]
                        font-semibold
                      `
                      : `
                        text-[#475569]
                        hover:bg-white/80
                        hover:text-[#4338CA]
                        hover:shadow-sm
                      `
                  }
                `}
              >
                {/* ACTIVE INDICATOR */}

                {active && (
                  <span
                    className="
                      absolute left-0 top-2 bottom-2
                      w-[3px] rounded-r-full
                      bg-[#4F46E5]
                    "
                  />
                )}

                {/* ICON */}

                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.8}
                  className={`
                    shrink-0
                    transition-colors duration-200

                    ${
                      active
                        ? "text-[#4F46E5]"
                        : "text-slate-500 group-hover:text-indigo-600"
                    }
                  `}
                />

                {/* LABEL */}

                <span
                  className={`
                    flex-1 truncate whitespace-nowrap
                    ${collapsed ? "lg:hidden" : ""}
                  `}
                >
                  {item.title}
                </span>

                {/* ACTIVE ARROW */}

                {active && (
                  <ChevronRight
                    size={15}
                    className={`
                      shrink-0 text-indigo-500
                      ${collapsed ? "lg:hidden" : ""}
                    `}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ====================================
            BOTTOM SECTION
        ==================================== */}

        <div
          className={`
            shrink-0 pb-4
            ${collapsed ? "lg:px-2" : "px-3"}
          `}
        >
          {/* ==================================
              WORKSPACE CARD
          ================================== */}

          <div
            className={`
              mb-4 overflow-hidden
              rounded-2xl
              border border-[#E2E8F0]
              bg-white/80
              p-3.5
              shadow-[0_2px_8px_rgba(15,23,42,0.025)]
              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            <div
              className="
                mb-3 flex h-8 w-8
                items-center justify-center
                rounded-xl
                bg-indigo-50
                text-indigo-600
              "
            >
              <Layers3 size={16} />
            </div>

            <p className="text-[12px] font-semibold text-slate-900">
              Workspace overview
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Manage your workspace and access controls.
            </p>
          </div>

          {/* ==================================
              PROFILE
          ================================== */}

          <div className="border-t border-[#DCE3ED] pt-3">
            <div
              className={`
                flex items-center gap-3
                rounded-xl px-2 py-2.5
                transition-colors
                hover:bg-white/60

                ${
                  collapsed
                    ? "lg:justify-center lg:px-0"
                    : ""
                }
              `}
            >
              {/* AVATAR */}

              <div
                title={user?.name ?? "User"}
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full
                  bg-[#E0E7FF]
                  text-[11px]
                  font-bold
                  text-[#4338CA]
                  ring-2 ring-white
                "
              >
                {initials}
              </div>

              {/* USER DETAILS */}

              <div
                className={`
                  min-w-0 flex-1
                  ${collapsed ? "lg:hidden" : ""}
                `}
              >
                <p className="truncate text-[12px] font-semibold text-slate-900">
                  {user?.name ?? "User"}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  {user?.username ?? "Account"}
                </p>
              </div>
            </div>

            {/* ==================================
                SIGN OUT
            ================================== */}

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className={`
                group mt-1
                flex w-full items-center gap-3
                rounded-xl px-3 py-2.5
                text-[12px] font-medium
                text-slate-500
                transition-all duration-200
                hover:bg-red-50
                hover:text-red-600
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-red-500

                ${
                  collapsed
                    ? "lg:justify-center lg:px-0"
                    : ""
                }
              `}
            >
              <LogOut
                size={17}
                className="
                  shrink-0
                  transition-colors
                  group-hover:text-red-500
                "
              />

              <span
                className={
                  collapsed ? "lg:hidden" : ""
                }
              >
                Sign out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
