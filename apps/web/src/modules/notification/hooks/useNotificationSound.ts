
// "use client";

// import {
//   useCallback,
//   useEffect,
//   useSyncExternalStore,
// } from "react";

// const SOUND_ENABLED_KEY =
//   "wp-notification-sound-enabled";

// const SOUND_CHANGE_EVENT =
//   "wp-notification-sound-change";

// const SOUND_URL = "/sounds/new-request.mp3";

// type SoundState = {
//   enabled: boolean;
//   blocked: boolean;
//   needsActivation: boolean;
// };

// let audioInstance: HTMLAudioElement | null = null;
// let activated = false;
// let blocked = false;
// let playInProgress = false;
// let activationInProgress = false;

// const listeners = new Set<() => void>();

// function supported(): boolean {
//   return (
//     typeof window !== "undefined" &&
//     typeof window.Audio !== "undefined"
//   );
// }

// function getPreference(): boolean {
//   if (typeof window === "undefined") return false;

//   try {
//     return (
//       localStorage.getItem(SOUND_ENABLED_KEY) === "true"
//     );
//   } catch {
//     return false;
//   }
// }

// function getState(): SoundState {
//   const enabled = getPreference();

//   return {
//     enabled,
//     blocked: enabled && blocked,
//     needsActivation: enabled && !activated,
//   };
// }

// let snapshot: SoundState = {
//   enabled: false,
//   blocked: false,
//   needsActivation: false,
// };

// const serverSnapshot: SoundState = {
//   enabled: false,
//   blocked: false,
//   needsActivation: false,
// };

// function notify(): void {
//   const next = getState();

//   if (
//     snapshot.enabled === next.enabled &&
//     snapshot.blocked === next.blocked &&
//     snapshot.needsActivation === next.needsActivation
//   ) {
//     return;
//   }

//   snapshot = next;
//   listeners.forEach((listener) => listener());
// }

// function subscribe(listener: () => void) {
//   listeners.add(listener);
//   window.addEventListener("storage", notify);
//   window.addEventListener(SOUND_CHANGE_EVENT, notify);

//   return () => {
//     listeners.delete(listener);
//     window.removeEventListener("storage", notify);
//     window.removeEventListener(
//       SOUND_CHANGE_EVENT,
//       notify
//     );
//   };
// }

// function getSnapshot(): SoundState {
//   // Initialize the stable client snapshot.
//   if (listeners.size === 0) {
//     const next = getState();

//     if (
//       snapshot.enabled !== next.enabled ||
//       snapshot.blocked !== next.blocked ||
//       snapshot.needsActivation !== next.needsActivation
//     ) {
//       snapshot = next;
//     }
//   }

//   return snapshot;
// }

// function getServerSnapshot(): SoundState {
//   return serverSnapshot;
// }

// function setPreference(value: boolean) {
//   try {
//     localStorage.setItem(
//       SOUND_ENABLED_KEY,
//       String(value)
//     );
//   } catch (error) {
//     console.warn("[SOUND] Preference save failed", error);
//   }

//   notify();
// }

// function getAudio(): HTMLAudioElement | null {
//   if (!supported()) return null;

//   if (!audioInstance) {
//     audioInstance = new Audio(SOUND_URL);
//     audioInstance.preload = "auto";
//     audioInstance.volume = 1;
//     audioInstance.loop = false;
//   }

//   return audioInstance;
// }

// function reportError(error: unknown): void {
//   if (
//     error instanceof DOMException &&
//     error.name === "NotAllowedError"
//   ) {
//     activated = false;
//     blocked = true;
//     notify();

//     console.warn(
//       "[SOUND] Browser blocked autoplay."
//     );
//     return;
//   }

//   console.error("[SOUND] Playback failed:", error);
// }

// async function activateAudio(): Promise<void> {
//   if (!supported() || !getPreference()) return;
//   if (activationInProgress || activated) return;

//   const audio = getAudio();
//   if (!audio) return;

//   activationInProgress = true;

