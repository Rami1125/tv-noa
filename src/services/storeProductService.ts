import type { StoreProduct, LobbySignageSettings } from "@/types/storeProduct";

const STORE_PRODUCTS_STORAGE_KEY = "saban_store_products_data_v1";
const LOBBY_SETTINGS_STORAGE_KEY = "saban_lobby_settings_v1";

export const DEFAULT_LOBBY_SETTINGS: LobbySignageSettings = {
  slideDurationSeconds: 12,
  videoDurationSeconds: 30,
  dispatchInterruptSeconds: 60,
  enableDispatchInterrupt: true,
  enableMediaPlayback: true,
  enableMarketingTicker: true,
  showQrCode: true,
  transitionEffect: "fade",
};

// Initial verified building materials product catalog for H. Saban Ltd.
export const SEED_STORE_PRODUCTS: StoreProduct[] = [
  {
    sku: "SBN-110",
    name: "דבק שיש וגרניט פורצלן סבן C2TE 110",
    category: "דבקים ומליטה",
    price: "89 ₪",
    salePrice: "72 ₪",
    discountTag: "מבצע קבלנים 15%",
    images: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
    ],
    mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    mediaType: "youtube",
    coverageM2: "1.4 ק״ג למ״ר לכל מ״מ עובי",
    dryingTime: "ייבוש ראשוני: 3 שעות | דריכה: 24 שעות",
    applicationMethod: "מאלג׳ משונן 8-10 מ״מ בהדבקה כפולה",
    packaging: "שק 25 ק״ג (48 שקים במשטח)",
    marketingPhrase: "דבק הדגל של ח. סבן לפרויקטים מובילים — עמידות שיא בהחלקה והידבקות משופרת",
    isActive: true,
    displayDuration: 12,
  },
  {
    sku: "SBN-220",
    name: "רובה אקרילית אוטמת גמישה SabanSeal Pro",
    category: "איטום וגימור",
    price: "45 ₪",
    salePrice: "38 ₪",
    discountTag: "מחיר השקה בלעדי",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    ],
    coverageM2: "0.3 - 0.7 ק״ג למ״ר לפי רוחב המישק",
    dryingTime: "ייבוש למגע: שעתיים | שטיפה סופית: 48 שעות",
    applicationMethod: "מאלג׳ גומי ייעודי וספוג לח לניקוי מיידי",
    packaging: "דלי 5 ק״ג מוגן רטיבות (72 דליים במשטח)",
    marketingPhrase: "איטום מושלם נגד עובש ומים בחדרים רטובים ובריכות שחייה",
    isActive: true,
    displayDuration: 12,
  },
  {
    sku: "SBN-330",
    name: "טיח חוץ תרמי מתקדם סבן Thermo-750",
    category: "טיח ותרמי",
    price: "",
    discountTag: "מחיר מיוחד לפרויקטים",
    images: [
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    ],
    coverageM2: "4.5 ק״ג למ״ר בעובי 10 מ״מ",
    dryingTime: "ייבוש בין שכבות: 24 שעות | ייבוש סופי: 7 ימים",
    applicationMethod: "התזה במכונת טיח או מריחה ידנית במישרת",
    packaging: "שק 30 ליטר / 20 ק״ג (40 במשטח)",
    marketingPhrase: "בידוד תרמי ואקוסטי בתקן ישראלי 1045 — חיסכון משמעותי באנרגיה",
    isActive: true,
    displayDuration: 14,
  },
  {
    sku: "SBN-440",
    name: "ביטומן איטום אלסטומרי מהיר SabanFLEX-1K",
    category: "חומרי איטום",
    price: "195 ₪",
    salePrice: "165 ₪",
    discountTag: "הנחת כמות מעל 10 יח׳",
    images: [
      "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&q=80",
    ],
    coverageM2: "2.5 ק״ג למ״ר בשתי שכבות",
    dryingTime: "ייבוש שכבה ראשונה: 4 שעות | עמידות בגשם: 24 שעות",
    applicationMethod: "מברשת, רולר או מאלג׳ חלק",
    packaging: "פח 18 ק״ג אטום",
    marketingPhrase: "איטום יסודות, מרתפים וקורות קשר — כושר גישור סדקים פנומנלי",
    isActive: true,
    displayDuration: 12,
  },
  {
    sku: "SBN-550",
    name: "מלט לבן מובחר CEM I 52.5 R פורטלנד",
    category: "מלט ומליטה",
    price: "34 ₪",
    salePrice: "29 ₪",
    discountTag: "מבצע משטח מלא",
    images: [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    ],
    coverageM2: "בהתאם לתערובת הבטון או הטיח הרצויה",
    dryingTime: "התקשרות ראשונית: 90 דק׳ | חוזק סופי: 28 ימים",
    applicationMethod: "ערבול במיקסר עם חול שטוף ומים נקיים",
    packaging: "שק 25 ק״ג (64 שקים במשטח תקני)",
    marketingPhrase: "לובן מוחלט וחוזק לחיצה מקסימלי לבטון אדריכלי ושיחזור מבנים",
    isActive: true,
    displayDuration: 10,
  },
];

