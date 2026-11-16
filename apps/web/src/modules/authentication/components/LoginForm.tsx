
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowRight,
} from "lucide-react";

import {
  loginSchema,
  type LoginSchema,
} from "@repo/shared";

import { useLogin } from "../hooks/useLogin";
import SweetAlert from "@/lib/alerts/alert";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    mutateAsync: login,
    isPending,
  } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginSchema) {
    try {
      await login(data);

      SweetAlert.successAlert(
        "Success",
        "Login successful"
      );
    } catch (error) {
      SweetAlert.errorAlert(
        "Error",
        "Invalid credentials"
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >

      {/* =====================================
          USERNAME
      ===================================== */}

      <div className="space-y-2">

        <label
          htmlFor="username"
          className="
            block
            text-[13px]
            font-semibold
            text-[#303653]
          "
        >
          Username
        </label>

        <div className="relative">

          <div className="
            pointer-events-none
            absolute inset-y-0 left-0
            flex items-center
            pl-3.5
            text-slate-400
          ">
            <UserRound size={18} />
          </div>

          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            disabled={isPending}
            aria-invalid={!!errors.username}
            aria-describedby={
              errors.username
                ? "username-error"
                : undefined
            }
            {...register("username")}
            className={`
              h-12
              w-full
              rounded-xl
              border
              bg-white
              pl-11 pr-4
              text-sm
              text-[#171B35]
              placeholder:text-slate-400

              outline-none
              transition-all duration-200

              disabled:cursor-not-allowed
              disabled:bg-slate-50
              disabled:opacity-70

              ${
                errors.username
                  ? `
                    border-red-300
                    focus:border-red-500
                    focus:ring-4
                    focus:ring-red-100
                  `
                  : `
                    border-[#E0E3EF]
                    hover:border-indigo-300
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  `
              }
            `}
          />

        </div>

        {errors.username && (
          <p
            id="username-error"
            role="alert"
            className="text-xs font-medium text-red-600"
          >
            {errors.username.message}
          </p>
        )}

      </div>

      {/* =====================================
          PASSWORD
      ===================================== */}

      <div className="space-y-2">

        <label
          htmlFor="password"
          className="
            block
            text-[13px]
            font-semibold
            text-[#303653]
          "
        >
          Password
        </label>

        <div className="relative">

          <div className="
            pointer-events-none
            absolute inset-y-0 left-0
            flex items-center
            pl-3.5
            text-slate-400
          ">
            <LockKeyhole size={18} />
          </div>

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={isPending}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password
                ? "password-error"
                : undefined
            }
            {...register("password")}
            className={`
              h-12
              w-full
              rounded-xl
              border
              bg-white

              pl-11 pr-12

              text-sm
              text-[#171B35]
              placeholder:text-slate-400

              outline-none
              transition-all duration-200

              disabled:cursor-not-allowed
              disabled:bg-slate-50
              disabled:opacity-70

              ${
                errors.password
                  ? `
                    border-red-300
                    focus:border-red-500
                    focus:ring-4
                    focus:ring-red-100
                  `
                  : `
                    border-[#E0E3EF]
                    hover:border-indigo-300
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-100
                  `
              }
            `}
          />

          {/* SHOW / HIDE PASSWORD */}

          <button
            type="button"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            disabled={isPending}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={showPassword}
            className="
              absolute inset-y-0 right-0
              flex items-center
              px-4

              text-slate-400

              transition-colors
              hover:text-indigo-600

              disabled:cursor-not-allowed
            "
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>

        </div>

        {errors.password && (
          <p
            id="password-error"
            role="alert"
            className="text-xs font-medium text-red-600"
          >
            {errors.password.message}
          </p>
        )}

      </div>

      {/* =====================================
          SIGN IN BUTTON
      ===================================== */}

      <button
        type="submit"
        disabled={isPending}
        className="
          group relative
          flex h-12 w-full
          items-center justify-center
          gap-2

          overflow-hidden
          rounded-xl

          bg-gradient-to-r
          from-[#4F46E5]
          to-[#3730A3]

          text-sm
          font-semibold
          text-white

          shadow-lg
          shadow-indigo-500/20

          transition-all duration-200

          hover:-translate-y-0.5
          hover:from-[#4338CA]
          hover:to-[#312E81]
          hover:shadow-xl
          hover:shadow-indigo-500/25

          active:translate-y-0

          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-indigo-200

          disabled:cursor-not-allowed
          disabled:opacity-70
          disabled:hover:translate-y-0
        "
      >

        {isPending ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
            />

            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign in to your account</span>

            <ArrowRight
              size={17}
              className="
                transition-transform duration-200
                group-hover:translate-x-1
              "
            />
          </>
        )}

      </button>

      {/* SECURITY NOTE */}

      <div className="
        flex items-center
        justify-center gap-2
        pt-1
      ">
        <LockKeyhole
          size={13}
          className="text-indigo-400"
        />

        <p className="
          text-[11px]
          text-slate-400
        ">
          Your account is protected by secure authentication.
        </p>
      </div>

    </form>
  );
}
