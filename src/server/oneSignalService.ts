/**
 * OneSignal Server-Side Notification Service
 * Sends push notifications to subscribed devices across warehouse screens and mobile devices.
 */

export interface OneSignalPushPayload {
  title: string;
  message: string;
  data?: Record<string, unknown>;
  url?: string;
}

export interface OneSignalPushResponse {
  success: boolean;
  id?: string;
  recipients?: number;
  error?: string;
  errors?: string[];
}

const DEFAULT_APP_ID = "327841ea-ec74-457a-a2b5-f43d06e8d661";
const DEFAULT_KEY_ID = "mfletgsikea7n7psinqerhzk7";

export async function sendOneSignalPushNotification(
  payload: OneSignalPushPayload,
): Promise<OneSignalPushResponse> {
  const appId = process.env.ONESIGNAL_APP_ID || DEFAULT_APP_ID;
  const rawKey =
    process.env.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_KEY_ID || DEFAULT_KEY_ID;

  const authKey = rawKey.trim();

  // Try sending to OneSignal REST API
  try {
    const requestBody = {
      app_id: appId,
      included_segments: ["Total Subscriptions"],
      headings: {
        he: payload.title,
        en: payload.title,
      },
      contents: {
        he: payload.message,
        en: payload.message,
      },
      data: {
        ...payload.data,
        timestamp: Date.now(),
        source: "saban_dispatch_system",
      },
      url: payload.url || "/",
    };

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Key ${authKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      data = { raw: responseText };
    }

    if (response.ok && data.id) {
      console.log(
        `[OneSignal] Notification dispatched successfully: id=${String(data.id)}, recipients=${Number(data.recipients ?? 0)}`,
      );
      return {
        success: true,
        id: String(data.id),
        recipients: Number(data.recipients ?? 0),
      };
    }

    // In case Authorization: Key returned an error, test with Basic header as fallback
    if (response.status === 403 || response.status === 401) {
      const retryRes = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${authKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      const retryText = await retryRes.text();
      let retryData: Record<string, unknown> = {};
      try {
        retryData = JSON.parse(retryText) as Record<string, unknown>;
      } catch {
        retryData = { raw: retryText };
      }

      if (retryRes.ok && retryData.id) {
        return {
          success: true,
          id: String(retryData.id),
          recipients: Number(retryData.recipients ?? 0),
        };
      }
    }

    console.warn("[OneSignal] Push notification warning:", data.errors || responseText);
    return {
      success: false,
      error: Array.isArray(data.errors) ? data.errors.join(", ") : responseText,
      errors: data.errors,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[OneSignal] Network failure sending notification:", message);
    return {
      success: false,
      error: message,
    };
  }
}
