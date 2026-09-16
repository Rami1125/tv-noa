/**
 * OneSignal Client Service for Saban Logistics Live Dispatch
 *
 * Integrates OneSignal Web Push notifications (App ID: 327841ea-ec74-457a-a2b5-f43d06e8d661)
 * Dispatches push notifications simultaneously for every voice announcement and order status change.
 */

export const ONESIGNAL_APP_ID = "327841ea-ec74-457a-a2b5-f43d06e8d661";
export const ONESIGNAL_KEY_ID = "mfletgsikea7n7psinqerhzk7";

export interface OneSignalSDKInstance {
  init: (config: Record<string, unknown>) => Promise<void>;
  User?: {
    PushSubscription?: {
      id?: string;
      token?: string;
      optedIn?: boolean;
      addEventListener?: (event: string, callback: (change: unknown) => void) => void;
      optIn?: () => Promise<void>;
    };
  };
  Notifications?: {
    permission?: boolean;
    isPushSupported?: () => boolean;
    requestPermission?: () => Promise<void>;
    addEventListener?: (event: string, callback: (permission: unknown) => void) => void;
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalSDKInstance) => void | Promise<void>>;
    OneSignal?: OneSignalSDKInstance;
  }
}

export type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

export interface OneSignalStatus {
  isSupported: boolean;
  permission: NotificationPermissionState;
  isSubscribed: boolean;
  isInitialized: boolean;
  appId: string;
}

let isInitialized = false;
let currentPermission: NotificationPermissionState = "default";
let isSubscribed = false;
const statusListeners = new Set<(status: OneSignalStatus) => void>();

// Deduplication cache: message -> timestamp
const recentDispatches = new Map<string, number>();

function notifyListeners() {
  const status: OneSignalStatus = {
    isSupported: typeof window !== "undefined" && "Notification" in window,
    permission: currentPermission,
    isSubscribed,
    isInitialized,
    appId: ONESIGNAL_APP_ID,
  };
  statusListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (e) {
      console.warn("[OneSignal] Listener error:", e);
    }
  });
}

export function subscribeOneSignalStatus(listener: (status: OneSignalStatus) => void): () => void {
  statusListeners.add(listener);
  // Emit immediately
  listener({
    isSupported: typeof window !== "undefined" && "Notification" in window,
    permission: currentPermission,
    isSubscribed,
    isInitialized,
    appId: ONESIGNAL_APP_ID,
  });
  return () => {
    statusListeners.delete(listener);
  };
}

/**
 * Initializes OneSignal Web Push SDK
 */
export function initOneSignalClient(): void {
  if (typeof window === "undefined" || isInitialized) {
    return;
  }

  if (!("Notification" in window)) {
    currentPermission = "unsupported";
    notifyListeners();
    return;
  }

  currentPermission = Notification.permission as NotificationPermissionState;

  // Ensure OneSignalDeferred exists
  window.OneSignalDeferred = window.OneSignalDeferred || [];

  // Dynamically inject script if not present
  if (!document.getElementById("onesignal-sdk")) {
    const script = document.createElement("script");
    script.id = "onesignal-sdk";
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
  }

  window.OneSignalDeferred.push(async (OneSignal: OneSignalSDKInstance) => {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: "/OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/" },
        notifyButton: {
          enable: false, // We use custom warehouse UI controls
        },
      });

      isInitialized = true;

      // Update state from OneSignal Notifications
      if (OneSignal.Notifications) {
        currentPermission = (
          OneSignal.Notifications.permission ? "granted" : Notification.permission
        ) as NotificationPermissionState;
        isSubscribed = Boolean(OneSignal.User?.pushSubscription?.optedIn);

        OneSignal.Notifications.addEventListener("permissionChange", (permission: boolean) => {
          currentPermission = permission ? "granted" : "denied";
          notifyListeners();
        });

        if (OneSignal.User?.pushSubscription) {
          OneSignal.User.pushSubscription.addEventListener("change", () => {
            isSubscribed = Boolean(OneSignal.User?.pushSubscription?.optedIn);
            notifyListeners();
          });
        }
      }

      notifyListeners();
      console.log("[OneSignal] Web SDK initialized successfully for App ID:", ONESIGNAL_APP_ID);
    } catch (err) {
      console.warn("[OneSignal] Initialization notice:", err);
      isInitialized = true;
      notifyListeners();
    }
  });
}

/**
 * Explicitly prompt user to allow push notifications
 */
export async function requestOneSignalPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  try {
    if (window.OneSignal?.Notifications) {
      await window.OneSignal.Notifications.requestPermission();
      currentPermission = Notification.permission as NotificationPermissionState;
      isSubscribed = Boolean(window.OneSignal?.User?.pushSubscription?.optedIn);
      notifyListeners();
      return currentPermission === "granted";
    }

    const res = await Notification.requestPermission();
    currentPermission = res as NotificationPermissionState;
    notifyListeners();
    return res === "granted";
  } catch (err) {
    console.warn("[OneSignal] Error requesting permission:", err);
    return false;
  }
}

/**
 * Dispatches a push notification via OneSignal API and native browser notifications
 */
export function triggerOneSignalNotification(
  title: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  if (!title || !message) return;

  // Deduplication check: prevent identical alerts within 3 seconds
  const dedupKey = `${title}::${message}`;
  const now = Date.now();
  const lastTime = recentDispatches.get(dedupKey);
  if (lastTime && now - lastTime < 3000) {
    return;
  }
  recentDispatches.set(dedupKey, now);

  // Clean old deduplication entries
  if (recentDispatches.size > 100) {
    const cutoff = now - 15000;
    recentDispatches.forEach((ts, key) => {
      if (ts < cutoff) recentDispatches.delete(key);
    });
  }

  // 1. Send via Server-Side OneSignal Proxy (Reaches all mobile/external subscribers)
  fetch("/api/notifications/onesignal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      message,
      data: {
        ...data,
        appId: ONESIGNAL_APP_ID,
        timestamp: now,
      },
    }),
  })
    .then((res) => res.json())
    .then((json) => {
      if (!json.success && json.error) {
        // Log info without failing UI
        console.info("[OneSignal] Server dispatch response:", json);
      }
    })
    .catch((err) => {
      console.warn("[OneSignal] Server dispatch non-fatal error:", err);
    });

  // 2. Immediate Native Local Notification (Zero latency for currently active browsers/tablets)
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready
          .then((reg) => {
            reg.showNotification(title, {
              body: message,
              icon: "/icon.svg",
              badge: "/icon.svg",
              tag: (data?.orderId as string) || "saban-dispatch",
              data,
            });
          })
          .catch(() => {
            new Notification(title, {
              body: message,
              icon: "/icon.svg",
              tag: (data?.orderId as string) || "saban-dispatch",
            });
          });
      } else {
        new Notification(title, {
          body: message,
          icon: "/icon.svg",
          tag: (data?.orderId as string) || "saban-dispatch",
        });
      }
    } catch {
      /* ignore native notification constructor errors */
    }
  }

  // 3. Emit custom event for in-app UI reactions
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("saban-notification", {
        detail: { title, message, data, timestamp: now },
      }),
    );
  }
}
