import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useDispatchBoard } from "@/context/DispatchContext";
import { BroadcastControl } from "./BroadcastControl";
import { OrderEditor } from "./OrderEditor";
import { QuickTemplates } from "./QuickTemplates";
import { AITrainerStudio } from "./AITrainerStudio";

export function StudioDrawer() {
  const { isStudioOpen, closeStudio } = useDispatchBoard();

  return (
    <AnimatePresence>
      {isStudioOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeStudio}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[440px] max-w-[92vw] flex-col border-l border-border/80 bg-card/95 shadow-md backdrop-blur-md"
          >
            <header className="flex items-center justify-between border-b border-border/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <SlidersHorizontal className="size-5" />
                </span>
                <div>
                  <div className="text-base font-black text-foreground">סטודיו ניהול</div>
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Ctrl + Shift + E · Esc
                  </div>
                </div>
              </div>
              <button
                onClick={closeStudio}
                aria-label="סגירה"
                className="grid size-9 place-items-center rounded-xl bg-secondary text-muted-foreground transition hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              {/* Quick Navigation to Lobby & Slide Admin */}
              <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 to-slate-900/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-black text-amber-300">שילוט לובי וחנות</span>
                  </div>
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                    PIN: 1994
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/lobby-admin"
                    className="flex flex-col items-start rounded-xl border border-stone-700 bg-stone-900/90 p-2.5 transition hover:border-sky-500 hover:bg-sky-950/40"
                  >
                    <span className="text-xs font-black text-white">עריכת שקופיות</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">קטלוג, מבצעים וטיימר</span>
                  </a>

                  <a
                    href="/lobby"
                    target="_blank"
                    className="flex flex-col items-start rounded-xl border border-stone-700 bg-stone-900/90 p-2.5 transition hover:border-amber-500 hover:bg-amber-950/40"
                  >
                    <span className="text-xs font-black text-white">שידור TV חי</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">פתיחת מסך שילוט מלא</span>
                  </a>
                </div>
              </div>

              <AITrainerStudio />
              <BroadcastControl />
              <QuickTemplates />
              <OrderEditor />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