//   try {
//     // This must be initiated by a user interaction.
//     audio.muted = true;
//     audio.currentTime = 0;

//     await audio.play();

//     audio.pause();
//     audio.currentTime = 0;

//     activated = true;
//     blocked = false;
//   } catch (error) {
//     reportError(error);
//   } finally {
//     audio.muted = false;
//     activationInProgress = false;
//     notify();
//   }
// }

// async function playAudio(): Promise<void> {
//   if (!getPreference()) return;
//   if (playInProgress || activationInProgress) return;

//   const audio = getAudio();
//   if (!audio) return;

//   playInProgress = true;

//   try {
//     // Restart the announcement for the newest request.
//     audio.pause();
//     audio.currentTime = 0;
//     audio.muted = false;

//     await audio.play();

//     activated = true;
//     blocked = false;
//     notify();
//   } catch (error) {
//     reportError(error);
//   } finally {
//     playInProgress = false;
//   }
// }

// function stopAudio() {
//   if (!audioInstance) return;

//   audioInstance.pause();
//   audioInstance.currentTime = 0;
// }

// export function useNotificationSound() {
//   const state = useSyncExternalStore(
//     subscribe,
//     getSnapshot,
//     getServerSnapshot
//   );

//   const isSupported = useSyncExternalStore(
//     () => () => {},
//     supported,
//     () => false
//   );

//   useEffect(() => {
//     if (!isSupported || !state.enabled) return;

//     getAudio();

//     const activate = () => {
//       void activateAudio();
//     };

//     window.addEventListener("pointerdown", activate);
//     window.addEventListener("keydown", activate);

//     return () => {
//       window.removeEventListener(
//         "pointerdown",
//         activate
//       );
//       window.removeEventListener(
//         "keydown",
//         activate
//       );
//     };
//   }, [isSupported, state.enabled]);

//   const enable = useCallback(() => {
//     if (!supported()) return;

//     setPreference(true);

//     // Called from the settings button's click handler.
//     void playAudio();
//   }, []);

//   const disable = useCallback(() => {
//     stopAudio();

//     activated = false;
//     blocked = false;

//     setPreference(false);
//   }, []);

//   const play = useCallback(() => {
//     void playAudio();
//   }, []);

//   const testSound = useCallback(() => {
//     const audio = getAudio();
//     if (!audio) return;

//     audio.pause();
//     audio.currentTime = 0;
//     audio.muted = false;

//     void audio.play().then(
//       () => {
//         activated = true;
//         blocked = false;
//         notify();
//       },
//       reportError
//     );
//   }, []);

//   return {
//     enabled: state.enabled,
//     supported: isSupported,
//     blocked: state.blocked,
//     needsActivation: state.needsActivation,
//     enable,
//     disable,
//     play,
//     testSound,
//   };
// }































"use client";

import {
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

const SOUND_ENABLED_KEY = "wp-notification-sound-enabled";
const SOUND_CHANGE_EVENT = "wp-notification-sound-change";
const SOUND_URL = "/sounds/new-request.mp3";


let audioInstance: HTMLAudioElement | null = null;



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



function logAudioWarning(error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.warn("[SOUND] Audio unavailable:", error);
  }
}



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

    logAudioWarning(error);
  }
}



function stopAudio(): void {
  try {
    if (!audioInstance) return;

    audioInstance.pause();
    audioInstance.currentTime = 0;
  } catch (error: unknown) {
    logAudioWarning(error);
  }
}



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


  useEffect(() => {
    if (!supported) return;

    try {
      getAudio();
    } catch (error: unknown) {
      logAudioWarning(error);
    }
  }, [supported]);



  const play = useCallback(() => {
    if (!getSoundPreference()) {
      return;
    }

    void playAudio();
  }, []);



  const enable = useCallback(() => {
    if (!isAudioSupported()) return;

    updateSoundPreference(true);


    void playAudio();
  }, []);



  const disable = useCallback(() => {
    updateSoundPreference(false);

    stopAudio();
  }, []);



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