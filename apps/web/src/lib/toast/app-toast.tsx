"use client";

import toast from "react-hot-toast";

import {
    toastIcons,
    toastStyles,
} from "./toast-icons";

import type {
    ToastType,
    ToastOptions,
} from "./toast.types";

const renderToast = (
    message: string,
    type: ToastType
) => {
    const Icon = toastIcons[type];

    return (
        <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${toastStyles[type]}`}
        >
            <Icon size={18} className="shrink-0" />

            <span className="flex-1 text-sm">
                {message}
            </span>
        </div>
    );
};

const AppToast = {
    success(message: string, options?: ToastOptions) {
        return toast.custom(
            () => renderToast(message, "success"),
            {
                duration: options?.duration ?? 4000,
            }
        );
    },

    error(message: string, options?: ToastOptions) {
        return toast.custom(
            () => renderToast(message, "error"),
            {
                duration: options?.duration ?? 4000,
            }
        );
    },

    warning(message: string, options?: ToastOptions) {
        return toast.custom(
            () => renderToast(message, "warning"),
            {
                duration: options?.duration ?? 4000,
            }
        );
    },

    info(message: string, options?: ToastOptions) {
        return toast.custom(
            () => renderToast(message, "info"),
            {
                duration: options?.duration ?? 4000,
            }
        );
    },

    dismiss(id?: string) {
        toast.dismiss(id);
    },
};

export default AppToast;