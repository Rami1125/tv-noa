import { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Tv,
} from "lucide-react";
import type { StoreProduct, LobbySignageSettings } from "@/types/storeProduct";
import {
  getStoreProducts,
  getLobbySettings,
  SEED_STORE_PRODUCTS,
} from "@/services/storeProductService";
import { AdaptiveProductSlide } from "@/components/lobby/AdaptiveProductSlide";
import { useDispatchBoard } from "@/context/DispatchContext";
import { OrderCard } from "@/components/tv/OrderCard";
import { cn } from "@/lib/utils";

interface LobbySignageOrchestratorProps {
  initialProducts?: StoreProduct[];
  isStandalone?: boolean;
  onOpenSettings?: () => void;
}

export function LobbySignageOrchestrator({
  initialProducts,
  isStandalone = false,
  onOpenSettings,
}: LobbySignageOrchestratorProps) {
  const [products, setProducts] = useState<StoreProduct[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : SEED_STORE_PRODUCTS,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settings, setSettings] = useState<LobbySignageSettings>(getLobbySettings());

  // Connection to Dispatch Context
  const dispatchContext = useDispatchBoard();
  const { published = [], latestOrderEvent, recentlyChangedOrderIds } = dispatchContext;

  // Interruption State: when active, shows dispatch board overlay
  const [isDispatchInterruptActive, setIsDispatchInterruptActive] = useState(false);
  const [interruptSecondsRemaining, setInterruptSecondsRemaining] = useState(0);
  const lastEventKeyRef = useRef<string>("");

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interruptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load products from service if not provided
  useEffect(() => {
    let isMounted = true;
    if (initialProducts && initialProducts.length > 0) return;
    async function load() {
      try {
        const list = await getStoreProducts(false);
        if (isMounted && list && list.length > 0) {
          const active = list.filter((p) => p.isActive);
          if (active.length > 0) {
            setProducts(active);
          }
        }
      } catch (err) {
        console.warn("[LobbySignageOrchestrator] Error loading products:", err);
      }
    }
    void load();
    return () => {
      isMounted = false;
    };
  }, [initialProducts]);

  // Filter active products
  const activeProducts = useMemo(() => {
    const active = products.filter((p) => p.isActive);
    return active.length > 0 ? active : SEED_STORE_PRODUCTS;
  }, [products]);

  const currentProduct =
    activeProducts[currentIndex] || activeProducts[0] || SEED_STORE_PRODUCTS[0];

  // Helper to check if an order ID was recently changed
  const isOrderRecentlyChanged = (orderId: string): boolean => {
    if (!recentlyChangedOrderIds || !orderId) return false;
    if (Array.isArray(recentlyChangedOrderIds)) {
      return recentlyChangedOrderIds.includes(orderId);
    }
    return Boolean((recentlyChangedOrderIds as Record<string, number>)[orderId]);
  };

  // ★ LISTEN FOR LIVE DISPATCH ORDER CHANGES & INTERRUPT LOBBY SHOWCASE ★
  useEffect(() => {
    if (!settings.enableDispatchInterrupt) return;

    const changedCount = Array.isArray(recentlyChangedOrderIds)
      ? recentlyChangedOrderIds.length
      : Object.keys(recentlyChangedOrderIds || {}).length;

    // Do not interrupt on initial mount or when no events exist
    if (!latestOrderEvent && changedCount === 0) return;

    const eventId = latestOrderEvent?.orderId || "";
    const eventType = latestOrderEvent?.type || "";
    const currentKey = `${eventId}_${eventType}_${changedCount}`;
    if (!currentKey || currentKey === lastEventKeyRef.current) return;
    lastEventKeyRef.current = currentKey;

    // Trigger immediate interruption for configured duration
    setIsDispatchInterruptActive(true);
    const duration = settings.dispatchInterruptSeconds || 60;
    setInterruptSecondsRemaining(duration);

    if (interruptTimerRef.current) clearInterval(interruptTimerRef.current);
    interruptTimerRef.current = setInterval(() => {
      setInterruptSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (interruptTimerRef.current) clearInterval(interruptTimerRef.current);
          setIsDispatchInterruptActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (interruptTimerRef.current) clearInterval(interruptTimerRef.current);
    };
  }, [
    latestOrderEvent,
    recentlyChangedOrderIds,
    settings.enableDispatchInterrupt,
    settings.dispatchInterruptSeconds,
  ]);

  // ★ AUTO-ADVANCE SLIDES (PRODUCT -> VIDEO -> NEXT PRODUCT) ★
  useEffect(() => {
    if (isPaused || isDispatchInterruptActive || !currentProduct) return;

    const slideDuration =
      (currentProduct.displayDuration || settings.slideDurationSeconds || 12) * 1000;

    // If current product has media and we haven't played it yet, switch to video first
    if (!isPlayingVideo && currentProduct.mediaUrl && settings.enableMediaPlayback) {
      slideTimerRef.current = setTimeout(() => {
        setIsPlayingVideo(true);
      }, slideDuration);
    } else {
      // Advance to next product
      const dwell = isPlayingVideo ? (settings.videoDurationSeconds || 30) * 1000 : slideDuration;

      slideTimerRef.current = setTimeout(() => {
        setIsPlayingVideo(false);
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, activeProducts.length));
      }, dwell);
    }

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [
    currentIndex,
    isPlayingVideo,
    isPaused,
    isDispatchInterruptActive,
    currentProduct,
    activeProducts.length,
    settings,
  ]);

  // Hide floating controls after 4 seconds of idle
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  };

  const handleNext = () => {
    setIsPlayingVideo(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, activeProducts.length));
  };

  const handlePrev = () => {
    setIsPlayingVideo(false);
    setCurrentIndex(
      (prev) => (prev - 1 + activeProducts.length) % Math.max(1, activeProducts.length),
    );
  };

  const handleToggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => null);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => null);
      setIsFullscreen(false);
    }
  };

  if (!currentProduct) {
    return (
      <div className="flex size-full items-center justify-center bg-[#FDFBF7] p-8 text-center">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
          <Tv className="mx-auto size-12 text-slate-400 mb-3" />
          <h2 className="text-xl font-black text-slate-900">טוען שילוט לובי סבן...</h2>
          <p className="mt-1 text-xs text-slate-500">מתחבר לגיליון חנות ולנתוני המוצרים</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "relative flex size-full select-none overflow-hidden bg-[#FDFBF7]",
        isStandalone && "fixed inset-0 z-50",
      )}
    >
      {/* 1. LOBBY PRODUCT SLIDE (BASE LAYER) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentProduct.sku}_${isPlayingVideo ? "video" : "slide"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="size-full"
        >
          <AdaptiveProductSlide
            product={currentProduct}
            isPlayingVideo={isPlayingVideo}
            onVideoEnd={() => {
              setIsPlayingVideo(false);
              handleNext();
            }}
            showQrCode={settings.showQrCode}
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. LIVE DISPATCH BOARD INTERRUPTION OVERLAY (TRIGGERS ON NEW ORDERS / STATUS CHANGES) */}
      <AnimatePresence>
        {isDispatchInterruptActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-40 flex flex-col bg-slate-950/95 p-4 text-white backdrop-blur-xl"
            dir="rtl"
          >
            {/* Urgent Interruption Banner */}
            <header className="flex items-center justify-between rounded-2xl border border-amber-500/50 bg-amber-500/15 px-6 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-amber-500 animate-ping" />
                <span className="text-sm font-black text-amber-300">
                  שידור פעילות חיה · עודכנה הזמנה בלוח השיבוץ
                </span>
                {latestOrderEvent && (
                  <span className="rounded-lg bg-amber-400/20 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-200">
                    הזמנה #{latestOrderEvent.orderId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-amber-300">
                  חזרה לשילוט החנות בעוד:{" "}
                  <strong className="font-mono text-base font-black text-white">
                    {interruptSecondsRemaining}
                  </strong>{" "}
                  שניות
                </span>
                <button
                  onClick={() => setIsDispatchInterruptActive(false)}
                  className="rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  חזור לשילוט עכשיו
                </button>
              </div>
            </header>

            {/* Active Live Orders Grid */}
            <main className="mt-4 flex-1 overflow-y-auto space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {published.slice(0, 9).map((order, idx) => (
                  <div
                    key={order.orderId}
                    className={cn(
                      isOrderRecentlyChanged(order.orderId) &&
                        "ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 rounded-2xl animate-pulse",
                    )}
                  >
                    <OrderCard order={order} index={idx} />
                  </div>
                ))}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SUBTLE FLOATING CONTROLS (FADES OUT WHEN IDLE) */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-8 z-30 flex items-center gap-2 rounded-2xl border border-stone-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md"
            dir="rtl"
          >
            {/* Prev */}
            <button
              onClick={handlePrev}
              className="rounded-xl p-2 text-slate-700 transition hover:bg-stone-100 active:scale-95"
              title="מוצר קודם"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Pause / Play */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="rounded-xl p-2 text-slate-700 transition hover:bg-stone-100 active:scale-95"
              title={isPaused ? "המשך סבב" : "השהה סבב"}
            >
              {isPaused ? (
                <Play className="size-4 text-emerald-600" />
              ) : (
                <Pause className="size-4" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNext}
              className="rounded-xl p-2 text-slate-700 transition hover:bg-stone-100 active:scale-95"
              title="מוצר הבא"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="h-4 w-px bg-stone-200" />

            {/* Slide Indicator */}
            <span className="px-2 font-mono text-xs font-bold text-slate-600">
              {currentIndex + 1} / {activeProducts.length}
            </span>

            <div className="h-4 w-px bg-stone-200" />

            {/* Settings */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="rounded-xl p-2 text-slate-700 transition hover:bg-stone-100 active:scale-95"
                title="הגדרות שילוט לובי"
              >
                <Settings className="size-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={handleToggleFullscreen}
              className="rounded-xl p-2 text-slate-700 transition hover:bg-stone-100 active:scale-95"
              title="מסך מלא"
            >
              {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
