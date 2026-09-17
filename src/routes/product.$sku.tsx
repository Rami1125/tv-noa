import { createFileRoute } from "@tanstack/react-router";
import { ProductLandingView } from "@/components/store/ProductLandingView";

export const Route = createFileRoute("/product/$sku")({
  head: ({ params }) => ({
    meta: [
      { title: `ח. סבן · מפרט מוצר ${params.sku}` },
      {
        name: "description",
        content: `מפרט טכני מלא, צריכה למ״ר, זמני ייבוש והנחות קבלנים למוצר ${params.sku} מח. סבן.`,
      },
      { property: "og:title", content: `ח. סבן · מפרט מוצר ${params.sku}` },
    ],
  }),
  component: ProductRouteComponent,
});

function ProductRouteComponent() {
  const { sku } = Route.useParams();
  return <ProductLandingView sku={sku} />;
}