/**
 * Detects the media type from URL (YouTube, MP4 video, Google Slides)
 */
export function detectMediaType(url?: string): "youtube" | "video" | "presentation" | "none" {
  if (!url || typeof url !== "string") return "none";
  const lower = url.toLowerCase().trim();
  if (
    lower.includes("youtube.com/watch") ||
    lower.includes("youtu.be/") ||
    lower.includes("youtube.com/embed")
  ) {
    return "youtube";
  }
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.includes("video/mp4")
  ) {
    return "video";
  }
  if (lower.includes("docs.google.com/presentation") || lower.includes("slides.google.com")) {
    return "presentation";
  }
  return "none";
}

/**
 * Converts standard YouTube URLs to autoplay embed format
 */
export function formatYouTubeEmbedUrl(url?: string): string {
  if (!url) return "";
  let videoId = "";
  try {
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0] || "";
    } else if (url.includes("watch?v=")) {
      const parsed = new URL(url);
      videoId = parsed.searchParams.get("v") || "";
    } else if (url.includes("/embed/")) {
      videoId = url.split("/embed/")[1]?.split(/[?#]/)[0] || "";
    }
  } catch {
    /* ignore parse err */
  }

  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&iv_load_policy=3`;
  }
  return url;
}

/**
 * Robust CSV parser for Google Sheets "חנות" tab
 */
export function parseStoreProductsCsv(csvText: string): StoreProduct[] {
  if (!csvText || typeof csvText !== "string") return [];

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse CSV line handling quotes
  const parseLine = (line: string): string[] => {
    const res: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        res.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    res.push(current.trim());
    return res;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());

  // Helper to find column index with multiple Hebrew / English synonyms
  const findCol = (synonyms: string[]): number => {
    for (const syn of synonyms) {
      const lowerSyn = syn.toLowerCase();
      const idx = headers.findIndex(
        (h) =>
          h === lowerSyn ||
          h.includes(lowerSyn) ||
          h.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, "") ===
            lowerSyn.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, ""),
      );
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const colSku = findCol(['מק"ט', "מקט", "sku", "קוד"]);
  const colName = findCol(["שם מוצר", "שם", "name", "מוצר", "כותרת"]);
  const colCategory = findCol(["קטגוריה", "category", "מחלקה"]);
  const colPrice = findCol(["מחיר רגיל", "מחיר", "price"]);
  const colSalePrice = findCol([
    "מחיר מבצע",
    "הנחה",
    "מבצע",
    "salePrice",
    "discountTag",
    "מחיר מוזל",
  ]);
  const colImage1 = findCol(["תמונה 1", "תמונה", "image1", "image", "תמונה1"]);
  const colImage2 = findCol(["תמונה 2", "תמונה2", "image2"]);
  const colImage3 = findCol(["תמונה 3", "תמונה3", "image3"]);
  const colMediaUrl = findCol([
    "קישור מדיה",
    "מדיה",
    "mediaUrl",
    "וידאו",
    "video",
    "יוטיוב",
    "סרטון",
  ]);
  const colCoverage = findCol(['צריכה לפי מ"ר', "צריכה", "כיסוי", "coverageM2"]);
  const colDrying = findCol(["זמן ייבוש", "ייבוש", "dryingTime"]);
  const colApplication = findCol(["שיטת יישום", "יישום", "applicationMethod"]);
  const colPackaging = findCol(["אריזה", "packaging", "משקל"]);
  const colTicker = findCol(["משפט שיווקי לטיקר", "טיקר", "שיווקי", "marketingPhrase", "סלוגן"]);
  const colActive = findCol(["פעיל לתצוגה", "פעיל", "isActive", "סטטוס"]);
  const colDuration = findCol(["משך תצוגה בשניות", "משך", "displayDuration", "שניות"]);

  const products: StoreProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    const rawSku = (colSku !== -1 ? cells[colSku] : "") || `PROD-${i}`;
    const rawName = (colName !== -1 ? cells[colName] : "") || "";

    if (!rawName.trim()) continue; // Skip empty rows

    const images: string[] = [];
    if (colImage1 !== -1 && cells[colImage1]) images.push(cells[colImage1]);
    if (colImage2 !== -1 && cells[colImage2]) images.push(cells[colImage2]);
    if (colImage3 !== -1 && cells[colImage3]) images.push(cells[colImage3]);

    // If no images found, inject placeholder relevant building material image
    if (images.length === 0) {
      images.push(
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
      );
    }

    const rawActive = colActive !== -1 ? cells[colActive] : "";
    const isActive =
      rawActive.trim().toLowerCase() === "false" || rawActive.trim() === "0" ? false : true;

    const rawDuration = colDuration !== -1 ? parseInt(cells[colDuration], 10) : 12;
    const displayDuration = !isNaN(rawDuration) && rawDuration > 2 ? rawDuration : 12;

    const mediaUrl = colMediaUrl !== -1 ? cells[colMediaUrl] : undefined;
    const mediaType = detectMediaType(mediaUrl);

    products.push({
      sku: rawSku.trim(),
      name: rawName.trim(),
      category: (colCategory !== -1 ? cells[colCategory] : "חומרי בניין") || "חומרי בניין",
      price: colPrice !== -1 && cells[colPrice] ? cells[colPrice].trim() : undefined,
      salePrice:
        colSalePrice !== -1 && cells[colSalePrice] ? cells[colSalePrice].trim() : undefined,
      discountTag:
        colSalePrice !== -1 && cells[colSalePrice] ? cells[colSalePrice].trim() : undefined,
      images,
      mediaUrl: mediaUrl || undefined,
      mediaType,
      coverageM2: colCoverage !== -1 && cells[colCoverage] ? cells[colCoverage].trim() : undefined,
      dryingTime: colDrying !== -1 && cells[colDrying] ? cells[colDrying].trim() : undefined,
      applicationMethod:
        colApplication !== -1 && cells[colApplication] ? cells[colApplication].trim() : undefined,
      packaging:
        colPackaging !== -1 && cells[colPackaging] ? cells[colPackaging].trim() : undefined,
      marketingPhrase: colTicker !== -1 && cells[colTicker] ? cells[colTicker].trim() : undefined,
      isActive,
      displayDuration,
    });
  }

  return products;
}

/**
 * Loads products: tries local storage first, then fetches from `/api/sheets/store-products`
 */
export async function getStoreProducts(forceRefresh = false): Promise<StoreProduct[]> {
  // Check local storage overrides
  if (!forceRefresh && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORE_PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoreProduct[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
  }

  // Fetch from server proxy
  try {
    const res = await fetch(`/api/sheets/store-products?_t=${Date.now()}`);
    if (res.ok) {
      const csvText = await res.text();
      const products = parseStoreProductsCsv(csvText);
      if (products.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORE_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        }
        return products;
      }
    }
  } catch (err) {
    console.warn("[StoreProductService] Error fetching store products CSV:", err);
  }

  // Fallback to seed
  return SEED_STORE_PRODUCTS;
}

/**
 * Finds a single product by SKU
 */
export async function getProductBySku(sku: string): Promise<StoreProduct | null> {
  const all = await getStoreProducts(false);
  const clean = sku.trim().toLowerCase();
  const match = all.find((p) => p.sku.trim().toLowerCase() === clean);
  return match || null;
}

/**
 * Saves store products to local storage
 */
export function saveLocalProducts(products: StoreProduct[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error("[StoreProductService] Failed to save products:", err);
    }
  }
}

/**
 * Gets lobby signage settings
 */
export function getLobbySettings(): LobbySignageSettings {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOBBY_SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_LOBBY_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      /* ignore */
    }
  }
  return DEFAULT_LOBBY_SETTINGS;
}

/**
 * Updates lobby signage settings
 */
export function saveLobbySettings(settings: Partial<LobbySignageSettings>): LobbySignageSettings {
  const current = getLobbySettings();
  const next = { ...current, ...settings };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOBBY_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}
