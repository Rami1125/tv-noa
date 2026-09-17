/**
 * ============================================================================
 * שירות ניהול מוצרים והפקת תמונות חוסר מעוצבות — ח. סבן חומרי בניין
 * קובץ: src/services/productImageService.ts
 *
 * תפקיד המודול:
 * 1. שאיבת רשימת כל המוצרים הפעילים מהגיליון וממפת המלאי בזמן אמת.
 * 2. יצירת תמונת חוסר מעוצבת (Shortage Poster) הכוללת כותרת חוסר בולטת,
 *    מק"ט ענק בעיצוב טכנולוגי, ושם מוצר מוגדל ומודגש לתצוגה בשומר המסך.
 * 3. שמירת תמונות מותאמות אישית במאגר המקומי (LocalStorage) לשילוב מלא בשומר המסך.
 * ============================================================================
 */

import type { Order } from "@/types/dispatch";
import {
  PREDEFINED_SAFETY_STOCKS,
  PRODUCT_IMAGES,
  type SafetyStockRule,
} from "@/services/analyticsService";
import { getUnitsPerPallet } from "@/services/inventoryService";

const STORAGE_CUSTOM_IMAGES_KEY = "saban_custom_product_images_v2";
const STORAGE_SHORTAGE_POSTERS_KEY = "saban_shortage_posters_v2";
const STORAGE_CUSTOM_METADATA_KEY = "saban_custom_product_metadata_v2";

export interface CustomProductMetadata {
  customSku?: string;
  customName?: string;
  updatedAt?: string;
}

export interface SheetProductItem {
  sku: string;
  originalSku: string;
  name: string;
  originalName: string;
  cleanName: string;
  isCustomMetadata?: boolean;
  category: "cement" | "big_bag" | "block" | "dry_mix" | "other";
  unit: string;
  initialBase: number;
  safetyThreshold: number;
  actualDrawn: number;
  reserved: number;
  totalDemanded: number;
  effectiveBalance: number;
  percentRemaining: number;
  isCritical: boolean;
  isWarning: boolean;
  deficitToRefill: number;
  palletsToRefill: number;
  ordersCount: number;
  imageUrl: string;
  shortagePosterUrl: string;
  isCustomImage: boolean;
  warehouseBranch: string;
}

/**
 * מפת תמונות מוצר איכותיות (ברירת מחדל) לקטלוג חומרי הבניין של ח. סבן
 */
export const HIGH_RES_PRODUCT_CATALOG_IMAGES: Record<string, string> = {
  "10002":
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80", // מלט נשר 25 ק"ג
  "11511":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", // בלה סומסום
  "11501":
    "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1200&q=80", // בלה חול מנופה
  "11551":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80", // טיט שק / בלה
  "18094":
    "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80", // בלוק 20 / איטונג
  "18095":
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80", // בלוק מחיצה 10
  "12204":
    "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80", // בלוקי בטון משטח
  "60088":
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80", // דבק ריצופית
  "60089":
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80", // דבק פלסטומר 603
  "19001":
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", // לוח עץ פיני
  "19002":
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80", // מייק 10
  "19003":
    "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80", // איסכורית
  "11600":
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80", // פוליגג משוריין
};

/**
 * יצירת תמונת חוסר מעוצבת ברזולוציה גבוהה (SVG Data URL)
 * כוללת:
 * - כותרת חוסר רצפה בולטת ומעוצבת
 * - מק"ט ענק וזוהר בתגית טכנולוגית
 * - שם מוצר מוגדל, מודגש ומעוצב
 * - מדדי חוסר במשטחים ויחידות
 */
