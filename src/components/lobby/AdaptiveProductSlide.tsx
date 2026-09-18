import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgePercent,
  Box,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Truck,
  Volume2,
  VolumeX,
  Wrench,
} from "lucide-react";
import type { StoreProduct } from "@/types/storeProduct";
import { QRCodeView } from "@/components/common/QRCodeView";
import { formatYouTubeEmbedUrl } from "@/services/storeProductService";
import { cn } from "@/lib/utils";

interface AdaptiveProductSlideProps {
  product: StoreProduct;
  isPlayingVideo?: boolean;
  onVideoEnd?: () => void;
  showQrCode?: boolean;
}

export function AdaptiveProductSlide({
  product,
  isPlayingVideo = false,
  onVideoEnd,
  showQrCode = true,
}: AdaptiveProductSlideProps) {
  const [activeThumb, setActiveThumb] = useState(0);

  // Cycle thumbnails periodically if multiple images exist
  useEffect(() => {
    if (!product.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveThumb((prev) => (prev + 1) % product.images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [product.images]);

  const fallbackImage =
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80";
  const images = product.images && product.images.length > 0 ? product.images : [fallbackImage];
  const imgCount = images.length;

  const skuSafe = product.sku || "SBN-110";
  const qrLandingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${encodeURIComponent(skuSafe)}`
      : `/product/${skuSafe}`;

  return (
    <div
      dir="rtl"
      className="relative flex size-full flex-col justify-between overflow-hidden bg-[#FDFBF7] text-slate-900 select-none"
    >
      {/* Delicate background decorative subtle glow */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

      {/* Top Bar / Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-stone-200/80 bg-white/80 px-8 py-3.5 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-600 text-white font-black shadow-md text-lg">
            סבן
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                ח. סבן חומרי בניין בע״מ
              </h1>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">
                Lobby Showcase
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              תצוגת מוצרי פרימיום · סניף מרכזי ומחסן מגרש 4
            </p>
          </div>
        </div>

        {/* Live SKU & Category Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 shadow-xs">
            <span className="text-xs font-semibold text-slate-400">קטגוריה:</span>
            <span className="text-xs font-black text-slate-800">{product.category}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-1.5 shadow-xs">
            <span className="text-xs font-semibold text-sky-600">מק״ט:</span>
            <span className="text-sm font-mono font-black text-sky-900">{product.sku}</span>
          </div>
        </div>
      </header>

      {/* Main Slide Body */}
      <main className="relative z-10 grid flex-1 grid-cols-1 items-stretch gap-6 p-6 lg:grid-cols-12 min-h-0">
        {/* RIGHT COLUMN (Lg: 7 cols in RTL) - Adaptive Images Gallery OR Video Player */}
        <div className="relative flex flex-col justify-center min-h-0 lg:col-span-7">
          <div className="relative size-full overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-3 shadow-xl backdrop-blur-md">
            {/* If video mode active and mediaUrl exists, render video */}
            {isPlayingVideo && product.mediaUrl ? (
              <div className="relative size-full overflow-hidden rounded-2xl bg-black">
                {product.mediaType === "youtube" ? (
                  <iframe
                    src={formatYouTubeEmbedUrl(product.mediaUrl)}
                    title={product.name}
                    className="size-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={product.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onEnded={onVideoEnd}
                    className="size-full object-contain"
                  />
                )}
                <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
                  <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                  <span>וידאו מוצר</span>
                </div>
              </div>
            ) : (
              /* Adaptive Intelligent Image Grid */
              <div className="size-full min-h-0">
                {/* 1 IMAGE: Full Hero with Ken Burns Zoom Effect */}
                {imgCount <= 1 && (
                  <div className="relative size-full overflow-hidden rounded-2xl bg-stone-100">
                    <motion.img
                      key={images[0]}
                      src={images[0]}
                      alt={product.name}
                      initial={{ scale: 1.0 }}
                      animate={{ scale: 1.08 }}
                      transition={{
                        duration: 12,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                {/* 2 IMAGES: Visually Balanced 2-Column Split Grid */}
                {imgCount === 2 && (
                  <div className="grid size-full grid-cols-2 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden rounded-2xl bg-stone-100 shadow-inner"
                      >
                        <motion.img
                          src={img}
                          alt={product.name}
                          initial={{ scale: 1.0 }}
                          animate={{ scale: 1.05 }}
                          transition={{
                            duration: 8,
                            ease: "linear",
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: idx * 2,
                          }}
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 3 IMAGES: Large Hero + 2 Vertically Stacked Secondaries */}
                {imgCount >= 3 && (
                  <div className="grid size-full grid-cols-12 gap-3">
                    {/* Hero Left (8 cols) */}
                    <div className="relative col-span-8 overflow-hidden rounded-2xl bg-stone-100 shadow-inner">
                      <motion.img
                        src={images[0]}
                        alt={product.name}
                        initial={{ scale: 1.0 }}
                        animate={{ scale: 1.06 }}
                        transition={{
                          duration: 10,
                          ease: "linear",
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        className="size-full object-cover"
                      />
                    </div>
                    {/* Stacked Right (4 cols) */}
                    <div className="col-span-4 flex flex-col gap-3 min-h-0">
                      <div className="relative flex-1 overflow-hidden rounded-2xl bg-stone-100 shadow-inner">
                        <img
                          src={images[1]}
                          alt=""
                          className="size-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </div>
                      <div className="relative flex-1 overflow-hidden rounded-2xl bg-stone-100 shadow-inner">
                        <img
                          src={images[2]}
                          alt=""
                          className="size-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sale / Discount Pill Floating on Top Right */}
                {(product.salePrice || product.discountTag) && (
                  <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-rose-600 px-4 py-1.5 text-sm font-black text-white shadow-xl animate-pulse">
                    <BadgePercent className="size-4" />
                    <span>{product.discountTag || "מבצע מיוחד לחודש זה"}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LEFT COLUMN (Lg: 5 cols in RTL) - Product Info, Pricing, 4 Technical Specs, and QR Code */}
        <div className="flex flex-col justify-between space-y-4 lg:col-span-5 min-h-0 overflow-y-auto">
          {/* Title & Brand Accent */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
              <Sparkles className="size-3.5" />
              <span>מוצר נבחר לפרויקטים מובילים</span>
            </div>
            <h2 className="mt-1 text-3xl font-black text-slate-950 tracking-tight leading-tight lg:text-4xl">
              {product.name}
            </h2>
            {product.marketingPhrase && (
              <p className="mt-2 text-sm font-medium text-slate-700 bg-sky-50/80 border-r-4 border-sky-600 p-3 rounded-l-xl">
                {product.marketingPhrase}
              </p>
            )}
          </div>

          {/* Pricing Box with Special Sale Highlight */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">תנאי מחיר לדלפק</span>
                <div className="flex items-baseline gap-3 mt-1">
                  {product.salePrice ? (
                    <>
                      <span className="text-4xl font-black text-rose-600 tabular-nums">
                        {product.salePrice}
                      </span>
                      {product.price && (
                        <span className="text-xl font-bold text-slate-400 line-through tabular-nums">
                          {product.price}
                        </span>
                      )}
                    </>
                  ) : product.price ? (
                    <span className="text-4xl font-black text-slate-900 tabular-nums">
                      {product.price}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-1.5 text-sm font-black text-sky-800">
                      <span>מחיר מיוחד לקבלנים – שאל בדלפק</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/30">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>זמין במלאי שוטף</span>
                </span>
                <span className="mt-1 text-[11px] font-semibold text-slate-400">
                  אספקה מיידית בדלפק
                </span>
              </div>
            </div>
          </div>

          {/* 4 Technical Indicators Grid with Icons */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Coverage / צריכה למ"ר */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-xs">
              <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
                <Layers className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400">צריכה למ״ר</span>
                <p className="text-xs font-black text-slate-800 leading-tight mt-0.5">
                  {product.coverageM2 || "לפי עובי וסוג תשתית"}
                </p>
              </div>
            </div>

            {/* 2. Drying Time / זמן ייבוש */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-xs">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Clock className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400">זמן ייבוש</span>
                <p className="text-xs font-black text-slate-800 leading-tight mt-0.5">
                  {product.dryingTime || "ייבוש ראשוני: 3 שעות"}
                </p>
              </div>
            </div>

            {/* 3. Application Method / שיטת יישום */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-xs">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Wrench className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400">שיטת יישום</span>
                <p className="text-xs font-black text-slate-800 leading-tight mt-0.5">
                  {product.applicationMethod || "מאלג׳ או מברשת מקצועית"}
                </p>
              </div>
            </div>

            {/* 4. Packaging / אריזה במשטח */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-xs">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Box className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400">אריזה ומשטח</span>
                <p className="text-xs font-black text-slate-800 leading-tight mt-0.5">
                  {product.packaging || "שק תקני / משטח 48 יח׳"}
                </p>
              </div>
            </div>
          </div>

          {/* Prominent QR Code for Mobile Scanning */}
          {showQrCode && (
            <div className="flex items-center justify-between rounded-3xl border border-sky-300 bg-gradient-to-r from-sky-50 to-white p-3.5 shadow-md">
              <div className="flex-1 pl-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-0.5 text-[11px] font-black text-white">
                  <span>סריקה מהירה</span>
                </div>
                <h4 className="mt-1.5 text-base font-black text-slate-900 leading-tight">
                  סרוק בנייד למפרט מלא והצגה לדלפק
                </h4>
                <p className="mt-1 text-xs text-slate-600 font-medium">
                  דף נחיתה אישי עם כרטיס זיהוי מהיר, הנחות לקבלנים ושיתוף בוואטסאפ.
                </p>
              </div>

              <div className="shrink-0">
                <QRCodeView
                  value={qrLandingUrl}
                  size={110}
                  caption=""
                  showIcon={false}
                  className="p-1 border-0 shadow-none bg-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM TICKER: Moving News Ticker Right-to-Left */}
      <footer className="relative z-10 flex items-center overflow-hidden border-t border-stone-300 bg-slate-900 py-2.5 px-6 text-white shadow-lg">
        <div className="flex shrink-0 items-center gap-2 rounded-lg bg-sky-600 px-3 py-1 text-xs font-black text-white shadow-sm ml-4">
          <Truck className="size-3.5" />
          <span>מבזק חנות</span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{
              repeat: Infinity,
              duration: 25,
              ease: "linear",
            }}
            className="flex items-center gap-8 whitespace-nowrap text-sm font-black text-amber-300"
          >
            <span>
              {product.marketingPhrase ||
                "ח. סבן חומרי בניין בע״מ — האיכות והשירות שעושים את ההבדל בכל אתר בנייה"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-white">
              מק״ט {product.sku}: {product.name}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sky-300">
              שאל את נציג הדלפק על מחירי קבלנים מיוחדים להזמנות משטח
            </span>
            <span className="text-slate-500">•</span>
            <span>מוקד הזמנות וסידור משאיות: 03-9343355</span>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
