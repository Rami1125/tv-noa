import { createFileRoute } from "@tanstack/react-router";
import { LobbyAdminView } from "@/components/lobby/LobbyAdminView";
import { DispatchProvider } from "@/context/DispatchContext";
import { Sliders, RefreshCw, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/lobby-admin")({
  head: () => ({
    meta: [
      { title: "ח. סבן · ניהול שילוט לובי ומוצרים" },
      {
        name: "description",
        content: "פאנל ניהול מוצרי החנות ושילוט הלובי של ח. סבן חומרי בניין בע״מ",
      },
      { property: "og:title", content: "ח. סבן · ניהול שילוט לובי ומוצרים" },
    ],
  }),
  component: LobbyAdminRoute,
  errorComponent: ({ reset }) => {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center bg-stone-900 px-4 font-sans text-stone-100"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-950 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
            <Sliders className="size-8" />
          </div>
          <h1 className="text-xl font-black text-white">ניהול שילוט לובי · ח. סבן</h1>
          <p className="mt-2 text-sm text-stone-400">חלה שגיאה בטעינת ממשק ניהול השילוט.</p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 shadow-sm transition hover:bg-amber-400 cursor-pointer"
            >
              <RefreshCw className="size-4" />
              <span>טען שוב</span>
            </button>
            <a
              href="/lobby"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-5 py-2.5 text-sm font-bold text-stone-200 transition hover:bg-stone-700"
            >
              <ArrowRight className="size-4" />
              <span>פתח מסך שילוט</span>
            </a>
          </div>
        </div>
      </div>
    );
  },
});

function LobbyAdminRoute() {
  return (
    <DispatchProvider>
      <LobbyAdminView />
    </DispatchProvider>
  );
}
