import {
  BellRing,
  CheckCircle2,
  Database,
  MonitorPlay,
  RefreshCw,
  RotateCcw,
  Send,
  Sheet,
} from "lucide-react";
import { useDispatchBoard } from "@/context/DispatchContext";
import { ONESIGNAL_APP_ID, ONESIGNAL_KEY_ID } from "@/services/oneSignalService";
import { cn } from "@/lib/utils";

export function BroadcastControl() {
  const {
    publish,
    discardDraft,
    isDirty,
    sourceMode,
    setSourceMode,
    sheetUrl,
    setSheetUrl,
    pollingSeconds,
    setPollingSeconds,
    syncNow,
    syncStatus,
    syncError,
    lastSyncAt,
    oneSignalStatus,
    requestNotificationPermission,
    sendPushAlert,
  } = useDispatchBoard();

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-base font-black text-foreground">
        <MonitorPlay className="size-4 text-primary" /> שליטת שידור
      </h3>

      <div className="flex gap-2">
        <button
          onClick={publish}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-black transition",
            isDirty
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-muted-foreground",
          )}
        >
          <MonitorPlay className="size-5" />
          שדר לטלוויזיה
        </button>
        <button
          onClick={discardDraft}
          className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-3 text-sm font-bold text-muted-foreground transition hover:text-foreground"
        >
          <RotateCcw className="size-4" /> בטל
        </button>
      </div>
      <p className="text-xs font-semibold text-muted-foreground">
        {isDirty ? "יש שינויים בטיוטה שטרם שודרו למסך" : "המסך החי מסונכרן עם הטיוטה"}
      </p>

      <div className="space-y-2 rounded-xl border border-border/80 bg-card p-3">
        <div className="text-sm font-black text-foreground">מקור נתונים</div>
        <div className="flex gap-1">
          <button
            onClick={() => setSourceMode("mock")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition",
              sourceMode === "mock"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            <Database className="size-4" /> נתוני הדגמה
          </button>
          <button
            onClick={() => setSourceMode("sheets")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition",
              sourceMode === "sheets"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            <Sheet className="size-4" /> גיליון חי
          </button>
        </div>

        {sourceMode === "sheets" && (
          <div className="space-y-2">
            <input
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="קישור לגיליון דשבורד_הזמנות"
              dir="ltr"
              className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary"
            />
            <label className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              תדירות משיכה (שניות)
              <input
                type="number"
                min={30}
                max={600}
                value={pollingSeconds}
                onChange={(e) => setPollingSeconds(Number(e.target.value) || 45)}
                className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-center text-sm font-black tabular-nums text-foreground outline-none focus:border-primary"
              />
            </label>
          </div>
        )}

        <button
          onClick={() => void syncNow()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-bold text-foreground transition hover:bg-secondary/70"
        >
          <RefreshCw className={cn("size-4", syncStatus === "syncing" && "animate-spin")} />
          סנכרן עכשיו
        </button>

        {syncError && <p className="text-xs font-bold text-destructive">{syncError}</p>}
        {lastSyncAt && (
          <p className="text-[11px] font-semibold text-muted-foreground">
            סונכרן לאחרונה: {new Date(lastSyncAt).toLocaleTimeString("he-IL")}
          </p>
        )}
      </div>

      {/* OneSignal Real-time Push Notifications Panel */}
      <div className="space-y-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-black text-foreground">
            <BellRing className="size-4 text-amber-500" />
            התראות דחיפה OneSignal
          </div>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-black",
              oneSignalStatus.permission === "granted"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-300",
            )}
          >
            {oneSignalStatus.permission === "granted" ? "פעיל ומסונכרן" : "ממתין להרשאה"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          כל שינוי סטטוס, הזמנה חדשה או חיווי קולי של נועה AI משגר התראת OneSignal מיידית למכשירים.
        </p>

        <div className="rounded-lg bg-background/80 p-2 text-[11px] font-mono text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>App ID:</span>
            <span className="text-foreground font-bold">{ONESIGNAL_APP_ID.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span>Key ID:</span>
            <span className="text-foreground font-bold">{ONESIGNAL_KEY_ID}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {oneSignalStatus.permission !== "granted" ? (
            <button
              onClick={() => void requestNotificationPermission()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-amber-950 transition hover:bg-amber-400"
            >
              <BellRing className="size-3.5" /> אשר הרשאת התראות בדפדפן
            </button>
          ) : (
            <button
              onClick={() => {
                sendPushAlert(
                  "בדיקת התראה חיה · OneSignal & ח. סבן",
                  "מערכת התראות OneSignal פועלת בהצלחה במקביל לקריינות ולשינויי סטטוס!",
                  { type: "manual_test" },
                );
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-black text-amber-300 transition hover:bg-amber-500/30 ring-1 ring-amber-500/30"
            >
              <Send className="size-3.5" /> שלח התראת בדיקה כעת
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
