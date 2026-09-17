import { useState, useEffect } from "react";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Maximize2,
  Package,
  Phone,
  QrCode,
  Share2,
  Sparkles,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import type { StoreProduct } from "@/types/storeProduct";
import { getProductBySku, getStoreProducts } from "@/services/storeProductService";
import { cn } from "@/lib/utils";

interface ProductLandingViewProps {
  sku: string;
  onBack?: () => void;
}

export function ProductLandingView({ sku, onBack }: ProductLandingViewProps) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        const item = await getProductBySku(sku);
        const catalog = await getStoreProducts(false);
        if (isMounted) {
          setProduct(item);
          setAllProducts(catalog);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load product for landing:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [sku]);

  // Current page URL for sharing
  const currentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${encodeURIComponent(sku)}`
      : "";

  const handleShareWhatsApp = () => {
    if (!product) return;
    const msg = `שלום, אני מעוניין במוצר מח. סבן חומרי בניין בע״מ:\n*${product.name}*\nמק״ט: ${product.sku}\n${product.salePrice ? `מחיר מבצע: ${product.salePrice}` : ""}\nלפרטים מלאים:\n${currentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCopyLink = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {
        /* ignore */
      }
    }
  };

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-4 text-center font-sans"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
          <p className="text-sm font-bold text-slate-700">טוען מפרט מוצר מח. סבן...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center font-sans"
      >
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <Package className="mx-auto size-16 text-slate-400 mb-4" />
          <h1 className="text-2xl font-black text-slate-900">מוצר לא נמצא</h1>
          <p className="mt-2 text-sm text-slate-600">
            מק״ט {sku} אינו קיים במערכת או שהוסר מקטלוג החנות.
          </p>
          <button
            onClick={() => (onBack ? onBack() : (window.location.href = "/"))}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-sky-700"
          >
            <ArrowRight className="size-4" />
            <span>חזרה ללוח הראשי</span>
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[activeImageIndex] || images[0];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900 pb-20"
    >
      {/* Top Mobile App Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 px-4 py-3 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-600 text-white font-black text-sm shadow-sm">
              סבן
            </div>
            <div>
              <h1 className="text-sm font-black leading-none text-slate-900">ח. סבן חומרי בניין</h1>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                דף מוצר מהיר למובייל · מחסן מרכזי
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 transition hover:bg-emerald-500/20 active:scale-95"
              title="שתף בוואטסאפ"
            >
              <Share2 className="size-4" />
            </button>
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                <span>חזרה</span>
              </button>
            ) : (
              <a
                href="/"
                className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                <span>למסך הראשי</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-xl px-4 pt-4 space-y-4">
        {/* Category & SKU Pill */}
        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full bg-sky-100 px-3 py-1 font-bold text-sky-800">
            {product.category || "חומרי בניין"}
          </span>
          <span className="rounded-full bg-stone-200/70 px-3 py-1 font-mono font-bold text-slate-700">
            מק״ט: {product.sku}
          </span>
        </div>

        {/* Product Title & Marketing Phrase */}
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 leading-tight">
            {product.name}
          </h2>
          {product.marketingPhrase && (
            <p className="mt-1 text-xs font-medium text-slate-600 bg-amber-500/10 border-r-2 border-amber-500 p-2 rounded-l-lg">
              {product.marketingPhrase}
            </p>
          )}
        </div>

        {/* Swipeable / Interactive Image Gallery Card */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-md">
          <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
            <img
              src={currentImage}
              alt={product.name}
              className="size-full object-cover transition-transform duration-500 hover:scale-105"
            />

            {/* Discount / Sale Overlay Banner */}
            {(product.salePrice || product.discountTag) && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1 text-xs font-black text-white shadow-lg animate-pulse">
                <BadgePercent className="size-3.5" />
                <span>{product.discountTag || "מחיר מבצע"}</span>
              </div>
            )}

            {/* Expand Image Button */}
            <button
              onClick={() => setIsCounterModalOpen(true)}
              className="absolute bottom-3 left-3 rounded-full bg-black/60 p-2 text-white backdrop-blur-xs transition hover:bg-black/80"
              title="הגדל תמונה"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>

          {/* Thumbnails row if multiple images exist */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-stone-50 border-t border-stone-100 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative size-14 shrink-0 overflow-hidden rounded-xl border-2 transition active:scale-95",
                    idx === activeImageIndex
                      ? "border-sky-600 ring-2 ring-sky-600/30 shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Banner */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">תמחור ומבצע</span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                {product.salePrice ? (
                  <>
                    <span className="text-3xl font-black text-rose-600 tabular-nums">
                      {product.salePrice}
                    </span>
                    {product.price && (
                      <span className="text-base font-semibold text-slate-400 line-through tabular-nums">
                        {product.price}
                      </span>
                    )}
                  </>
                ) : product.price ? (
                  <span className="text-3xl font-black text-slate-900 tabular-nums">
                    {product.price}
                  </span>
                ) : (
                  <span className="text-base font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl">
                    מחיר מיוחד לקבלנים – שאל בדלפק
                  </span>
                )}
              </div>
            </div>

            {/* Quick stock status */}
            <div className="text-left">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>זמין במחסן</span>
              </span>
            </div>
          </div>
        </div>

        {/* ★ DEDICATED COUNTER HERO BUTTON ("הצג לנציג הדלפק לקנייה מהירה") ★ */}
        <div className="rounded-3xl border-2 border-sky-500/40 bg-gradient-to-br from-sky-600 to-sky-800 p-5 text-white shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-black backdrop-blur-xs">
                <Sparkles className="size-3.5 text-amber-300" />
                <span>שירות רכישה מהיר בדלפק</span>
              </div>
              <h3 className="mt-2 text-xl font-black leading-tight">
                הצג לנציג הדלפק לקנייה מהירה
              </h3>
              <p className="mt-1 text-xs text-sky-100 font-medium">
                לחץ כאן לפתיחת כרטיס זיהוי ומק״ט ענקי המאפשר למחסנאי לאתר את המוצר באופן מיידי!
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCounterModalOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 px-4 text-sm font-black text-sky-800 shadow-md transition hover:bg-sky-50 active:scale-98"
          >
            <QrCode className="size-5 text-sky-600" />
            <span>פתח כרטיס קנייה לדלפק</span>
          </button>
        </div>

        {/* 4 Technical Specifications Grid */}
        <div className="space-y-2">
          <h4 className="text-sm font-black text-slate-800">מפרט טכני ושיטת יישום</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Coverage */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2 text-sky-600 mb-1">
                <Layers className="size-4" />
                <span className="text-[11px] font-black">צריכה למ״ר</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {product.coverageM2 || "לפי עובי השכבה והתשתית"}
              </p>
            </div>

            {/* 2. Drying Time */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Clock className="size-4" />
                <span className="text-[11px] font-black">זמן ייבוש</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {product.dryingTime || "ייבוש סטנדרטי (24 שעות)"}
              </p>
            </div>

            {/* 3. Application Method */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Wrench className="size-4" />
                <span className="text-[11px] font-black">שיטת יישום</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {product.applicationMethod || "מאלג׳ או התזה בהתאם למפרט"}
              </p>
            </div>

            {/* 4. Packaging */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Package className="size-4" />
                <span className="text-[11px] font-black">אריזה ומשטח</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {product.packaging || "שק תקני או דלי אטום"}
              </p>
            </div>
          </div>
        </div>

        {/* Video or Presentation Media (if exists) */}
        {product.mediaUrl && (
          <div className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-black text-slate-700">סרטון הדרכה והדגמה</h4>
            {product.mediaType === "youtube" ? (
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${
                    product.mediaUrl.includes("v=")
                      ? product.mediaUrl.split("v=")[1]?.split("&")[0]
                      : product.mediaUrl.split("youtu.be/")[1]?.split("?")[0]
                  }`}
                  title={product.name}
                  className="size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={product.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold text-sky-700 transition hover:bg-slate-100"
              >
                <span>צפה במדיה המצורפת למוצר</span>
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        )}

        {/* Share & Actions Section */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-black text-slate-700">פעולות ושיתוף מהיר</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <Share2 className="size-4" />
              <span>שתף בוואטסאפ</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-stone-50 active:scale-95"
            >
              <ExternalLink className="size-4" />
              <span>{copiedLink ? "הקישור הועתק!" : "העתק קישור"}</span>
            </button>
          </div>

          <a
            href="tel:039343355"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
          >
            <Phone className="size-4 text-emerald-400" />
            <span>חייג לדלפק המכירות (03-9343355)</span>
          </a>
        </div>

        {/* Other products suggestion strip */}
        {allProducts.length > 1 && (
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-black text-slate-700">מוצרים מומלצים נוספים</h4>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allProducts
                .filter((p) => p.sku !== product.sku)
                .slice(0, 4)
                .map((item) => (
                  <a
                    key={item.sku}
                    href={`/product/${encodeURIComponent(item.sku)}`}
                    className="flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 text-right shadow-xs transition hover:shadow-md"
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="mt-1.5 line-clamp-2 text-[11px] font-bold text-slate-800 leading-tight">
                      {item.name}
                    </span>
                    <span className="mt-1 text-[10px] font-mono text-sky-600 font-black">
                      {item.salePrice || item.price || "למחיר שאל בדלפק"}
                    </span>
                  </a>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* ★ LARGE MODAL FOR STORE COUNTER REPRESENTATIVE ★ */}
      {isCounterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border-2 border-sky-400 bg-white p-6 shadow-2xl text-center">
            {/* Close Button */}
            <button
              onClick={() => setIsCounterModalOpen(false)}
              className="absolute top-4 left-4 rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
              title="סגור"
            >
              <X className="size-5" />
            </button>

            {/* Saban Header Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">
              <Truck className="size-3.5" />
              <span>ח. סבן לוגיסטיקה · דלפק מכירות</span>
            </div>

            {/* Giant SKU Box */}
            <div className="mt-4 rounded-2xl border-2 border-dashed border-sky-500 bg-sky-50/70 p-4">
              <span className="text-xs font-bold text-slate-500">מק״ט מוצר לחיפוש מהיר:</span>
              <div className="text-3xl font-black tracking-wider text-sky-800 font-mono mt-1">
                {product.sku}
              </div>
            </div>

            {/* Product Title */}
            <h3 className="mt-3 text-lg font-black text-slate-900 leading-tight">{product.name}</h3>

            {/* Discount / Pricing Badge */}
            {(product.salePrice || product.discountTag) && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-1 text-sm font-black text-white shadow-sm animate-pulse">
                <BadgePercent className="size-4" />
                <span>{product.discountTag || `מבצע: ${product.salePrice}`}</span>
              </div>
            )}

            {/* High-res Image Preview for warehouse rep */}
            <div className="mt-4 aspect-4/3 w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
              <img src={currentImage} alt={product.name} className="size-full object-cover" />
            </div>

            {/* Warehouse instruction */}
            <div className="mt-4 rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-900 text-right">
              <p>• הצג מסך זה לנציג הדלפק לאיתור מהיר במחסן או במגרש 4.</p>
              {product.packaging && <p>• אריזה: {product.packaging}</p>}
            </div>

            {/* Done button */}
            <button
              onClick={() => setIsCounterModalOpen(false)}
              className="mt-4 w-full rounded-2xl bg-sky-600 py-3 text-sm font-black text-white shadow-md transition hover:bg-sky-700"
            >
              סגור כרטיס דלפק
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
