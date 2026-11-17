
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
            bg-[#090D2D]/60
            backdrop-blur-sm
            transition-opacity duration-300
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

          w-60
          bg-[#171B4B]

          border-r border-[#343967]

          shadow-[4px_0_24px_rgba(15,23,42,0.12)]

          transition-[width,transform]
          duration-300 ease-in-out

          ${collapsed ? "lg:w-[76px]" : "lg:w-60"}

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
            relative flex h-[82px] shrink-0
            items-center
            border-b border-[#343967]

            ${
              collapsed
                ? "lg:justify-center lg:px-2"
                : "px-5"
            }
          `}
        >
          {/* LOGO */}

          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center

              rounded-xl

              bg-gradient-to-br
              from-[#6366F1]
              to-[#3730A3]

              text-white

              shadow-lg
              shadow-indigo-950/30

              ring-1 ring-white/15
            "
          >
            <Layers3
              size={20}
              strokeWidth={1.8}
            />
          </div>

          {/* BRAND NAME */}

          <div
            className={`
              ml-3 min-w-0 overflow-hidden
              transition-opacity duration-200

              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            <h2 className="
              text-[16px]
              font-bold
              tracking-wide
              text-white
            ">
              WPMS
            </h2>

            <p className="
              mt-0.5
              whitespace-nowrap
              text-[11px]
              font-medium
              text-[#A5ACCC]
            ">
              Working Permit System
            </p>
          </div>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close sidebar"
            className="
              ml-auto rounded-lg p-2
              text-[#A5ACCC]
              transition-colors duration-200
              hover:bg-white/10
              hover:text-white
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
            flex-1
            space-y-1.5
            overflow-y-auto

            pt-6 pb-4

            scrollbar-thin
            scrollbar-thumb-[#414779]

            ${
              collapsed
                ? "lg:px-2"
                : "px-3.5"
            }
          `}
        >
          {/* MENU LABEL */}

          <p
            className={`
              mb-3 px-3
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#8189B5]

              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            Main Menu
          </p>

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

                  flex h-11
                  items-center gap-3

                  rounded-xl px-3

                  text-[13px]
                  font-medium

                  transition-all duration-200

                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-indigo-400

                  ${
                    collapsed
                      ? "lg:justify-center lg:px-0"
                      : ""
                  }

                  ${
                    active
                      ? `
                        bg-[#3730A3]
                        text-white
                        font-semibold

                        shadow-[inset_0_0_0_1px_rgba(165,180,252,0.18)]
                      `
                      : `
                        text-[#B5BBD5]

                        hover:bg-[#292E65]
                        hover:text-white
                      `
                  }
                `}
              >
                {/* ACTIVE INDICATOR */}

                {active && (
                  <span
                    className="
                      absolute
                      left-0
                      top-2.5
                      bottom-2.5

                      w-[3px]

                      rounded-r-full

                      bg-[#A5B4FC]

                      shadow-[0_0_10px_rgba(165,180,252,0.5)]
                    "
                  />
                )}

                {/* ICON */}

                <Icon
                  size={19}
                  strokeWidth={active ? 2.1 : 1.8}
                  className={`
                    shrink-0
                    transition-all duration-200

                    ${
                      active
                        ? "text-white"
                        : `
                          text-[#929ABB]
                          group-hover:text-[#C7D2FE]
                        `
                    }
                  `}
                />

                {/* LABEL */}

                <span
                  className={`
                    flex-1
                    truncate
                    whitespace-nowrap

                    ${
                      collapsed
                        ? "lg:hidden"
                        : ""
                    }
                  `}
                >
                  {item.title}
                </span>

                {/* ACTIVE ARROW */}

                {active && (
                  <ChevronRight
                    size={16}
                    className={`
                      shrink-0
                      text-[#C7D2FE]

                      ${
                        collapsed
                          ? "lg:hidden"
                          : ""
                      }
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
            shrink-0
            pb-4

            ${
              collapsed
                ? "lg:px-2"
                : "px-3.5"
            }
          `}
        >
          {/* WORKSPACE CARD */}

          <div
            className={`
              mb-4

              overflow-hidden
              rounded-2xl

              border border-[#343967]

              bg-gradient-to-br
              from-[#252B60]
              to-[#202550]

              p-3.5

              shadow-lg
              shadow-[#090D2D]/10

              ${
                collapsed
                  ? "lg:hidden"
                  : ""
              }
            `}
          >
            <div
              className="
                mb-3 flex h-9 w-9
                items-center justify-center

                rounded-xl

                bg-indigo-400/15
                text-[#A5B4FC]

                ring-1 ring-indigo-300/10
              "
            >
              <Layers3 size={18} />
            </div>

            <p className="
              text-[12px]
              font-semibold
              text-white
            ">
              Workspace overview
            </p>

            <p className="
              mt-1.5
              text-[11px]
              leading-relaxed
              text-[#A5ACCC]
            ">
              Manage your requests and approval workflows.
            </p>
          </div>

          {/* PROFILE SECTION */}

          <div className="
            border-t border-[#343967]
            pt-3
          ">
            <div
              className={`
                flex items-center gap-3

                rounded-xl
                px-2 py-2.5

                transition-colors duration-200
                hover:bg-white/5

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

                  bg-gradient-to-br
                  from-indigo-400
                  to-indigo-700

                  text-[11px]
                  font-bold
                  text-white

                  ring-2
                  ring-[#414779]
                "
              >
                {initials}
              </div>

              {/* USER DETAILS */}

              <div
                className={`
                  min-w-0 flex-1

                  ${
                    collapsed
                      ? "lg:hidden"
                      : ""
                  }
                `}
              >
                <p className="
                  truncate
                  text-[12px]
                  font-semibold
                  text-white
                ">
                  {user?.name ?? "User"}
                </p>

                <p className="
                  mt-0.5
                  truncate
                  text-[10px]
                  font-medium
                  text-[#A5ACCC]
                ">
                  {user?.username ?? "Account"}
                </p>
              </div>
            </div>

            {/* SIGN OUT */}

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className={`
                group mt-1

                flex w-full
                items-center gap-3

                rounded-xl
                px-3 py-2.5

                text-[12px]
                font-medium

                text-[#A5ACCC]

                transition-all duration-200

                hover:bg-red-500/10
                hover:text-red-400

                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-red-400

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
                  transition-transform duration-200
                  group-hover:-translate-x-0.5
                "
              />

              <span
                className={
                  collapsed
                    ? "lg:hidden"
                    : ""
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