/**
 * H. Saban Logistics - Dispatch Archive & 12-Hour Active Window Service
 *
 * Rules:
 * - Delivered ("סופק") and Cancelled ("בוטל") orders are only displayed on the active board for 12 hours.
 * - After 12 hours, they are omitted from the active board and sent to the archive.
 * - The archive is accessible on-demand ("יפתח לפי דרישה").
 */

import type { Order, OrderStatusOverrides } from "@/types/dispatch";

export const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

/**
 * Parses the timestamp of an order into epoch milliseconds.
 * Supports ISO strings, DD/MM/YYYY HH:mm, and overrides.
 */
export function parseOrderTimestamp(order: Order, overrideTimestamp?: number): number {
  if (overrideTimestamp && !isNaN(overrideTimestamp) && overrideTimestamp > 0) {
    return overrideTimestamp;
  }

  if (order.updatedAt) {
    const raw = order.updatedAt.trim();

    // 1. Try standard Date parse (ISO or YYYY-MM-DD)
    const directParse = Date.parse(raw);
    if (!isNaN(directParse) && directParse > 0) {
      return directParse;
    }

    // 2. Try DD/MM/YYYY HH:mm or DD/MM/YYYY
    const dmyMatch = raw.match(
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
    );
    if (dmyMatch) {
      const [, day, month, year, hours, minutes, seconds] = dmyMatch;
      const d = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        hours ? parseInt(hours, 10) : 12,
        minutes ? parseInt(minutes, 10) : 0,
        seconds ? parseInt(seconds, 10) : 0,
      );
      if (!isNaN(d.getTime())) {
        return d.getTime();
      }
    }
  }

  // 3. If targetTime is available (e.g. "11:00"), synthesize time for today
  if (order.targetTime && /^\d{1,2}:\d{2}$/.test(order.targetTime.trim())) {
    const [h, m] = order.targetTime
      .trim()
      .split(":")
      .map((v) => parseInt(v, 10));
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    return d.getTime();
  }

  return Date.now();
}

/**
 * Checks if an order's status event occurred within the last 12 hours.
 */
export function isOrderWithinLast12Hours(order: Order, overrideTimestamp?: number): boolean {
  const ts = parseOrderTimestamp(order, overrideTimestamp);
  const now = Date.now();
  const diff = now - ts;
  // If timestamp is in the future or within the last 12 hours
  return diff <= TWELVE_HOURS_MS;
}

export interface SplitOrdersResult {
  /** Active in-progress orders (ממתין, בהכנה, מוכן להעמסה, בהעמסה, יצא לדרך) */
  activeInProgressOrders: Order[];
  /** Orders with status "סופק" completed within the last 12 hours */
  recentDeliveredOrders: Order[];
  /** Orders with status "בוטל" within the last 12 hours */
  recentCancelledOrders: Order[];
  /** Orders in "סופק" or "בוטל" that are older than 12 hours (sent to archive) */
  archivedOrders: Order[];
  /** Total count of orders in archive */
  totalArchivedCount: number;
}

/**
 * Splits a list of published orders into active rounds, 12h delivered, and archived orders.
 */
export function splitOrdersForBoard(
  orders: Order[],
  overrides?: OrderStatusOverrides,
): SplitOrdersResult {
  const activeInProgressOrders: Order[] = [];
  const recentDeliveredOrders: Order[] = [];
  const recentCancelledOrders: Order[] = [];
  const archivedOrders: Order[] = [];

  for (const order of orders) {
    const overrideTs = overrides?.[order.orderId]?.timestamp;
    const isCompletedOrCancelled =
      order.status === "סופק" ||
      (order.status as string) === "בוטל" ||
      (order.status as string) === "מבוטל";

    if (!isCompletedOrCancelled) {
      activeInProgressOrders.push(order);
      continue;
    }

    const within12h = isOrderWithinLast12Hours(order, overrideTs);

    if (within12h) {
      if (order.status === "סופק") {
        recentDeliveredOrders.push(order);
      } else {
        recentCancelledOrders.push(order);
      }
    } else {
      archivedOrders.push(order);
    }
  }

  // Sort recent delivered by newest timestamp first
  recentDeliveredOrders.sort((a, b) => {
    const tsA = parseOrderTimestamp(a, overrides?.[a.orderId]?.timestamp);
    const tsB = parseOrderTimestamp(b, overrides?.[b.orderId]?.timestamp);
    return tsB - tsA;
  });

  // Sort archived by newest timestamp first
  archivedOrders.sort((a, b) => {
    const tsA = parseOrderTimestamp(a, overrides?.[a.orderId]?.timestamp);
    const tsB = parseOrderTimestamp(b, overrides?.[b.orderId]?.timestamp);
    return tsB - tsA;
  });

  return {
    activeInProgressOrders,
    recentDeliveredOrders,
    recentCancelledOrders,
    archivedOrders,
    totalArchivedCount: archivedOrders.length,
  };
}

/**
 * Formats order completion/target time into readable "HH:mm"
 */
export function formatOrderDisplayTime(order: Order, overrideTimestamp?: number): string {
  if (overrideTimestamp) {
    return new Date(overrideTimestamp).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (order.updatedAt) {
    const ts = parseOrderTimestamp(order);
    if (!isNaN(ts)) {
      return new Date(ts).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return order.targetTime || "--:--";
}
