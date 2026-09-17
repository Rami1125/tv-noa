import { createFileRoute } from "@tanstack/react-router";
import { LobbySignageOrchestrator } from "@/components/lobby/LobbySignageOrchestrator";

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
});

function LobbyRoute() {
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#FDFBF7]">
      <LobbySignageOrchestrator isStandalone />
    </div>
  );
}
