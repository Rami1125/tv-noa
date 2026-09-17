import React, { useState, useMemo, useCallback } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Layers,
  Monitor,
  Package,
  Play,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Truck,
  Warehouse,
  ImageIcon,
  Search,
  Zap,
  ExternalLink,
  Check,
  X,
  Palette,
  Pencil,
} from "lucide-react";
import { useAdminControl } from "@/context/AdminControlContext";
import { useDispatchBoard } from "@/context/DispatchContext";
import type { ScreensaverBranchFilter } from "@/types/screensaver";
import {
  extractProductsFromSheetOrders,
  generateShortagePosterSvg,
  saveCustomProductImage,
  saveCustomShortagePoster,
  resetCustomProductImages,
  saveProductMetadata,
  resetProductMetadata,
  SheetProductItem,
} from "@/services/productImageService";
import { cn } from "@/lib/utils";

interface ScreensaverAdminPanelProps {
  onClose?: () => void;
}

export function ScreensaverAdminPanel({ onClose }: ScreensaverAdminPanelProps) {
  const {
    settings,
    activeSlides,
    toggleSlide,
    setSlideDuration,
    moveSlide,
    setBranchFilter,
    setPrioritizeCritical,
    setProductSlideInterval,
    setPauseOnHover,
    resetToDefaults,
  } = useAdminControl();

  const { setScreensaverActive, published } = useDispatchBoard();

  const [activeTab, setActiveTab] = useState<"slides" | "products">("products");
  const [productSearch, setProductSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "shortage" | "custom">("all");
  const [previewItem, setPreviewItem] = useState<SheetProductItem | null>(null);
  const [editingSkuUrl, setEditingSkuUrl] = useState<{ sku: string; url: string } | null>(null);
  const [editingProduct, setEditingProduct] = useState<{
    originalSku: string;
    originalName: string;
    sku: string;
    name: string;
    isCustom: boolean;
  } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Total cycle duration across enabled slides
  const totalCycleDuration = activeSlides.reduce((acc, s) => acc + s.durationSeconds, 0);

  // חילוץ רשימת מוצרים מהגיליון בזמן אמת
  const sheetProducts = useMemo(() => {
    return extractProductsFromSheetOrders(published || [], settings.branchFilter);
  }, [published, settings.branchFilter]);

  // סינון מוצרים לפי חיפוש וסטטוס
  const filteredProducts = useMemo(() => {
    return sheetProducts.filter((p) => {
      const matchesSearch =
        !productSearch.trim() ||
        p.cleanName.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === "shortage") {
        return p.isCritical || p.isWarning || p.deficitToRefill > 0;
      }
      if (filterMode === "custom") {
        return p.isCustomImage;
      }
      return true;
    });
  }, [sheetProducts, productSearch, filterMode]);

  const shortageCount = useMemo(() => {
    return sheetProducts.filter((p) => p.isCritical || p.isWarning || p.deficitToRefill > 0).length;
  }, [sheetProducts]);

  const handleLaunchScreensaver = () => {
    onClose?.();
    setScreensaverActive(true);
  };

  // יצירת כרזת חוסר מעוצבת לפריט ושמירתה
  const handleGenerateShortagePoster = (item: SheetProductItem) => {
    const posterSvgUrl = generateShortagePosterSvg({
      sku: item.sku,
      name: item.cleanName,
      category: item.category,
      deficit: item.deficitToRefill > 0 ? item.deficitToRefill : item.safetyThreshold,
      unit: item.unit,
      safetyThreshold: item.safetyThreshold,
      effectiveBalance: item.effectiveBalance,
      isCritical: item.isCritical || true,
    });
    saveCustomShortagePoster(item.sku, posterSvgUrl);
    showNotification(`נוצרה כרזת חוסר מעוצבת למק״ט ${item.sku} (${item.cleanName})!`);
  };

  // יצירת כרזות חוסר מרוכזות לכל המוצרים שבחוסר
  const handleBatchGenerateShortagePosters = () => {
    let count = 0;
    sheetProducts.forEach((item) => {
      if (item.isCritical || item.isWarning || item.deficitToRefill > 0) {
        const posterSvgUrl = generateShortagePosterSvg({
          sku: item.sku,
          name: item.cleanName,
          category: item.category,
          deficit: item.deficitToRefill > 0 ? item.deficitToRefill : item.safetyThreshold,
          unit: item.unit,
          safetyThreshold: item.safetyThreshold,
          effectiveBalance: item.effectiveBalance,
          isCritical: item.isCritical,
        });
        saveCustomShortagePoster(item.sku, posterSvgUrl);
        count++;
      }
    });
    showNotification(`הופקו בהצלחה ${count} כרזות חוסר מעוצבות לכל הפריטים בחוסר!`);
  };

  const handleSaveCustomImageUrl = () => {
    if (!editingSkuUrl) return;
    saveCustomProductImage(editingSkuUrl.sku, editingSkuUrl.url);
    showNotification(`התמונה נשמרה למק״ט ${editingSkuUrl.sku}`);
    setEditingSkuUrl(null);
  };

  const handleResetImages = () => {
    if (confirm("האם לאפס את כל התמונות המותאמות אישית לברירת מחדל?")) {
      resetCustomProductImages();
      showNotification("כל התמונות המותאמות אופסו לברירת מחדל");
    }
  };

  const handleOpenEditProduct = (item: SheetProductItem) => {
    setEditingProduct({
      originalSku: item.originalSku,
      originalName: item.originalName,
      sku: item.sku,
      name: item.name,
      isCustom: Boolean(item.isCustomMetadata),
    });
  };

  const handleSaveProductMetadata = () => {
    if (!editingProduct) return;
    const trimmedSku = editingProduct.sku.trim();
    const trimmedName = editingProduct.name.trim();

    if (!trimmedSku || !trimmedName) {
      showNotification("נא להזין שם מוצר ומק״ט תקינים");
      return;
    }

    const key = editingProduct.originalSku || editingProduct.originalName;
    saveProductMetadata(key, {
      customSku: trimmedSku !== editingProduct.originalSku ? trimmedSku : undefined,
      customName: trimmedName !== editingProduct.originalName ? trimmedName : undefined,
    });

    // אם המוצר בחוסר, נעדכן אוטומטית גם את כרזת החוסר המעוצבת לשם ולמק״ט החדשים
    const targetItem = sheetProducts.find(
      (p) => p.originalSku === editingProduct.originalSku || p.sku === editingProduct.sku,
    );
    if (
      targetItem &&
      (targetItem.isCritical || targetItem.isWarning || targetItem.deficitToRefill > 0)
    ) {
      const posterSvgUrl = generateShortagePosterSvg({
        sku: trimmedSku,
        name: trimmedName,
        category: targetItem.category,
        deficit:
          targetItem.deficitToRefill > 0 ? targetItem.deficitToRefill : targetItem.safetyThreshold,
        unit: targetItem.unit,
        safetyThreshold: targetItem.safetyThreshold,
        effectiveBalance: targetItem.effectiveBalance,
        isCritical: targetItem.isCritical,
      });
      saveCustomShortagePoster(trimmedSku, posterSvgUrl);
    }

    showNotification(`עודכנו שם ומק״ט למוצר: "${trimmedName}" (${trimmedSku})`);
    setEditingProduct(null);
  };

  const handleResetProductMetadata = () => {
    if (!editingProduct) return;
    const key = editingProduct.originalSku || editingProduct.originalName;
    resetProductMetadata(key);
    showNotification(`פרטי המוצר שוחזרו לברירת מחדל: ${editingProduct.originalName}`);
    setEditingProduct(null);
  };

  return (
    <div className="flex flex-col gap-6 text-foreground p-1 md:p-2" id="screensaver-admin-panel">
      {/* Header & Quick Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sliders className="size-5" />
            </div>
            <h2 className="text-xl font-black text-foreground">ניהול שומר מסך וסבב שקופיות</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            שליטה מלאה בשקופיות הטלוויזיה, זמני שהייה, סינון לפי סניף, ותעדוף חוסרים קריטיים
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all shadow-sm"
            title="איפוס כל ההגדרות לברירת מחדל"
          >
            <RotateCcw className="size-3.5" />
            <span>איפוס</span>
          </button>

          <button
            onClick={handleLaunchScreensaver}
            className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-black shadow-md transition hover:scale-105"
            title="הפעלת שומר המסך כעת לבדיקה חיה"
            id="btn-launch-screensaver-preview"
          >
            <Play className="size-4 fill-current" />
            <span>הפעל שומר מסך כעת</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/20 border border-primary/50 p-3 text-sm font-bold text-primary animate-in fade-in slide-in-from-top-2 shadow-sm">
          <Sparkles className="size-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-sm",
            activeTab === "products"
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/60",
          )}
        >
          <ImageIcon className="size-4" />
          <span>מוצרים וכרזות חוסר מהגיליון</span>
          {shortageCount > 0 && (
            <span className="rounded-full bg-rose-500 text-white text-[10px] px-2 py-0.5 font-black animate-pulse">
              {shortageCount} בחוסר
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("slides")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-sm",
            activeTab === "slides"
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/60",
          )}
        >
          <Sliders className="size-4" />
          <span>ניהול שקופיות והגדרות סבב</span>
          <span className="rounded-full bg-secondary text-foreground text-[10px] px-2 py-0.5 font-bold">
            {activeSlides.length} פעילות
          </span>
        </button>
      </div>

      {/* TAB 1: מוצרים וכרזות חוסר מהגיליון */}
      {activeTab === "products" && (
        <div className="flex flex-col gap-5">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="חיפוש לפי מק״ט או שם מוצר..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full h-10 pr-9 pl-3 rounded-xl border border-border bg-card text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border/70 text-xs font-bold">
                <button
                  onClick={() => setFilterMode("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all",
                    filterMode === "all"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  הכל ({sheetProducts.length})
                </button>
                <button
                  onClick={() => setFilterMode("shortage")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1",
                    filterMode === "shortage"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <AlertTriangle className="size-3 text-amber-400" />
                  <span>בחוסר ({shortageCount})</span>
                </button>
                <button
                  onClick={() => setFilterMode("custom")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all",
                    filterMode === "custom"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  תמונה מותאמת
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              <button
                onClick={handleBatchGenerateShortagePosters}
                disabled={shortageCount === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white px-3.5 py-2 text-xs font-black shadow-md transition disabled:opacity-40"
                title="הפק כרזות חוסר מעוצבות אוטומטית לכל הפריטים בחוסר"
              >
                <Zap className="size-4 fill-current" />
                <span>צור כרזות חוסר לכל הפריטים בחוסר ({shortageCount})</span>
              </button>

              <button
                onClick={handleResetImages}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition shadow-sm"
                title="איפוס כל התמונות המותאמות"
              >
                <RotateCcw className="size-3.5" />
                <span>איפוס לברירת מחדל</span>
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const isShortage =
                product.isCritical || product.isWarning || product.deficitToRefill > 0;

              return (
                <div
                  key={product.sku}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-4 transition-all shadow-sm",
                    product.isCritical
                      ? "border-rose-500/60 bg-rose-950/10 hover:border-rose-500"
                      : product.isWarning
                        ? "border-amber-500/60 bg-amber-950/10 hover:border-amber-500"
                        : "border-border/80 bg-card hover:border-border",
                  )}
                >
                  <div className="flex flex-col gap-3">
                    {/* Top Row: Thumbnail + SKU + Status */}
                    <div className="flex items-start gap-3">
                      <div className="relative size-20 rounded-xl overflow-hidden border border-border/80 bg-secondary/50 shrink-0 shadow-inner group">
                        <img
                          src={product.imageUrl}
                          alt={product.cleanName}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => setPreviewItem(product)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-[11px] font-bold"
                          title="תצוגה מקדימה"
                        >
                          <Eye className="size-4" />
                        </button>
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="rounded-lg bg-black/70 border border-primary/60 px-2 py-0.5 text-[11px] font-mono font-black text-primary">
                              מק״ט: {product.sku}
                            </span>
                            {product.isCustomMetadata && (
                              <span className="rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-1.5 py-0.5">
                                נערך
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditProduct(product)}
                              className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition"
                              title="ערוך שם מוצר ומק״ט"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <span
                              className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-md border",
                                product.isCritical
                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                  : product.isWarning
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
                              )}
                            >
                              {product.isCritical
                                ? "חוסר קריטי"
                                : product.isWarning
                                  ? "אזהרת מלאי"
                                  : "תקין"}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm font-black text-foreground leading-snug line-clamp-2">
                          {product.cleanName}
                        </h4>
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          {product.warehouseBranch} · סף ביטחון: {product.safetyThreshold}{" "}
                          {product.unit}
                        </span>
                      </div>
                    </div>

                    {/* Stock Metrics summary */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/40 border border-border/60 p-2.5 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">יתרת רצפה</span>
                        <span
                          className={cn(
                            "font-black text-sm tabular-nums",
                            isShortage ? "text-rose-400" : "text-emerald-500",
                          )}
                        >
                          {product.effectiveBalance} {product.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">נמשך היום</span>
                        <span className="font-black text-sm text-foreground tabular-nums">
                          {product.actualDrawn}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">חסר להשלמה</span>
                        <span className="font-black text-sm text-amber-500 tabular-nums">
                          {product.deficitToRefill > 0 ? `${product.deficitToRefill}` : "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
                    <button
                      onClick={() => handleOpenEditProduct(product)}
                      className="flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-bold transition active:scale-95 shadow-sm shrink-0"
                      title="ערוך שם מוצר ומק״ט"
                    >
                      <Pencil className="size-3.5 text-primary" />
                      <span>ערוך שם/מק״ט</span>
                    </button>

                    <button
                      onClick={() => handleGenerateShortagePoster(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary text-xs font-black transition active:scale-95 shadow-sm"
                      title="צור כרזת חוסר מעוצבת עם מק״ט ושם מוצר מוגדל"
                    >
                      <Palette className="size-3.5" />
                      <span>כרזת חוסר</span>
                    </button>

                    <button
                      onClick={() => setEditingSkuUrl({ sku: product.sku, url: product.imageUrl })}
                      className="grid size-9 place-items-center rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition shrink-0"
                      title="הגדר כתובת תמונה מותאמת"
                    >
                      <ExternalLink className="size-3.5" />
                    </button>

                    <button
                      onClick={() => setPreviewItem(product)}
                      className="grid size-9 place-items-center rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition shrink-0"
                      title="תצוגה מקדימה מלאה"
                    >
                      <Eye className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/40">
              <Package className="size-12 text-muted-foreground/40 mb-2" />
              <h4 className="text-base font-bold text-foreground">לא נמצאו מוצרים תואמים לסינון</h4>
              <p className="text-xs text-muted-foreground mt-1">
                נסה לשנות את מונח החיפוש או לבחור בסינון "הכל"
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ניהול שקופיות וסבב שידור */}
      {activeTab === "slides" && (
        <div className="flex flex-col gap-6">
          {/* KPI Overview Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-3.5 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground">שקופיות פעילות</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-foreground tabular-nums">
                  {activeSlides.length}
                </span>
                <span className="text-xs text-muted-foreground">מתוך {settings.slides.length}</span>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-3.5 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground">משך סבב מלא</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-primary tabular-nums">
                  {totalCycleDuration}
                </span>
                <span className="text-xs text-muted-foreground">שניות לסבב</span>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-3.5 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground">סניף פעיל בשומר מסך</span>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-black text-accent truncate">
                <Warehouse className="size-4 shrink-0" />
                <span className="truncate">
                  {settings.branchFilter === "branch_4"
                    ? "מגרש 4 החרש"
                    : settings.branchFilter === "branch_1"
                      ? "סניף 1 התלמיד"
                      : "כל הסניפים"}
                </span>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-3.5 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground">תעדוף חוסר קריטי</span>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-black text-emerald-500">
                {settings.prioritizeCriticalProducts ? (
                  <>
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    <span>מופעל ראשון</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">סדר רגיל</span>
                )}
              </div>
            </div>
          </div>

          {/* Global Branch Filter Selector */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Warehouse className="size-4 text-primary" />
                <h3 className="text-sm font-black text-foreground">שיוך וסינון סניף לתצוגה</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                קובע אילו פריטי מגרש יוצגו בשקופיות
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => setBranchFilter("branch_4")}
                className={cn(
                  "flex flex-col items-start p-3.5 rounded-xl border text-right transition-all",
                  settings.branchFilter === "branch_4"
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-sm"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2 font-black text-sm text-foreground">
                  <span>מגרש 4 - החרש</span>
                  {settings.branchFilter === "branch_4" && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  מומלץ למסכי המגרש והרציף (חומרי מגרש)
                </span>
              </button>

              <button
                onClick={() => setBranchFilter("branch_1")}
                className={cn(
                  "flex flex-col items-start p-3.5 rounded-xl border text-right transition-all",
                  settings.branchFilter === "branch_1"
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-sm"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2 font-black text-sm text-foreground">
                  <span>סניף 1 - התלמיד</span>
                  {settings.branchFilter === "branch_1" && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  הזמנות ומשיכות סניף התלמיד
                </span>
              </button>

              <button
                onClick={() => setBranchFilter("all")}
                className={cn(
                  "flex flex-col items-start p-3.5 rounded-xl border text-right transition-all",
                  settings.branchFilter === "all"
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-sm"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2 font-black text-sm text-foreground">
                  <span>כל הסניפים במקביל</span>
                  {settings.branchFilter === "all" && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  איחוד הזמנות חרש + תלמיד
                </span>
              </button>
            </div>
          </div>

          {/* Behavior & Frequency Settings */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-black text-foreground">חוקי תצוגה והתנהגות טלוויזיה</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Prioritize Critical Products Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card/60">
                <div>
                  <div className="text-sm font-black text-foreground">
                    תעדוף מוצרים בחוסר רצפה קריטי
                  </div>
                  <div className="text-xs text-muted-foreground">
                    יציג ראשון מוצרים שמתחת לסף ביטחון
                  </div>
                </div>

                <button
                  onClick={() => setPrioritizeCritical(!settings.prioritizeCriticalProducts)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.prioritizeCriticalProducts ? "bg-primary" : "bg-secondary",
                  )}
                  role="switch"
                  aria-checked={settings.prioritizeCriticalProducts}
                >
                  <span
                    className={cn(
                      "inline-block size-4 transform rounded-full bg-white transition-transform",
                      settings.prioritizeCriticalProducts ? "-translate-x-6" : "-translate-x-1",
                    )}
                  />
                </button>
              </div>

              {/* Pause on Hover Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card/60">
                <div>
                  <div className="text-sm font-black text-foreground">
                    עצירת טיימר בעת מעבר עכבר (Pause on Hover)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    מאפשר לסדרן להתעמק בנתוני הפריט ללא מעבר שקופית
                  </div>
                </div>

                <button
                  onClick={() => setPauseOnHover(!settings.pauseOnHover)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.pauseOnHover ? "bg-primary" : "bg-secondary",
                  )}
                  role="switch"
                  aria-checked={settings.pauseOnHover}
                >
                  <span
                    className={cn(
                      "inline-block size-4 transform rounded-full bg-white transition-transform",
                      settings.pauseOnHover ? "-translate-x-6" : "-translate-x-1",
                    )}
                  />
                </button>
              </div>

              {/* Dwell time per product slide */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-card/60">
                <div>
                  <div className="text-sm font-black text-foreground">
                    זמן שהייה פר שקופית מוצר בסבב
                  </div>
                  <div className="text-xs text-muted-foreground">
                    כמה שניות כל כרטיס מוצר מוצג לפני מעבר אוטומטי למוצר הבא
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={settings.productSlideIntervalSeconds}
                    onChange={(e) => setProductSlideInterval(Number(e.target.value))}
                    className="w-36 accent-primary"
                  />
                  <span className="w-16 rounded-lg bg-card border border-border px-2.5 py-1 text-center font-black text-primary text-sm tabular-nums shadow-sm">
                    {settings.productSlideIntervalSeconds} שנ׳
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Slide Reorder & Dwell Configuration List */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <h3 className="text-sm font-black text-foreground">
                  רשימת שקופיות, סדר הצגה וזמני שהייה אישיים
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                השתמש בחיצים כדי לשנות את סדר ההצגה בטלוויזיה
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {settings.slides.map((slide, index) => {
                const isFirst = index === 0;
                const isLast = index === settings.slides.length - 1;

                return (
                  <div
                    key={slide.id}
                    className={cn(
                      "flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border p-3.5 transition-all",
                      slide.enabled
                        ? "border-border/90 bg-card shadow-sm"
                        : "border-border/40 bg-card/30 opacity-60",
                    )}
                  >
                    {/* Left Side: Order Controls & Slide Info */}
                    <div className="flex items-center gap-3">
                      {/* Order Index & Direction Buttons */}
                      <div className="flex items-center gap-1">
                        <span className="grid size-6 place-items-center rounded-lg bg-secondary text-xs font-black tabular-nums text-foreground">
                          {index + 1}
                        </span>

                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveSlide(slide.id, "up")}
                            disabled={isFirst}
                            className="grid size-4 place-items-center rounded bg-card hover:bg-secondary border border-border disabled:opacity-20 transition"
                            title="הזז למעלה"
                          >
                            <ArrowUp className="size-2.5" />
                          </button>
                          <button
                            onClick={() => moveSlide(slide.id, "down")}
                            disabled={isLast}
                            className="grid size-4 place-items-center rounded bg-card hover:bg-secondary border border-border disabled:opacity-20 transition"
                            title="הזז למטה"
                          >
                            <ArrowDown className="size-2.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-foreground">{slide.title}</span>
                          {slide.id === "product-slide" && (
                            <span className="rounded-md bg-accent/20 text-accent px-1.5 py-0.5 text-[10px] font-black">
                              מוצרים חיים מהרצפה
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{slide.description}</p>
                      </div>
                    </div>

                    {/* Right Side: Dwell Time Slider & Toggle */}
                    <div className="flex items-center gap-4 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
                      {/* Dwell Time Slider */}
                      <div className="flex items-center gap-2">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="1"
                          value={slide.durationSeconds}
                          onChange={(e) => setSlideDuration(slide.id, Number(e.target.value))}
                          disabled={!slide.enabled}
                          className="w-24 accent-primary disabled:opacity-30"
                          title="משך שהייה בשניות"
                        />
                        <span className="w-12 text-center text-xs font-black tabular-nums text-foreground">
                          {slide.durationSeconds} שנ׳
                        </span>
                      </div>

                      {/* Toggle On/Off */}
                      <button
                        onClick={() => toggleSlide(slide.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all border",
                          slide.enabled
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25"
                            : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80 hover:text-foreground",
                        )}
                        title={slide.enabled ? "הסתר שקופית" : "הפעל שקופית"}
                      >
                        {slide.enabled ? (
                          <>
                            <Eye className="size-3.5" />
                            <span>מוצגת</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="size-3.5" />
                            <span>מוסתרת</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Custom Image URL */}
      {editingSkuUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-foreground">
                הגדרת כתובת תמונה למק״ט {editingSkuUrl.sku}
              </h4>
              <button
                onClick={() => setEditingSkuUrl(null)}
                className="size-7 rounded-lg grid place-items-center hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                כתובת אינטרנט של התמונה (Image URL):
              </label>
              <input
                type="url"
                value={editingSkuUrl.url}
                onChange={(e) => setEditingSkuUrl({ ...editingSkuUrl, url: e.target.value })}
                placeholder="https://..."
                className="w-full h-10 px-3 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {editingSkuUrl.url && (
              <div className="size-36 mx-auto rounded-xl overflow-hidden border border-border bg-black/20">
                <img
                  src={editingSkuUrl.url}
                  alt="תצוגה מקדימה"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setEditingSkuUrl(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary"
              >
                ביטול
              </button>
              <button
                onClick={handleSaveCustomImageUrl}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:bg-primary/90 shadow-sm"
              >
                שמור תמונה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-border/80 bg-card p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-md">
                    מק״ט: {previewItem.sku}
                  </span>
                  <h3 className="text-lg font-black text-foreground">{previewItem.cleanName}</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  תצוגה מקדימה של כרזת שומר המסך כפי שמוצגת בטלוויזיה
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="size-8 rounded-xl grid place-items-center hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border-2 border-border/90 bg-black shadow-inner flex items-center justify-center">
              <img
                src={previewItem.imageUrl}
                alt={previewItem.cleanName}
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/80">
              <span className="text-xs text-muted-foreground">
                יתרת רצפה: {previewItem.effectiveBalance} {previewItem.unit} · חסר להשלמה:{" "}
                {previewItem.deficitToRefill} {previewItem.unit}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const itemToEdit = previewItem;
                    setPreviewItem(null);
                    handleOpenEditProduct(itemToEdit);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary text-foreground transition"
                >
                  <Pencil className="size-3.5 text-primary" />
                  <span>ערוך שם ומק״ט</span>
                </button>
                <button
                  onClick={() => {
                    handleGenerateShortagePoster(previewItem);
                    setPreviewItem(null);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-black hover:bg-primary/90 shadow-sm"
                >
                  <Palette className="size-3.5" />
                  <span>הפק כרזה מעוצבת עכשיו</span>
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-secondary"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Product Name and SKU */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border/90 bg-card p-6 shadow-2xl flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Pencil className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">עריכת שם ומק״ט מוצר</h3>
                  <p className="text-xs text-muted-foreground">
                    הגדרה מותאמת אישית של כותרת המוצר והמק״ט המשודרים בשומרי המסך
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="size-8 rounded-xl grid place-items-center hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Baseline Info */}
            <div className="rounded-2xl border border-border/70 bg-secondary/40 p-3 text-xs flex flex-col gap-1">
              <span className="font-bold text-muted-foreground text-[11px]">
                ערכי ברירת מחדל בקטלוג/גיליון:
              </span>
              <div className="flex items-center justify-between font-mono text-[11px] text-foreground">
                <span>
                  מק״ט מקורי: <strong className="text-primary">{editingProduct.originalSku}</strong>
                </span>
                <span>
                  שם מקורי: <strong>{editingProduct.originalName}</strong>
                </span>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  שם מוצר לתצוגה בשומר מסך ובדשבורד:
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="הזן שם מוצר מעוצב..."
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-secondary/60 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[11px] text-muted-foreground">
                  יוצג בכותרת שקופית המוצר, בכרזת החוסר ובהתראות הרכש
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">מק״ט מוצר (SKU):</label>
                <input
                  type="text"
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  placeholder="הזן מק״ט (למשל: 11110)..."
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-secondary/60 text-sm font-mono font-black text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[11px] text-muted-foreground">
                  מספר המק״ט המודגש בתיבה הטכנולוגית בשומר המסך ובכרזת החוסר
                </span>
              </div>
            </div>

            {/* Live Preview Widget */}
            <div className="rounded-2xl border border-border/80 bg-black/40 p-3.5 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                תצוגה מקדימה כפי שתופיע על המסך:
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="rounded-lg bg-black/90 border border-primary/70 px-2.5 py-1 text-xs font-mono font-black text-primary shadow-sm">
                  מק״ט: {editingProduct.sku || "—"}
                </span>
                <span className="text-sm font-black text-foreground">
                  {editingProduct.name || "שם מוצר"}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-border/80">
              {editingProduct.isCustom ? (
                <button
                  onClick={handleResetProductMetadata}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  title="שחזר שם ומק״ט מקוריים מברירת המחדל"
                >
                  <RotateCcw className="size-3.5" />
                  <span>שחזר ערכי מקור</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSaveProductMetadata}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:bg-primary/90 shadow-md shadow-primary/20 transition active:scale-95"
                >
                  <Check className="size-4" />
                  <span>שמור שינויים</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
