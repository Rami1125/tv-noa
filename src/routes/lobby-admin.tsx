import { createFileRoute } from "@tanstack/react-router";
import { LobbyAdminView } from "@/components/lobby/LobbyAdminView";

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
});

function LobbyAdminRoute() {
  return <LobbyAdminView />;
}
