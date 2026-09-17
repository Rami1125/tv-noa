import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { DispatchProvider, useDispatchBoard } from "@/context/DispatchContext";
import { AdminControlProvider } from "@/context/AdminControlContext";
import { TVHeader } from "@/components/tv/TVHeader";
import { UrgentDeliveriesTicker } from "@/components/tv/UrgentDeliveriesTicker";
import { NoaAIBanner } from "@/components/tv/NoaAIBanner";
import { OrderCard } from "@/components/tv/OrderCard";
import { LoadingFocusModal } from "@/components/tv/LoadingFocusModal";
import { DeliveredOrdersPanel } from "@/components/tv/DeliveredOrdersPanel";
import { OrderArchiveModal } from "@/components/tv/OrderArchiveModal";
import { NoaFlashOverlay } from "@/components/tv/NoaFlashOverlay";
import { StudioDrawer } from "@/components/studio/StudioDrawer";
import { DispatchScreensaver } from "@/components/screensaver/DispatchScreensaver";
import { PickerView } from "@/components/mobile/PickerView";
import { TrafficLiveDashboard } from "@/components/traffic/TrafficLiveDashboard";
import { splitOrdersForBoard } from "@/services/dispatchArchiveService";
import type { Order } from "@/types/dispatch";

/** Detects mobile or touch-only devices (no fine pointer / narrow viewport). */
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const hasFinePointer = window.matchMedia?.("(pointer: fine)").matches ?? true;
  const isNarrow = window.innerWidth < 768;
  return isNarrow || (isTouch && !hasFinePointer);
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ח. סבן · לוח סידור והפצה חי" },
      {
        name: "description",
        content:
          "לוח שידור חי להזמנות, העמסות ונהגים של ח. סבן, עם התראות נועה AI וסטודיו ניהול למשרד.",
      },
      { property: "og:title", content: "ח. סבן · לוח סידור והפצה חי" },
      {
        property: "og:description",
        content: "מסך הפצה חי להקרנה בטלוויזיות המחסן, כולל פוקוס העמסה והתראות נועה AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DispatchPage,
});

function RoundSection({ round, orders }: { round: number; orders: Order[] }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black text-foreground">סבב {round}</h2>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-bold text-muted-foreground">
          {orders.length} הזמנות
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {orders.map((o, i) => (
            <OrderCard key={o.orderId} order={o} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function LiveBoard() {
  const {
    published,
    focusOrder,
    isVoiceAnnounceEnabled,
    setVoiceAnnounceEnabled,
    isVoiceSpeaking,
    stopSpeakingVoice,
  } = useDispatchBoard();

  const [viewMode, setViewMode] = useState<"tv" | "picker">("tv");
  const [isTrafficOpen, setIsTrafficOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get("mode");
      const pickerParam = urlParams.get("picker");
      const trafficParam = urlParams.get("traffic");
      if (trafficParam === "1" || trafficParam === "true" || modeParam === "traffic") {
        setIsTrafficOpen(true);
      }
      if (modeParam === "picker" || pickerParam === "oren" || pickerParam === "tamir") {
        setViewMode("picker");
        return;
      }
      if (modeParam === "tv") {
        setViewMode("tv");
        return;
      }

      const saved = localStorage.getItem("saban_view_mode");
      if (saved === "picker" || saved === "tv") {
        setViewMode(saved);
        return;
      }

      if (isMobileDevice()) {
        setViewMode("picker");
      }
    }
  }, []);

  const handleSetViewMode = (mode: "tv" | "picker") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("saban_view_mode", mode);
    }
  };

  // Split published orders into 12h active board vs older archived orders
  const { activeInProgressOrders, recentDeliveredOrders, archivedOrders, totalArchivedCount } =
    useMemo(() => {
      return splitOrdersForBoard(published);
    }, [published]);

  // Derive active rounds from in-progress orders
  const rounds = useMemo(() => {
    const map = new Map<number, Order[]>();
    [...activeInProgressOrders]
      .sort((a, b) => a.targetTime.localeCompare(b.targetTime))
      .forEach((o) => {
        const arr = map.get(o.round) ?? [];
        arr.push(o);
        map.set(o.round, arr);
      });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [activeInProgressOrders]);

  if (viewMode === "picker") {
    // ── Hermetic mobile boundary ──────────────────────────────────
    // Mobile/picker renders ONLY PickerView — no screensaver, no studio
    // drawer, no flash overlays, no traffic modals, no TV boards.
    return (
      <div dir="rtl" className="min-h-screen bg-slate-950">
        <PickerView onSwitchToTv={() => handleSetViewMode("tv")} />
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex min-h-screen w-screen flex-col gap-2.5 bg-background p-3">
      <UrgentDeliveriesTicker />
      <TVHeader
        onSwitchToPicker={() => handleSetViewMode("picker")}
        onOpenTraffic={() => setIsTrafficOpen(true)}
        onOpenArchive={() => setIsArchiveOpen(true)}
        totalArchivedCount={totalArchivedCount}
      />
      <NoaAIBanner />

      {/* Main Board Grid: Right side = Active Rounds, Left side = Delivered Orders & Loading Focus */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[1.3fr_420px] 2xl:grid-cols-[1.4fr_460px]">
        {/* Right side (Column 1 in RTL): Active Dispatch Rounds */}
        <div className="min-h-0 space-y-4 overflow-y-auto pl-1">
          {rounds.map(([round, orders]) => (
            <RoundSection key={round} round={round} orders={orders} />
          ))}
          {rounds.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              <p className="text-base font-bold">אין כרגע הזמנות פתוחות בהעמסה בסבבים</p>
              <p className="text-xs mt-1">
                הזמנות שסופקו מוצגות ברשימה משמאל (12 שעות אחרונות) או בארכיון.
              </p>
            </div>
          )}
        </div>

        {/* Left side (Column 2 in RTL): Empty space filled with Delivered Orders & Loading Modal */}
        <div className="flex min-h-0 flex-col gap-3">
          {focusOrder && (
            <div className="shrink-0 min-h-0">
              <LoadingFocusModal order={focusOrder} />
            </div>
          )}
          <div className="min-h-0 flex-1">
            <DeliveredOrdersPanel
              recentDeliveredOrders={recentDeliveredOrders}
              totalArchivedCount={totalArchivedCount}
              onOpenArchive={() => setIsArchiveOpen(true)}
              isVoiceAnnounceEnabled={isVoiceAnnounceEnabled}
              onToggleVoice={() => {
                if (isVoiceAnnounceEnabled) {
                  stopSpeakingVoice();
                  setVoiceAnnounceEnabled(false);
                } else {
                  setVoiceAnnounceEnabled(true);
                }
              }}
              isVoiceSpeaking={isVoiceSpeaking}
            />
          </div>
        </div>
      </div>

      {/* On-demand Archive Modal */}
      <OrderArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        archivedOrders={archivedOrders}
        allDeliveredAndCancelled={published.filter(
          (o) => o.status === "סופק" || (o.status as string) === "בוטל",
        )}
      />

      {/* Traffic Live Modal for TV */}
      <AnimatePresence>
        {isTrafficOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
              <TrafficLiveDashboard onClose={() => setIsTrafficOpen(false)} isModal />
            </div>
          </div>
        )}
      </AnimatePresence>

      <StudioDrawer />
      <NoaFlashOverlay />
      <DispatchScreensaver />
    </div>
  );
}

function DispatchPage() {
  return (
    <DispatchProvider>
      <AdminControlProvider>
        <LiveBoard />
      </AdminControlProvider>
    </DispatchProvider>
  );
}
