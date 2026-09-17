import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  BellRing,
  Cloud,
  CloudOff,
  Compass,
  Monitor,
  Radio,
  RefreshCw,
  Settings2,
  Smartphone,
  Truck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useDispatchBoard } from "@/context/DispatchContext";
import { cn } from "@/lib/utils";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex min-w-[5.5rem] flex-col items-center rounded-xl bg-card/70 px-4 py-2 ring-1 ring-border/70">
      <span className={cn("text-3xl font-black leading-none tabular-nums", tone)}>{value}</span>
      <span className="mt-1 text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export function TVHeader({
  onSwitchToPicker,
  onOpenTraffic,
  onOpenArchive,
  totalArchivedCount = 0,
}: {
  onSwitchToPicker?: () => void;
  onOpenTraffic?: () => void;
  onOpenArchive?: () => void;
  totalArchivedCount?: number;
}) {
  const {
    counts,
    published,
    syncStatus,
    lastSyncAt,
    sourceMode,
    openStudio,
    setScreensaverActive,
    nearestOrderMinutesRemaining,
    isVoiceAnnounceEnabled,
    toggleVoiceAnnounce,
    isVoiceSpeaking,
    triggerVoiceTest,
    oneSignalStatus,
    requestNotificationPermission,
    sendPushAlert,
  } = useDispatchBoard();
  const now = useClock();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const time = now
    ? now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const date = now
    ? now.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <header className="flex items-center justify-between gap-6 rounded-2xl border border-border/80 bg-card/80 px-6 py-4 shadow-md backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={openStudio}
          aria-label="פתיחת סטודיו ניהול"
          className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Truck className="size-8" />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">ח. סבן</h1>
          <p className="text-sm font-semibold text-muted-foreground">
            לוח סידור והפצה חי · Noa AI Live Dispatch
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Metric label="ממתין" value={counts["ממתין"]} tone="text-slate-600" />
        {counts["בהכנה"] > 0 && (
          <Metric label="בליקוט" value={counts["בהכנה"]} tone="text-amber-500" />
        )}
        <Metric label="בהעמסה" value={counts["בהעמסה"]} tone="text-accent" />
        <Metric label="בדרך" value={counts["יצא לדרך"]} tone="text-primary" />
        <Metric label="סופק" value={counts["סופק"]} tone="text-emerald-600" />
        <Metric label="סה״כ" value={published.length} tone="text-foreground" />
      </div>

      <div className="flex items-center gap-4">
        {/* Switch to Picker View Button */}
        {onSwitchToPicker && (
          <button
            onClick={onSwitchToPicker}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-600/20 border border-amber-500/30 px-3.5 py-2 text-xs font-black text-amber-300 hover:text-white hover:border-amber-400 transition-all shadow-sm"
            title="מעבר לממשק ליקוט מחסן PWA (אורן / תמיר)"
          >
            <Smartphone className="size-4 text-amber-400" />
            <span>מסוף ליקוט PWA</span>
          </button>
        )}

        {/* Unified Audio & Voice Speaker Button (כפתור רמקול וחיווי קולי מסונכרן) */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/60 p-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleVoiceAnnounce();
            }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-black transition cursor-pointer select-none relative z-20 active:scale-95 shadow-sm",
              isVoiceSpeaking
                ? "bg-fuchsia-500/25 text-fuchsia-300 ring-1 ring-fuchsia-400 animate-pulse"
                : isVoiceAnnounceEnabled
                  ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/25",
            )}
            title={
              isVoiceAnnounceEnabled
                ? "רמקול וחיווי קולי פעילים · לחץ להשתקה מלאה של צלילים ודיבור"
                : "רמקול מושתק · לחץ להפעלת רמקול וצלילים"
            }
          >
            {isVoiceAnnounceEnabled ? (
              <Volume2
                className={cn(
                  "size-4 text-emerald-400",
                  isVoiceSpeaking && "animate-bounce text-fuchsia-400",
                )}
              />
            ) : (
              <VolumeX className="size-4 text-rose-400" />
            )}
            <span className="inline font-bold">
              {isVoiceSpeaking
                ? "נועה מדווחת..."
                : isVoiceAnnounceEnabled
                  ? "רמקול פעיל"
                  : "רמקול מושתק"}
            </span>
          </button>
          {isVoiceAnnounceEnabled && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void triggerVoiceTest();
              }}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-500/20 hover:text-white cursor-pointer active:scale-95 shrink-0"
              title="בדיקת שמע ורמקול בעברית"
            >
              בדיקה
            </button>
          )}
        </div>

        {/* OneSignal Push Notifications */}
        <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-background/60 p-1 shrink-0">
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (oneSignalStatus.permission !== "granted") {
                await requestNotificationPermission();
              } else {
                sendPushAlert(
                  "בדיקת התראה · OneSignal",
                  "התראות OneSignal פעילות ומסונכרנות עם קול ושינויי סטטוס!",
                  { type: "test" },
                );
              }
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-black transition cursor-pointer select-none active:scale-95",
              oneSignalStatus.permission === "granted"
                ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/40 hover:bg-amber-500/25"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60",
            )}
            title={
              oneSignalStatus.permission === "granted"
                ? "התראות OneSignal פעילות ומסונכרנות עם קול ושינויי סטטוס (לחץ לבדיקה)"
                : "הפעל התראות דחיפה OneSignal"
            }
          >
            <BellRing
              className={cn(
                "size-3.5",
                oneSignalStatus.permission === "granted"
                  ? "text-amber-400"
                  : "text-muted-foreground",
              )}
            />
            <span className="hidden xl:inline">
              {oneSignalStatus.permission === "granted" ? "OneSignal פעיל" : "הפעל OneSignal"}
            </span>
          </button>
        </div>

        {/* Screensaver fast switch */}
        <button
          onClick={() => setScreensaverActive(true)}
          className="flex items-center gap-2 rounded-xl bg-secondary/80 px-3 py-2 text-xs font-bold text-foreground ring-1 ring-border transition hover:bg-primary hover:text-primary-foreground"
          title={
            isMounted && nearestOrderMinutesRemaining !== null && nearestOrderMinutesRemaining < 900
              ? `הפעל שומר מסך (הזמנה קרובה: ${nearestOrderMinutesRemaining} דק')`
              : "הפעל שומר מסך"
          }
        >
          <Monitor className="size-4" />
          <span>שומר מסך</span>
          {isMounted &&
            nearestOrderMinutesRemaining !== null &&
            nearestOrderMinutesRemaining >= 45 && (
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
        </button>

        {/* On-demand Archive Modal Button */}
        {onOpenArchive && (
          <button
            type="button"
            onClick={onOpenArchive}
            className="flex items-center gap-2 rounded-xl bg-secondary/80 px-3 py-2 text-xs font-bold text-foreground ring-1 ring-border transition hover:bg-primary hover:text-primary-foreground shadow-sm"
            title="פתח ארכיון הזמנות שסופקו ובוטלו (מעל 12 שעות)"
          >
            <Archive className="size-4 text-amber-500" />
            <span>ארכיון</span>
            {totalArchivedCount > 0 && (
              <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {totalArchivedCount}
              </span>
            )}
          </button>
        )}

        {/* Live Traffic & Waze Map Button */}
        {onOpenTraffic && (
          <button
            type="button"
            onClick={onOpenTraffic}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-950 to-slate-900 hover:from-sky-900 hover:to-slate-800 border border-sky-500/40 px-3 py-2 text-xs font-bold text-sky-200 transition-all shadow-sm group"
            title="פתח מפת פקקים חיה, שידורי Waze ומעקב משאיות סבן"
          >
            <Compass className="size-4 text-sky-400 group-hover:rotate-45 transition-transform" />
            <span>פקקים & Waze</span>
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}

        {/* Admin Control Plane Link */}
        <a
          href="/admin"
          className="flex items-center gap-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-600/50 px-3 py-2 text-xs font-bold text-sky-200 transition-all shadow-sm"
          title="מרכז שליטה ובקרה למנהל מערכת (SabanOS Control Plane)"
        >
          <span className="size-2 rounded-full bg-sky-400 animate-pulse" />
          <span>בקרה מרכזית</span>
        </a>

        <div
          style={{ paddingLeft: "2px", paddingRight: "-7px" }}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-inset",
            syncStatus === "error"
              ? "bg-destructive/10 text-destructive ring-destructive/30"
              : syncStatus === "syncing"
                ? "bg-accent/15 text-accent ring-accent/30"
                : "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25",
          )}
        >
          {syncStatus === "error" ? (
            <CloudOff className="size-4" />
          ) : syncStatus === "syncing" ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <Cloud className="size-4" />
          )}
          <span>{sourceMode === "sheets" ? "סנכרון גיליון" : "נתוני הדגמה"}</span>
          {lastSyncAt && (
            <span className="tabular-nums opacity-70">
              {new Date(lastSyncAt).toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <motion.div
          key={time}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="text-left"
        >
          <div className="text-4xl font-black tabular-nums leading-none text-foreground">
            {time}
          </div>
          <div className="mt-1 text-xs font-medium text-muted-foreground">{date}</div>
        </motion.div>

        <button
          onClick={openStudio}
          aria-label="סטודיו"
          className="grid size-10 place-items-center rounded-xl text-muted-foreground/50 transition hover:bg-secondary hover:text-foreground"
        >
          <Settings2 className="size-5" />
        </button>
      </div>
    </header>
  );
}
