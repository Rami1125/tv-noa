import { createFileRoute } from "@tanstack/react-router";
import { LobbySignageOrchestrator } from "@/components/lobby/LobbySignageOrchestrator";
import { DispatchProvider } from "@/context/DispatchContext";
import { Tv, RefreshCw, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/lobby")({
  head: () => ({
    meta: [
      { title: "ח. סבן · מסך שילוט לובי מרכזי (TV Showcase)" },
      {
        name: "description",
        content: "שידור שילוט לובי, תצוגת מוצרים ומבצעים של ח. סבן חומרי בניין בע״מ",
      },
      { property: "og:title", content: "ח. סבן · מסך שילוט לובי מרכזי" },
    ],
  }),
  component: LobbyRoute,
  errorComponent: ({ reset }) => {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center bg-[#FDFBF7] px-4 font-sans"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <Tv className="size-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900">מסך שילוט לובי · ח. סבן</h1>
          <p className="mt-2 text-sm text-slate-600">
            חלה שגיאה בטעינת מסך השילוט. ניתן לטעון מחדש בלחיצה על הכפתור.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 cursor-pointer"
            >
              <RefreshCw className="size-4" />
              <span>טען שוב</span>
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-stone-50"
            >
              <ArrowRight className="size-4" />
              <span>חזרה ללוח ההפצה</span>
            </a>
          </div>
        </div>
      </div>
    );
  },
});

function LobbyRoute() {
  return (
    <DispatchProvider>
      <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#FDFBF7]">
        <LobbySignageOrchestrator
          isStandalone
          onOpenSettings={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/lobby-admin";
            }
          }}
        />
      </div>
    </DispatchProvider>
  );
}
