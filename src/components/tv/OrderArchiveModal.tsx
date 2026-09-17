import { useState, useMemo } from "react";
import {
  Archive,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import type { Order } from "@/types/dispatch";
import { formatOrderDisplayTime, parseOrderTimestamp } from "@/services/dispatchArchiveService";
import { cn } from "@/lib/utils";

interface OrderArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedOrders: Order[];
  allDeliveredAndCancelled?: Order[];
  onSelectOrder?: (order: Order) => void;
}

export function OrderArchiveModal({
  isOpen,
  onClose,
  archivedOrders,
  allDeliveredAndCancelled = [],
  onSelectOrder,
}: OrderArchiveModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "סופק" | "בוטל">("all");
  const [viewScope, setViewScope] = useState<"archived_12h" | "all_history">("archived_12h");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const baseList = useMemo(() => {
    if (viewScope === "all_history" && allDeliveredAndCancelled.length > 0) {
      return allDeliveredAndCancelled;
    }
    return archivedOrders;
  }, [viewScope, archivedOrders, allDeliveredAndCancelled]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return baseList.filter((o) => {
      // Status filter
      if (statusFilter !== "all" && o.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (!q) return true;
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.driver && o.driver.toLowerCase().includes(q)) ||
        (o.city && o.city.toLowerCase().includes(q)) ||
        (o.address && o.address.toLowerCase().includes(q))
      );
    });
  }, [baseList, searchTerm, statusFilter]);

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <Archive className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">ארכיון הזמנות שסופקו ובוטלו</h2>
              <p className="text-xs font-semibold text-muted-foreground">
                הזמנות שחלפו מעל 12 שעות מסיומן או בוטלו · נפתחות לפי דרישה בלבד
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition"
            title="סגור ארכיון"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/50 px-6 py-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש לפי לקוח, מספר הזמנה, שם נהג, עיר..."
              className="w-full rounded-xl border border-border bg-background pr-9 pl-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Scope Toggle */}
            <div className="flex rounded-xl bg-muted/60 p-1 border border-border/50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewScope("archived_12h")}
                className={cn(
                  "rounded-lg px-3 py-1.5 transition",
                  viewScope === "archived_12h"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ארכיון 12+ שעות ({archivedOrders.length})
              </button>
              {allDeliveredAndCancelled.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewScope("all_history")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 transition",
                    viewScope === "all_history"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  כל ההיסטוריה ({allDeliveredAndCancelled.length})
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex rounded-xl bg-muted/60 p-1 border border-border/50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 transition",
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                הכל
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("סופק")}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 transition",
                  statusFilter === "סופק"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-emerald-500",
                )}
              >
                סופק
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("בוטל")}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 transition",
                  statusFilter === "בוטל"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-rose-500",
                )}
              >
                בוטל
              </button>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Archive className="size-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-bold text-foreground">אין הזמנות בארכיון</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                הזמנות שסופקו או בוטלו מועברות לכאן אוטומטית 12 שעות לאחר סיומן.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isDelivered = order.status === "סופק";
              const isExpanded = expandedOrderId === order.orderId;
              const formattedTime = formatOrderDisplayTime(order);
              const orderDate = order.updatedAt
                ? new Date(parseOrderTimestamp(order)).toLocaleDateString("he-IL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "";

              return (
                <div
                  key={order.orderId}
                  className="rounded-xl border border-border/80 bg-card/90 p-4 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Writing line format: Customer / Order # / Driver */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold",
                          isDelivered
                            ? "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30"
                            : "bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/30",
                        )}
                      >
                        {isDelivered ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <XCircle className="size-3.5" />
                        )}
                        <span>{order.status}</span>
                      </span>

                      <span className="font-black text-foreground text-sm truncate max-w-xs">
                        {order.customerName}
                      </span>
                      <span className="text-muted-foreground font-bold">/</span>
                      <span className="font-mono font-bold text-primary text-sm">
                        #{order.orderId}
                      </span>
                      <span className="text-muted-foreground font-bold">/</span>
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Truck className="size-3.5 text-muted-foreground" />
                        {order.driver || "לא שובץ נהג"}
                      </span>
                    </div>

                    {/* Meta pill & expand button */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span>{formattedTime}</span>
                        {orderDate && <span className="opacity-75">({orderDate})</span>}
                      </div>

                      <button
                        onClick={() => {
                          setExpandedOrderId(isExpanded ? null : order.orderId);
                          if (onSelectOrder) onSelectOrder(order);
                        }}
                        className="rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition"
                      >
                        {isExpanded ? "סגור פירוט" : "פירוט פריטים"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Item Details */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3.5 border-t border-border/70 space-y-2.5 text-xs">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-primary" />
                          <span>
                            {order.address}, {order.city}
                          </span>
                        </div>
                        {order.logisticsMetrics && (
                          <div className="flex items-center gap-3">
                            <span>בלות: {order.logisticsMetrics.bellaBags}</span>
                            <span>משטחים: {order.logisticsMetrics.sabanPallets}</span>
                            <span>משקל: {order.logisticsMetrics.estimatedWeightKg} ק״ג</span>
                          </div>
                        )}
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="rounded-lg bg-muted/40 p-2.5 border border-border/50">
                          <p className="font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                            <Package className="size-3.5" />
                            פריטי ההזמנה ({order.items.length}):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {order.items.map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-0.5 px-1.5 rounded bg-background/60"
                              >
                                <span className="font-medium text-foreground">{it.name}</span>
                                <span className="font-bold tabular-nums text-muted-foreground">
                                  {it.quantity} {it.unit || "יח'"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.note && (
                        <p className="text-muted-foreground italic">הערה: {order.note}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/80 bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
          <span>
            מוצגות {filteredOrders.length} מתוך {baseList.length} הזמנות בארכיון
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            חזרה ללוח סידור
          </button>
        </div>
      </div>
    </div>
  );
}
