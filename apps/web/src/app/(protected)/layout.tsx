
"use client";

import type { ReactNode } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/Sidebar-Content";

// ==========================================
// PROTECTED LAYOUT CONTENT
// ==========================================

function ProtectedLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const { collapsed } = useSidebar();

  return (
    <div
      className="
        flex h-dvh w-full
        overflow-hidden
        bg-[#F8FAFC]
        text-[#0F172A]
      "
    >
      {/* ====================================
          FIXED SIDEBAR
      ==================================== */}

      <Sidebar />

      {/* ====================================
          MAIN WORKSPACE
      ==================================== */}

      <div
        className={`
          flex h-full min-w-0 flex-1 flex-col
          ml-0
          transition-[margin-left]
          duration-300 ease-in-out

          ${
            collapsed
              ? "lg:ml-[72px]"
              : "lg:ml-[224px]"
          }
        `}
      >
        {/* ==================================
            FIXED HEADER
        ================================== */}

        <Header />

        {/* ==================================
            SCROLLABLE CONTENT
        ================================== */}

        <main
          id="main-content"
          className="
            relative
            min-h-0 flex-1
            overflow-x-hidden
            overflow-y-auto
            overscroll-y-contain
            bg-[#F8FAFC]
            scroll-smooth
          "
        >
          <div
            className="
              mx-auto
              w-full max-w-[1600px]
              px-4 py-6
              sm:px-6
              lg:px-8 lg:py-8
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ==========================================
// PROTECTED LAYOUT
// ==========================================

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProtectedLayoutContent>
        {children}
      </ProtectedLayoutContent>
    </SidebarProvider>
  );
}