export function generateShortagePosterSvg(params: {
  sku: string;
  name: string;
  category?: string;
  deficit?: number;
  unit?: string;
  safetyThreshold?: number;
  effectiveBalance?: number;
  isCritical?: boolean;
}): string {
  const {
    sku,
    name,
    category = "general",
    deficit = 0,
    unit = "יח'",
    safetyThreshold = 80,
    effectiveBalance = 0,
    isCritical = true,
  } = params;

  const accentColor = isCritical ? "#ef4444" : "#f59e0b"; // Red or Amber
  const glowColor = isCritical ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.4)";
  const statusLabel = isCritical
    ? "חוסר רצפה קריטי — דורש רכש מיידי"
    : "אזהרת מלאי נמוך — מתחת לסף ביטחון";
  const unitsPerPallet = getUnitsPerPallet(category, name);
  const pallets = deficit > 0 ? Math.max(1, Math.ceil(deficit / unitsPerPallet)) : 0;

  // פיצול שם המוצר אם הוא ארוך לצורך תצוגה דו-שורתית נקייה
  const words = name.split(" ");
  let line1 = name;
  let line2 = "";
  if (words.length > 4) {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(" ");
    line2 = words.slice(mid).join(" ");
  }

  // תבנית SVG וקטורית מתקדמת 1200x800
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <!-- Dark Industrial Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>

    <!-- Glowing Accent Gradient -->
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="100%" stop-color="#f97316" />
    </linearGradient>

    <!-- Badge Background -->
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
    </linearGradient>

    <!-- Shadow filters -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" fill="url(#bgGrad)" />

  <!-- Industrial Subtle Grid Pattern -->
  <g opacity="0.07" stroke="#94a3b8" stroke-width="1">
    <line x1="0" y1="100" x2="1200" y2="100" />
    <line x1="0" y1="200" x2="1200" y2="200" />
    <line x1="0" y1="300" x2="1200" y2="300" />
    <line x1="0" y1="400" x2="1200" y2="400" />
    <line x1="0" y1="500" x2="1200" y2="500" />
    <line x1="0" y1="600" x2="1200" y2="600" />
    <line x1="0" y1="700" x2="1200" y2="700" />
    <line x1="150" y1="0" x2="150" y2="800" />
    <line x1="300" y1="0" x2="300" y2="800" />
    <line x1="450" y1="0" x2="450" y2="800" />
    <line x1="600" y1="0" x2="600" y2="800" />
    <line x1="750" y1="0" x2="750" y2="800" />
    <line x1="900" y1="0" x2="900" y2="800" />
    <line x1="1050" y1="0" x2="1050" y2="800" />
  </g>

  <!-- Top Accent Danger Border Line -->
  <rect x="0" y="0" width="1200" height="12" fill="url(#accentGrad)" />

  <!-- Emergency Ambient Glow Spot -->
  <circle cx="600" cy="380" r="320" fill="${glowColor}" opacity="0.25" filter="url(#glow)" />

  <!-- Inner Framed Container -->
  <rect x="50" y="40" width="1100" height="710" rx="36" fill="url(#badgeGrad)" stroke="#334155" stroke-width="2" filter="url(#softShadow)" />

  <!-- Corner Tech Accents -->
  <path d="M 70 90 L 70 60 L 100 60" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" />
  <path d="M 1130 90 L 1130 60 L 1100 60" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" />
  <path d="M 70 700 L 70 730 L 100 730" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" />
  <path d="M 1130 700 L 1130 730 L 1100 730" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" />

  <!-- Top Header Section: Brand & Warning Badge -->
  <g id="header-group">
    <!-- Brand Label -->
    <text x="1100" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#94a3b8" text-anchor="end" direction="rtl">
      חומרי בניין ח. סבן (1994) בע״מ · מגרש 4 החרש
    </text>

    <!-- Emergency Status Pill -->
    <rect x="80" y="75" width="460" height="46" rx="23" fill="${accentColor}" fill-opacity="0.18" stroke="${accentColor}" stroke-width="2" />
    <circle cx="108" cy="98" r="8" fill="${accentColor}" filter="url(#glow)" />
    <text x="130" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900" fill="#ffffff" direction="rtl">
      ${statusLabel}
    </text>
  </g>

  <!-- Center Big SKU Badge (מק"ט ענק מעוצב) -->
  <g id="sku-group" transform="translate(0, 30)">
    <rect x="360" y="140" width="480" height="88" rx="24" fill="#030712" stroke="${accentColor}" stroke-width="3" filter="url(#softShadow)" />
    <text x="600" y="198" font-family="system-ui, -apple-system, monospace" font-size="44" font-weight="900" fill="#f8fafc" letter-spacing="4" text-anchor="middle" direction="rtl">
      מק״ט: <tspan fill="${accentColor}">${sku}</tspan>
    </text>
  </g>

  <!-- Giant Styled Product Name (שם מוצר גדול יותר ומעוצב) -->
  <g id="product-name-group" transform="translate(0, 35)">
    ${
      line2
        ? `<text x="600" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="900" fill="#ffffff" text-anchor="middle" direction="rtl" filter="url(#softShadow)">${line1}</text>
           <text x="600" y="390" font-family="system-ui, -apple-system, sans-serif" font-size="50" font-weight="900" fill="#e2e8f0" text-anchor="middle" direction="rtl" filter="url(#softShadow)">${line2}</text>`
        : `<text x="600" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="900" fill="#ffffff" text-anchor="middle" direction="rtl" filter="url(#softShadow)">${line1}</text>`
    }
  </g>

  <!-- Metrics Grid: Deficit / Pallets / Minimum Threshold -->
  <g id="metrics-group" transform="translate(0, 45)">
    <!-- Box 1: Deficit to Refill (חסר להשלמה) -->
    <rect x="750" y="440" width="350" height="150" rx="22" fill="#1e1b4b" fill-opacity="0.6" stroke="#4338ca" stroke-width="2" />
    <text x="1070" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#a5b4fc" text-anchor="end" direction="rtl">
      חוסר רצפה נדרש לרכש:
    </text>
    <text x="1070" y="545" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ef4444" text-anchor="end" direction="rtl">
      ${deficit.toLocaleString()} <tspan font-size="22" font-weight="700" fill="#f87171">${unit}</tspan>
    </text>
    <text x="1070" y="575" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#cbd5e1" text-anchor="end" direction="rtl">
      סה״כ חומר שירד מהמלאי היום
    </text>

    <!-- Box 2: Standard Pallets / Full Trailer (משטחים תקניים) -->
    <rect x="425" y="440" width="300" height="150" rx="22" fill="#172554" fill-opacity="0.6" stroke="#2563eb" stroke-width="2" />
    <text x="700" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#93c5fd" text-anchor="end" direction="rtl">
      עיגול למשטחים מלאים:
    </text>
    <text x="700" y="545" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#60a5fa" text-anchor="end" direction="rtl">
      ~${pallets} <tspan font-size="22" font-weight="700" fill="#bfdbfe">משטחים</tspan>
    </text>
    <text x="700" y="575" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#cbd5e1" text-anchor="end" direction="rtl">
      ${unitsPerPallet} ${unit} בכל משטח תקני
    </text>

    <!-- Box 3: Floor Balance vs Safety (יתרה נוכחית) -->
    <rect x="100" y="440" width="300" height="150" rx="22" fill="#18181b" fill-opacity="0.7" stroke="#3f3f46" stroke-width="2" />
    <text x="375" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#d4d4d8" text-anchor="end" direction="rtl">
      יתרה נוכחית במגרש:
    </text>
    <text x="375" y="545" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="${accentColor}" text-anchor="end" direction="rtl">
      ${effectiveBalance.toLocaleString()} <tspan font-size="20" font-weight="600" fill="#a1a1aa">${unit}</tspan>
    </text>
    <text x="375" y="575" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#a1a1aa" text-anchor="end" direction="rtl">
      סף מינימום ביטחון: ${safetyThreshold} ${unit}
    </text>
  </g>

  <!-- Bottom Dispatch Bar -->
  <g id="footer-group">
    <rect x="80" y="655" width="1040" height="60" rx="16" fill="#020617" stroke="#1e293b" stroke-width="1.5" />
    <text x="1100" y="692" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#f8fafc" text-anchor="end" direction="rtl">
      ⚡ מסונכרן חי עם שומר מסך טלוויזיה · מערכת סידור והפצה ח. סבן SabanOS
    </text>
    <text x="105" y="692" font-family="monospace" font-size="15" font-weight="700" fill="#64748b">
      SABAN-DISPATCH // SHORTAGE-ALERT-PASS-1
    </text>
  </g>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * קבלת מפת התמונות המותאמות אישית מ-LocalStorage
 */
export function getStoredCustomProductImages(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_IMAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * קבלת מפת כרזות החוסר המעוצבות מ-LocalStorage
 */
export function getStoredShortagePosters(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_SHORTAGE_POSTERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * שמירת תמונה מותאמת אישית למוצר
 */
export function saveCustomProductImage(sku: string, imageUrl: string): void {
  if (typeof window === "undefined" || !sku) return;
  try {
    const current = getStoredCustomProductImages();
    current[sku] = imageUrl;
    localStorage.setItem(STORAGE_CUSTOM_IMAGES_KEY, JSON.stringify(current));
    // Trigger storage event for cross-component sync
    window.dispatchEvent(
      new CustomEvent("saban-product-images-updated", { detail: { sku, imageUrl } }),
    );
  } catch (err) {
    console.error("Failed to save custom product image:", err);
  }
}

/**
 * שמירת כרזת חוסר מעוצבת למוצר
 */
export function saveCustomShortagePoster(sku: string, posterDataUrl: string): void {
  if (typeof window === "undefined" || !sku) return;
  try {
    const current = getStoredShortagePosters();
    current[sku] = posterDataUrl;
    localStorage.setItem(STORAGE_SHORTAGE_POSTERS_KEY, JSON.stringify(current));
    window.dispatchEvent(
      new CustomEvent("saban-product-images-updated", { detail: { sku, posterDataUrl } }),
    );
  } catch (err) {
    console.error("Failed to save shortage poster:", err);
  }
}

/**
 * איפוס כל התמונות המותאמות לברירת מחדל
 */
export function resetCustomProductImages(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_CUSTOM_IMAGES_KEY);
    localStorage.removeItem(STORAGE_SHORTAGE_POSTERS_KEY);
    window.dispatchEvent(new CustomEvent("saban-product-images-updated"));
  } catch (err) {
    console.error("Failed to reset custom images:", err);
  }
}

/**
 * קבלת מפת שמות ומק״טים מותאמים אישית מ-LocalStorage
 */
export function getStoredProductMetadata(): Record<string, CustomProductMetadata> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_METADATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * שמירת שם מוצר ומק״ט מותאמים אישית (נשמר לפי המק״ט/מזהה המקורי)
 */
export function saveProductMetadata(
  originalSkuOrId: string,
  data: { customSku?: string; customName?: string },
): void {
  if (typeof window === "undefined" || !originalSkuOrId) return;
  try {
    const current = getStoredProductMetadata();
    const customSku = data.customSku?.trim();
    const customName = data.customName?.trim();

    current[originalSkuOrId] = {
      customSku: customSku ? customSku : undefined,
      customName: customName ? customName : undefined,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_CUSTOM_METADATA_KEY, JSON.stringify(current));
    window.dispatchEvent(
      new CustomEvent("saban-product-images-updated", {
        detail: { originalSkuOrId, customSku, customName },
      }),
    );
  } catch (err) {
    console.error("Failed to save product metadata:", err);
  }
}

/**
 * שחזור פרטי מוצר (שם ומק״ט) לברירת מחדל
 */
export function resetProductMetadata(originalSkuOrId: string): void {
  if (typeof window === "undefined" || !originalSkuOrId) return;
  try {
    const current = getStoredProductMetadata();
    delete current[originalSkuOrId];
    localStorage.setItem(STORAGE_CUSTOM_METADATA_KEY, JSON.stringify(current));
    window.dispatchEvent(
      new CustomEvent("saban-product-images-updated", {
        detail: { originalSkuOrId, reset: true },
      }),
    );
  } catch (err) {
    console.error("Failed to reset product metadata:", err);
  }
}

/**
 * קבלת התמונה המתאימה למוצר — לוקח בחשבון האם המוצר בחוסר
 */
export function resolveProductImage(
  sku: string,
  category: string,
  isShortage = false,
  productName = "",
  deficit = 0,
  unit = "יח'",
  safetyThreshold = 80,
  effectiveBalance = 0,
): string {
  const customImages = getStoredCustomProductImages();
  const shortagePosters = getStoredShortagePosters();

  // 1. אם המוצר בחוסר ויש כרזת חוסר שמורה במאגר
  if (isShortage && shortagePosters[sku]) {
    return shortagePosters[sku];
  }

  // 2. אם המוצר בחוסר וטרם נשמרה כרזה, נייצר כרזת חוסר מעוצבת במקום!
  if (isShortage && productName) {
    return generateShortagePosterSvg({
      sku,
      name: productName,
      category,
      deficit,
      unit,
      safetyThreshold,
      effectiveBalance,
      isCritical: true,
    });
  }

  // 3. תמונה שהוגדרה ידנית על ידי המנהל
  if (customImages[sku]) {
    return customImages[sku];
  }

  // 4. תמונת קטלוג איכותית
  if (HIGH_RES_PRODUCT_CATALOG_IMAGES[sku]) {
    return HIGH_RES_PRODUCT_CATALOG_IMAGES[sku];
  }

  // 5. תמונת קטגוריה בסיסית
  if (PRODUCT_IMAGES[sku]) {
    return PRODUCT_IMAGES[sku];
  }

  return PRODUCT_IMAGES[category] || PRODUCT_IMAGES.default;
}

/**
 * שליפת ועיבוד כלל המוצרים הפעילים מתוך גיליון ההזמנות וספי הביטחון
 */
export function extractProductsFromSheetOrders(
  orders: Order[],
  branchFilter: "all" | "branch_1" | "branch_4" = "all",
): SheetProductItem[] {
  const customImages = getStoredCustomProductImages();
  const shortagePosters = getStoredShortagePosters();
  const customMetadata = getStoredProductMetadata();

  // 1. צבירת כמויות משיכה מההזמנות
  const demandedMap = new Map<
    string,
    { actualDrawn: number; reserved: number; ordersCount: number }
  >();

  orders.forEach((o) => {
    const isBranchRelevant =
      branchFilter === "all"
        ? true
        : branchFilter === "branch_4"
          ? /סניף 4|מחסן 4|החורש|חורש/i.test(o.warehouse) ||
            !/סניף 1|מחסן 1|תלמיד/i.test(o.warehouse)
          : /סניף 1|מחסן 1|תלמיד/i.test(o.warehouse);

    if (!isBranchRelevant) return;

    const isDelivered = ["סופק", "יצא לדרך", "בהעמסה"].includes(o.status);
    const isReserved = ["בהכנה", "ממתין", "הוקצה"].includes(o.status);

    // עיבוד פריטים מובנים (Order.items)
    if (Array.isArray(o.items)) {
      o.items.forEach((it) => {
        const skuKey = (it.sku || it.name).trim();
        if (!skuKey) return;
        const curr = demandedMap.get(skuKey) || { actualDrawn: 0, reserved: 0, ordersCount: 0 };
        if (isDelivered) curr.actualDrawn += it.quantity || 1;
        if (isReserved) curr.reserved += it.quantity || 1;
        curr.ordersCount += 1;
        demandedMap.set(skuKey, curr);
      });
    }

    // חיפוש בלות ענק
    if (o.logisticsMetrics?.bellaBags && o.logisticsMetrics.bellaBags > 0) {
      const bKey = "11511";
      const curr = demandedMap.get(bKey) || { actualDrawn: 0, reserved: 0, ordersCount: 0 };
      if (isDelivered) curr.actualDrawn += o.logisticsMetrics.bellaBags;
      if (isReserved) curr.reserved += o.logisticsMetrics.bellaBags;
      curr.ordersCount += 1;
      demandedMap.set(bKey, curr);
    }
  });

  // 2. איחוד עם מוצרי הבסיס המוגדרים בקטלוג
  const results: SheetProductItem[] = PREDEFINED_SAFETY_STOCKS.map((rule) => {
    const originalSku = rule.sku || rule.productName;
    const originalName = rule.productName;
    const meta = customMetadata[originalSku] || customMetadata[originalName];
    const effectiveSku = meta?.customSku?.trim() || originalSku;
    const effectiveName = meta?.customName?.trim() || originalName;
    const isCustomMetadata = Boolean(
      (meta?.customSku && meta.customSku.trim() !== originalSku) ||
      (meta?.customName && meta.customName.trim() !== originalName),
    );

    const usage = demandedMap.get(effectiveSku) ||
      demandedMap.get(originalSku) ||
      demandedMap.get(effectiveName) ||
      demandedMap.get(originalName) || {
        actualDrawn: 0,
        reserved: 0,
        ordersCount: 0,
      };

    const totalDemanded = usage.actualDrawn + usage.reserved;
    const initialBase = rule.initialStock > 0 ? rule.initialStock : 500;
    const safetyThreshold = rule.safetyStockLevel > 0 ? rule.safetyStockLevel : 50;

    // יתרת רצפה אפקטיבית
    const effectiveBalance = Math.max(0, initialBase - totalDemanded);
    const percentRemaining = Math.max(
      0,
      Math.min(100, Math.round((effectiveBalance / initialBase) * 100)),
    );

    const isCritical =
      effectiveBalance <= Math.floor(safetyThreshold * 0.5) || totalDemanded >= initialBase;
    const isWarning = !isCritical && effectiveBalance <= safetyThreshold;
    const deficitToRefill = Math.max(0, totalDemanded);

    const unitsPerPallet = getUnitsPerPallet(rule.category, rule.productName);
    const palletsToRefill =
      deficitToRefill > 0 ? Math.max(1, Math.ceil(deficitToRefill / unitsPerPallet)) : 0;

    const isCustomImage = Boolean(customImages[effectiveSku] || customImages[originalSku]);
    const imageUrl =
      customImages[effectiveSku] ||
      customImages[originalSku] ||
      HIGH_RES_PRODUCT_CATALOG_IMAGES[effectiveSku] ||
      HIGH_RES_PRODUCT_CATALOG_IMAGES[originalSku] ||
      PRODUCT_IMAGES[effectiveSku] ||
      PRODUCT_IMAGES[originalSku] ||
      PRODUCT_IMAGES[rule.category] ||
      PRODUCT_IMAGES.default;

    const shortagePosterUrl =
      shortagePosters[effectiveSku] ||
      shortagePosters[originalSku] ||
      generateShortagePosterSvg({
        sku: effectiveSku,
        name: effectiveName,
        category: rule.category,
        deficit: deficitToRefill,
        unit: rule.unit,
        safetyThreshold,
        effectiveBalance,
        isCritical,
      });

    return {
      sku: effectiveSku,
      originalSku,
      name: effectiveName,
      originalName,
      cleanName: effectiveName,
      isCustomMetadata,
      category: rule.category,
      unit: rule.unit,
      initialBase,
      safetyThreshold,
      actualDrawn: usage.actualDrawn,
      reserved: usage.reserved,
      totalDemanded,
      effectiveBalance,
      percentRemaining,
      isCritical,
      isWarning,
      deficitToRefill,
      palletsToRefill,
      ordersCount: usage.ordersCount,
      imageUrl,
      shortagePosterUrl,
      isCustomImage,
      warehouseBranch:
        branchFilter === "branch_4"
          ? "מגרש 4 החרש"
          : branchFilter === "branch_1"
            ? "סניף 1 התלמיד"
            : "כל המחסנים",
    };
  });

  // סידור: חוסרים קריטיים ראשונים, לאחר מכן אזהרות, לאחר מכן לפי כמות משיכה
  results.sort((a, b) => {
    if (a.isCritical && !b.isCritical) return -1;
    if (!a.isCritical && b.isCritical) return 1;
    if (a.isWarning && !b.isWarning) return -1;
    if (!a.isWarning && b.isWarning) return 1;
    return b.totalDemanded - a.totalDemanded;
  });

  return results;
}
