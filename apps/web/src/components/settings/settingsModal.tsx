"use client";

import { useEffect, useRef } from "react";

import {
  Settings,
  X,
  Volume2,
  VolumeX,
  BellRing,
  Play,
  Info,
  AudioLines,
} from "lucide-react";

import { useNotificationSound } from
  "@/modules/notification/hooks/useNotificationSound";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
}: SettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    enabled,
    supported,
    enable,
    disable,
    testSound,
  } = useNotificationSound();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleToggleSound = () => {
    if (enabled) {
      disable();
    } else {
      enable();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="
        fixed inset-0 m-auto
        w-[calc(100%-2rem)] max-w-lg
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white p-0 shadow-2xl
        backdrop:bg-black/60

      "
    >
      <div>
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Settings size={22} />
            </div>

            <div>
              <h2
                id="settings-title"
                className="text-lg font-bold text-slate-900"
              >
                Settings
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Manage your application preferences.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-6 px-6 py-6">
          {/* SECTION TITLE */}
          <div className="flex items-center gap-2">
            <BellRing
              size={15}
              className="text-indigo-600"
            />

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Notification Preferences
            </h3>
          </div>

          {/* SOUND SETTING */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  enabled
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {enabled ? (
                  <Volume2 size={21} />
                ) : (
                  <VolumeX size={21} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-slate-800">
                  Request notification sound
                </h4>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Play a voice announcement when
                  you receive a new working permit
                  request.
                </p>
              </div>

              {/* TOGGLE SWITCH */}
              <button
                type="button"
                role="switch"
                aria-label="Request notification sound"
                aria-checked={enabled}
                disabled={!supported}
                onClick={handleToggleSound}
                className={`
                  relative inline-flex h-6 w-11 shrink-0
                  items-center rounded-full
                  transition-colors duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-indigo-500
                  focus-visible:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  ${
                    enabled
                      ? "bg-indigo-600"
                      : "bg-slate-300"
                  }
                `}
              >
                <span
                  className={`
                    inline-block h-5 w-5
                    rounded-full bg-white shadow-sm
                    transition-transform duration-200
                    ${
                      enabled
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }
                  `}
                />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  enabled
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              <span
                className={`text-xs font-medium ${
                  enabled
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}
              >
                {enabled
                  ? "Sound is enabled"
                  : "Sound is disabled"}
              </span>
            </div>
          </div>

          {/* TEST SOUND */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <AudioLines
                size={17}
                className="text-indigo-600"
              />

              <h4 className="text-sm font-semibold text-slate-800">
                Voice Announcement
              </h4>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              &quot;You have a new request.&quot;
            </p>

            <button
              type="button"
              onClick={testSound}
              disabled={!supported}
              className="
                mt-4 inline-flex items-center gap-2
                rounded-lg border border-indigo-200
                bg-white px-3.5 py-2
                text-xs font-semibold text-indigo-600
                transition hover:bg-indigo-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Play size={14} />
              Test Sound
            </button>
          </div>

          {/* INFORMATION */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <Info
              size={17}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-relaxed text-blue-700">
              {supported
                ? "Sound preferences are saved in this browser. Keep the application open and interact with the page after loading to receive voice notifications."
                : "Your current browser does not support voice announcements."}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <span className="text-xs text-slate-400">
            Preferences are saved automatically.
          </span>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg bg-indigo-600
              px-5 py-2.5
              text-sm font-semibold text-white
              transition hover:bg-indigo-700
            "
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
}