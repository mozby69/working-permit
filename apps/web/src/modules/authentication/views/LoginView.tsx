
import Image from "next/image";
import {
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";

import LoginForm from "../components/LoginForm";

export default function LoginView() {
  return (
    <main className="
      relative flex min-h-screen
      overflow-hidden
      bg-[#F7F8FC]
    ">

      {/* =====================================
          LEFT BRANDING PANEL
      ===================================== */}

      <section className="
        relative hidden
        w-[48%]
        overflow-hidden
        bg-gradient-to-br
        from-[#171B4B]
        via-[#20265F]
        to-[#312E81]
        p-10
        lg:flex lg:flex-col
        lg:justify-between
        xl:p-14
      ">

        {/* BACKGROUND DECORATIONS */}

        <div className="
          pointer-events-none absolute
          -left-40 -top-40
          h-[500px] w-[500px]
          rounded-full
          bg-indigo-500/20
          blur-[100px]
        " />

        <div className="
          pointer-events-none absolute
          -bottom-40 -right-40
          h-[550px] w-[550px]
          rounded-full
          bg-violet-500/20
          blur-[110px]
        " />

        <div className="
          pointer-events-none absolute
          right-16 top-1/3
          h-72 w-72
          rounded-full
          border border-white/[0.07]
        " />

        <div className="
          pointer-events-none absolute
          right-24 top-[37%]
          h-56 w-56
          rounded-full
          border border-white/[0.07]
        " />

        {/* BRAND LOGO */}

        <div className="relative z-10">

       

        </div>

        {/* MAIN BRANDING CONTENT */}

        <div className="
          relative z-10
          my-16
          max-w-xl
          login-fade-up
        ">

          <div className="
            mb-6 inline-flex
            items-center gap-2
            rounded-full
            border border-indigo-300/20
            bg-indigo-400/10
            px-4 py-2
          ">
            <span className="
              h-2 w-2
              rounded-full
              bg-indigo-300
              shadow-[0_0_10px_rgba(165,180,252,0.8)]
            " />

            <span className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-indigo-200
            ">
              Internal Management Portal
            </span>
          </div>

          <h1 className="
            text-4xl
            font-bold
            leading-[1.2]
            tracking-tight
            text-white
            xl:text-5xl
          ">
            Working Permit
            <span className="
              block
              bg-gradient-to-r
              from-indigo-300
              to-violet-300
              bg-clip-text
              text-transparent
            ">
              Management System
            </span>
          </h1>

          <p className="
            mt-6
            max-w-md
            text-[15px]
            leading-7
            text-indigo-100/70
          ">
            A centralized workspace for managing
            working permit requests, monitoring
            approvals, and organizing internal
            workflows.
          </p>

          {/* FEATURE ITEMS */}

          <div className="mt-10 space-y-5">

            <div className="flex items-center gap-4">

              <div className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl
                border border-white/10
                bg-white/[0.07]
                text-indigo-200
              ">
                <FileCheck2 size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Request Management
                </p>
                <p className="mt-1 text-xs text-indigo-200/60">
                  Organize and monitor permit requests.
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4">

              <div className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl
                border border-white/10
                bg-white/[0.07]
                text-indigo-200
              ">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Approval Workflow
                </p>
                <p className="mt-1 text-xs text-indigo-200/60">
                  Track request reviews and approvals.
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* FOOTER */}

        <div className="
          relative z-10
          flex items-center justify-between
          border-t border-white/10
          pt-6
        ">
          <p className="text-[11px] text-indigo-200/50">
            © {new Date().getFullYear()} Jamero Group of Companies
          </p>

          <div className="
            flex items-center gap-2
            text-[11px]
            text-indigo-200/60
          ">
            <LockKeyhole size={13} />
            Internal Access
          </div>
        </div>

      </section>

      {/* =====================================
          RIGHT LOGIN SECTION
      ===================================== */}

      <section className="
        relative flex
        min-h-screen
        w-full
        flex-1
        items-center
        justify-center
        overflow-hidden
        bg-[#F7F8FC]
        px-5 py-10
        sm:px-10
        lg:px-12
        xl:px-20
      ">

        {/* MOBILE BACKGROUND GLOW */}

        <div className="
          pointer-events-none absolute
          -right-32 -top-32
          h-80 w-80
          rounded-full
          bg-indigo-200/40
          blur-[100px]
          lg:hidden
        " />

        <div className="
          pointer-events-none absolute
          -bottom-32 -left-32
          h-80 w-80
          rounded-full
          bg-violet-200/30
          blur-[100px]
          lg:hidden
        " />

        <div className="
          relative z-10
          w-full max-w-[420px]
          login-fade-up
        ">

          {/* MOBILE BRANDING */}

          <div className="
            mb-10 flex
            flex-col items-center
            lg:hidden
          ">
            <div className="
              rounded-2xl
              border border-indigo-100
              bg-white
              px-5 py-3
              shadow-sm
            ">
              <Image
                src="/jgc-logo-indigo.svg"
                alt="Jamero Group of Companies"
                width={230}
                height={73}
                priority
                className="h-auto w-[210px]"
              />
            </div>

            <p className="
              mt-4
              text-xs
              font-medium
              tracking-wide
              text-slate-500
            ">
              Working Permit Management System
            </p>
          </div>

          {/* LOGIN HEADING */}

          <div className="mb-9">

            <div className="
              mb-6 flex h-12 w-12
              items-center justify-center
              rounded-2xl
              bg-indigo-100
              text-indigo-700
              ring-1 ring-indigo-200/70
            ">
              <LockKeyhole size={23} />
            </div>

            <p className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-indigo-600
            ">
              Welcome Back
            </p>

            <h2 className="
              mt-2
              text-3xl
              font-bold
              tracking-tight
              text-[#171B35]
              sm:text-[34px]
            ">
              Sign in to your account
            </h2>

            <p className="
              mt-3
              text-sm
              leading-6
              text-slate-500
            ">
              Enter your credentials to access the
              Working Permit portal.
            </p>

          </div>

          {/* LOGIN FORM */}

          <div className="
            rounded-2xl
            border border-[#E5E7F2]
            bg-white
            p-6
            shadow-[0_12px_40px_rgba(23,27,75,0.06)]
            sm:p-8
          ">
            <LoginForm />
          </div>

          {/* FOOTER */}

          <div className="
            mt-8
            flex flex-col
            items-center
            gap-3
            text-center
          ">
            <div className="
              flex items-center gap-2
              text-xs
              text-slate-400
            ">
              <LockKeyhole size={13} />
              Secure authentication
            </div>

            <p className="
              text-[11px]
              text-slate-400
            ">
              © {new Date().getFullYear()} Jamero Group of Companies.
              All rights reserved.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}
