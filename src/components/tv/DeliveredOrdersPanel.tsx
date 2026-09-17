import { useState, useMemo } from "react";
import {
  Archive,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  Package,
  Search,
  Truck,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Order } from "@/types/dispatch";
import { formatOrderDisplayTime } from "@/services/dispatchArchiveService";
import { cn } from "@/lib/utils";

interface DeliveredOrdersPanelProps {
  recentDeliveredOrders: Order[];
  totalArchivedCount: number;
  onOpenArchive: () => void;
  onSelectOrder?: (order: Order) => void;
  isVoiceAnnounceEnabled: boolean;
  onToggleVoice: () => void;
  isVoiceSpeaking?: boolean;
}

export function DeliveredOrdersPanel({
  recentDeliveredOrders,
  totalArchivedCount,
  onOpenArchive,
  onSelectOrder,
  isVoiceAnnounceEnabled,
  onToggleVoice,
  isVoiceSpeaking = false,
}: DeliveredOrdersPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return recentDeliveredOrders;
    return recentDeliveredOrders.filter((o) => {
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.driver && o.driver.toLowerCase().includes(q)) ||
        (o.city && o.city.toLowerCase().includes(q))
      );
    });
  }, [recentDeliveredOrders, searchTerm]);

  return (
    <div
      dir="rtl"
      className="flex h-full min-h-[500px] flex-col rounded-2xl border border-border/80 bg-card/85 shadow-md backdrop-blur-md overflow-hidden"
    >
      {/* Panel Top Header */}
      <div className="border-b border-border/80 bg-muted/40 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Title & 12h badge */}
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
                <span>הזמנות שסופקו</span>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 px-2 py-0.5 text-xs font-bold tabular-nums">
                  {recentDeliveredOrders.length}
                </span>
              </h2>
              <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                <span>12 שעות אחרונות</span>
              </p>
            </div>
          </div>

          {/* Controls: Voice Mute & Archive */}
          <div className="flex items-center gap-1.5">
            {/* Dedicated Voice Mute Button */}
            <button
              type="button"
              onClick={onToggleVoice}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-black transition-all shadow-sm ring-1",
                isVoiceAnnounceEnabled
                  ? "bg-purple-600 text-white ring-purple-500 hover:bg-purple-700"
                  : "bg-rose-500/15 text-rose-500 ring-rose-500/30 hover:bg-rose-500/25",
              )}
              title={
                isVoiceAnnounceEnabled
                  ? "חיווי קולי פעיל · לחץ להשתקה מלאה של הקריינות"
                  : "חיווי קולי מושתק · לחץ להפעלת הקריינות"
              }
            >
              {isVoiceAnnounceEnabled ? (
                <>
                  <Volume2 className={cn("size-3.5", isVoiceSpeaking && "animate-bounce")} />
                  <span className="hidden sm:inline">קול פעיל</span>
                </>
              ) : (
                <>
                  <VolumeX className="size-3.5" />
                  <span className="hidden sm:inline">קול מושתק</span>
                </>
              )}
            </button>

            {/* Archive Button */}
            <button
              type="button"
              onClick={onOpenArchive}
              className="flex items-center gap-1 rounded-xl bg-secondary/80 px-2.5 py-1.5 text-xs font-bold text-foreground ring-1 ring-border hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
              title="פתח ארכיון הזמנות היסטורי (מעל 12 שעות)"
            >
              <Archive className="size-3.5" />
              <span>ארכיון</span>
              {totalArchivedCount > 0 && (
                <span className="rounded-full bg-muted-foreground/20 px-1.5 py-0.2 text-[10px] font-mono">
                  {totalArchivedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש לקוח / מספר / נהג..."
            className="w-full rounded-lg border border-border/80 bg-background/80 pr-8 pl-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Vertical Writing-Line List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <CheckCircle2 className="size-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-bold">אין הזמנות שסופקו ב-12 השעות האחרונות</p>
            <p className="text-[11px] opacity-75 mt-1">
              הזמנות שיסופקו יופיעו כאן מיידית. הזמנות ישנות מועברות לארכיון.
            </p>
            {totalArchivedCount > 0 && (
              <button
                type="button"
                onClick={onOpenArchive}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition"
              >
                <Archive className="size-3.5" />
                <span>צפה ב-{totalArchivedCount} הזמנות בארכיון</span>
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order, idx) => {
            const isExpanded = expandedOrderId === order.orderId;
            const timeStr = formatOrderDisplayTime(order);

            return (
              <div
                key={order.orderId}
                className={cn(
                  "group px-3.5 py-2.5 transition-colors hover:bg-muted/50 cursor-pointer",
                  isExpanded && "bg-muted/40",
                  idx % 2 === 1 && "bg-background/30",
                )}
                onClick={() => {
                  setExpandedOrderId(isExpanded ? null : order.orderId);
                  if (onSelectOrder) onSelectOrder(order);
                }}
              >
                {/* Single Writing Line: Customer Name / Order # / Driver Name */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                    {/* Checkmark icon */}
                    <span className="text-emerald-600 shrink-0">
                      <CheckCircle2 className="size-3.5" />
                    </span>

                    {/* Customer Name */}
                    <span className="font-black text-foreground hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-[200px]">
                      {order.customerName}
                    </span>

                    {/* Slash separator */}
                    <span className="text-muted-foreground/70 font-black">/</span>

                    {/* Order Number */}
                    <span className="font-mono font-bold text-primary shrink-0 tabular-nums">
                      #{order.orderId}
                    </span>

                    {/* Slash separator */}
                    <span className="text-muted-foreground/70 font-black">/</span>

                    {/* Driver Name */}
                    <span className="text-muted-foreground font-semibold truncate flex items-center gap-1 max-w-[140px]">
                      <Truck className="size-3 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{order.driver || "איסוף עצמי"}</span>
                    </span>
                  </div>

                  {/* Delivery / Completion Time */}
                  <div className="shrink-0 flex items-center gap-1 font-mono text-[11px] font-bold text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded">
                    <span>{timeStr}</span>
                  </div>
                </div>

                {/* Inline Quick Detail Accordion */}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-foreground">
                      <span>
                        כתובת: {order.address || "ללא כתובת"}, {order.city}
                      </span>
                      {order.logisticsMetrics?.estimatedWeightKg ? (
                        <span className="font-bold tabular-nums">
                          {order.logisticsMetrics.estimatedWeightKg} ק״ג
                        </span>
                      ) : null}
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="rounded bg-background/80 p-2 border border-border/40">
                        <p className="font-bold text-foreground mb-1 flex items-center gap-1">
                          <Package className="size-3" />
                          פריטים ({order.items.length}):
                        </p>
                        <div className="space-y-0.5 max-h-24 overflow-y-auto">
                          {order.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-[10px]">
                              <span>{it.name}</span>
                              <span className="font-bold tabular-nums">
                                {it.quantity} {it.unit || "יח'"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.deliveryNote && order.deliveryNote !== "⏳ טרם הופקה" && (
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        תעודת משלוח: {order.deliveryNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer link to Archive */}
      <div className="border-t border-border/80 bg-muted/30 p-2.5 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-muted-foreground">
          סינון אוטומטי: 12 שעות אחרונות
        </span>
        <button
          type="button"
          onClick={onOpenArchive}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>ארכיון מלא</span>
          <Archive className="size-3" />
        </button>
      </div>
    </div>
  );
}
