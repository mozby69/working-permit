"use client";

import {
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

const SOUND_ENABLED_KEY = "wp-notification-sound-enabled";
const SOUND_CHANGE_EVENT = "wp-notification-sound-change";
const SOUND_URL = "/sounds/new-request.mp3";

// Shared across all hook instances.
let audioInstance: HTMLAudioElement | null = null;

// ==========================================
// BROWSER SUPPORT
// ==========================================

function isAudioSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.Audio !== "undefined"
  );
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribeToSupport(): () => void {
  return () => {};
}

// ==========================================
// SOUND PREFERENCE
// ==========================================

function getSoundPreference(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(SOUND_ENABLED_KEY) === "true"
    );
  } catch {
    return false;
  }
}

function subscribeToPreference(
  callback: () => void
): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(SOUND_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SOUND_CHANGE_EVENT, callback);
  };
}

function updateSoundPreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(
      SOUND_ENABLED_KEY,
      String(enabled)
    );

    window.dispatchEvent(
      new Event(SOUND_CHANGE_EVENT)
    );
  } catch (error: unknown) {
    logAudioWarning(error);
  }
}

// ==========================================
// AUDIO ERROR HANDLING
// ==========================================

function logAudioWarning(error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.warn("[SOUND] Audio unavailable:", error);
  }
}

// ==========================================
// SHARED AUDIO INSTANCE
// ==========================================

function getAudio(): HTMLAudioElement | null {
  if (!isAudioSupported()) {
    return null;
  }

  if (!audioInstance) {
    audioInstance = new Audio(SOUND_URL);

    audioInstance.preload = "auto";
    audioInstance.volume = 1;
    audioInstance.loop = false;
  }

  return audioInstance;
}

// ==========================================
// PLAY AUDIO
// ==========================================

async function playAudio(): Promise<void> {
  try {
    const audio = getAudio();

    if (!audio) return;

    // Prevent overlapping announcements.
    if (!audio.paused && !audio.ended) {
      return;
    }

    audio.currentTime = 0;

    await audio.play();
  } catch (error: unknown) {
    // Audio failure must never affect Socket.IO
    // or React Query.
    logAudioWarning(error);
  }
}

// ==========================================
// STOP AUDIO
// ==========================================

function stopAudio(): void {
  try {
    if (!audioInstance) return;

    audioInstance.pause();
    audioInstance.currentTime = 0;
  } catch (error: unknown) {
    logAudioWarning(error);
  }
}

// ==========================================
// NOTIFICATION SOUND HOOK
// ==========================================

export function useNotificationSound() {
  const supported = useSyncExternalStore(
    subscribeToSupport,
    isAudioSupported,
    getServerSnapshot
  );

  const enabled = useSyncExternalStore(
    subscribeToPreference,
    getSoundPreference,
    getServerSnapshot
  );

  // Prepare audio before a notification arrives.
  useEffect(() => {
    if (!supported) return;

    try {
      getAudio();
    } catch (error: unknown) {
      logAudioWarning(error);
    }
  }, [supported]);

  // ==========================================
  // PLAY INCOMING NOTIFICATION
  // ==========================================

  const play = useCallback(() => {
    if (!getSoundPreference()) {
      return;
    }

    void playAudio();
  }, []);

  // ==========================================
  // ENABLE SOUND
  // ==========================================

  const enable = useCallback(() => {
    if (!isAudioSupported()) return;

    updateSoundPreference(true);

    // Play directly from user interaction.
    void playAudio();
  }, []);

  // ==========================================
  // DISABLE SOUND
  // ==========================================

  const disable = useCallback(() => {
    updateSoundPreference(false);

    stopAudio();
  }, []);

  // ==========================================
  // TEST SOUND
  // ==========================================

  const testSound = useCallback(() => {
    stopAudio();

    void playAudio();
  }, []);

  return {
    enabled,
    supported,
    enable,
    disable,
    play,
    testSound,
  };
}