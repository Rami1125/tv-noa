import { useState, useEffect } from "react";
import {
  BadgePercent,
  Check,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Sliders,
  Sparkles,
  Trash2,
  Tv,
} from "lucide-react";
import type { StoreProduct, LobbySignageSettings } from "@/types/storeProduct";
import {
  getStoreProducts,
  saveLocalProducts,
  getLobbySettings,
  saveLobbySettings,
  SEED_STORE_PRODUCTS,
} from "@/services/storeProductService";
import { LobbySignageOrchestrator } from "@/components/lobby/LobbySignageOrchestrator";
import { cn } from "@/lib/utils";

export function LobbyAdminView() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [settings, setSettings] = useState<LobbySignageSettings>(getLobbySettings());
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "ok" | "err" } | null>(
    null,
  );

  // Check stored PIN auth session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("saban_lobby_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Load products & settings
  useEffect(() => {
    async function init() {
      const list = await getStoreProducts(false);
      setProducts(list);
      if (list.length > 0) {
        setSelectedSku(list[0].sku);
      }
    }
    void init();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === "1994") {
      setIsAuthenticated(true);
      setAuthError(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("saban_lobby_admin_auth", "true");
      }
    } else {
      setAuthError(true);
    }
  };

  const selectedProduct = products.find((p) => p.sku === selectedSku) || products[0];

  const handleUpdateProduct = (updated: StoreProduct) => {
    const next = products.map((p) => (p.sku === updated.sku ? updated : p));
    setProducts(next);
    saveLocalProducts(next);
    setStatusMessage({ text: "השינויים נשמרו בזיכרון המערכת!", type: "ok" });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleProductActive = (sku: string) => {
    const next = products.map((p) => (p.sku === sku ? { ...p, isActive: !p.isActive } : p));
    setProducts(next);
    saveLocalProducts(next);
  };

  const handleToggleSaleMode = (sku: string) => {
    const next = products.map((p) => {
      if (p.sku !== sku) return p;
      const isCurrentlySale = Boolean(p.salePrice || p.discountTag);
      return {
        ...p,
        salePrice: isCurrentlySale ? "" : "49 ₪",
        discountTag: isCurrentlySale ? "" : "מבצע מיוחד",
      };
    });
    setProducts(next);
    saveLocalProducts(next);
  };

  const handleSyncFromSheets = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const refreshed = await getStoreProducts(true);
      setProducts(refreshed);
      if (refreshed.length > 0) {
        setSelectedSku(refreshed[0].sku);
      }
      setStatusMessage({
        text: `סונכרנו בהצלחה ${refreshed.length} מוצרים מגיליון חנות!`,
        type: "ok",
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: "שגיאה במשיכת נתונים מ-Google Sheets", type: "err" });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleSaveSettings = (partial: Partial<LobbySignageSettings>) => {
    const next = saveLobbySettings(partial);
    setSettings(next);
    setStatusMessage({ text: "הגדרות השילוט עודכנו בהצלחה!", type: "ok" });
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleAddNewProduct = () => {
    const newSku = `SBN-${Math.floor(100 + Math.random() * 900)}`;
    const newProd: StoreProduct = {
      sku: newSku,
      name: "מוצר חדש לקטלוג ח. סבן",
      category: "חומרי בניין",
      price: "99 ₪",
      images: [
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
      ],
      coverageM2: "1.5 ק״ג למ״ר",
      dryingTime: "24 שעות",
      applicationMethod: "מאלג׳ משונן",
      packaging: "שק 25 ק״ג",
      marketingPhrase: "איכות ללא פשרות לפרויקטים מובילים",
      isActive: true,
      displayDuration: 12,
    };
    const next = [newProd, ...products];
    setProducts(next);
    setSelectedSku(newSku);
    saveLocalProducts(next);
  };

  const handleDeleteProduct = (sku: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את מוצר ${sku}?`)) return;
    const next = products.filter((p) => p.sku !== sku);
    setProducts(next);
    if (next.length > 0) setSelectedSku(next[0].sku);
    saveLocalProducts(next);
  };

  // PIN Protection Screen
  if (!isAuthenticated) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-stone-900 p-4 text-white font-sans"
      >
        <div className="w-full max-w-sm rounded-3xl border border-stone-700 bg-stone-800 p-8 shadow-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-600 text-white mb-4 shadow-lg">
            <Lock className="size-6" />
          </div>

          <h2 className="text-xl font-black">כניסת מנהל לשילוט הלובי</h2>
          <p className="mt-1 text-xs text-stone-400">
            הזן קוד PIN (שנת ייסוד החברה) כדי לגשת לעריכת הקטלוג והסימולטור
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="קוד PIN (1994)"
              autoFocus
              className="w-full rounded-xl border border-stone-600 bg-stone-900/80 px-4 py-3 text-center font-mono text-xl tracking-widest text-white placeholder:text-stone-500 focus:border-sky-500 focus:outline-none"
            />

            {authError && (
              <p className="text-xs font-bold text-rose-400">קוד PIN שגוי. נסה שוב (1994).</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-sky-600 py-3 text-sm font-black text-white transition hover:bg-sky-500 active:scale-98 shadow-md"
            >
              כניסה למרכז הבקרה
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="flex h-screen flex-col bg-stone-950 text-slate-100 font-sans overflow-hidden"
    >
      {/* Top Navbar */}
      <header className="flex shrink-0 items-center justify-between border-b border-stone-800 bg-stone-900 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-600 text-white font-black">
            סבן
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              <span>מרכז שליטה ובקרה · שילוט לובי ודפי נחיתה</span>
              <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-400">
                Lobby Studio 1994
              </span>
            </h1>
            <p className="text-[11px] text-stone-400">
              ניהול קטלוג טאב חנות, טיימרים וסימולטור שידור חי
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusMessage && (
            <span
              className={cn(
                "rounded-xl px-3 py-1 text-xs font-bold transition-all",
                statusMessage.type === "ok"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400",
              )}
            >
              {statusMessage.text}
            </span>
          )}

          {/* Sync with Sheets Button */}
          <button
            onClick={handleSyncFromSheets}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl bg-stone-800 px-3 py-2 text-xs font-bold text-stone-200 ring-1 ring-stone-700 transition hover:bg-stone-700 disabled:opacity-50"
            title="משוך עדכונים אחרונים מגיליון חנות"
          >
            <RefreshCw className={cn("size-3.5 text-sky-400", isSyncing && "animate-spin")} />
            <span>סנכרן מגיליון חנות</span>
          </button>

          {/* Open Live Fullscreen Lobby */}
          <a
            href="/lobby"
            target="_blank"
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-500 shadow-sm"
          >
            <Tv className="size-3.5" />
            <span>פתח מסך שילוט מלא (TV)</span>
          </a>

          <button
            onClick={() => {
              sessionStorage.removeItem("saban_lobby_admin_auth");
              setIsAuthenticated(false);
            }}
            className="rounded-xl bg-stone-800 px-3 py-2 text-xs font-bold text-stone-400 hover:text-white"
          >
            נעילה
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left = Live TV Simulator, Right = Product & Timer Management */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12 min-h-0">
        {/* RIGHT SIDE (Lg: 7 cols) - Product Editor & Settings */}
        <div className="flex flex-col border-b border-stone-800 lg:border-b-0 lg:border-l lg:col-span-7 min-h-0 bg-stone-900/50">
          {/* Products List Strip */}
          <div className="border-b border-stone-800 bg-stone-900 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400">
                רשימת מוצרים ({products.length})
              </span>
              <button
                onClick={handleAddNewProduct}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-emerald-500"
              >
                <Plus className="size-3" />
                <span>הוסף מוצר</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {products.map((p) => (
                <button
                  key={p.sku}
                  onClick={() => setSelectedSku(p.sku)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition",
                    p.sku === selectedSku
                      ? "border-sky-500 bg-sky-500/20 text-white ring-1 ring-sky-500"
                      : "border-stone-800 bg-stone-800 text-stone-300 hover:bg-stone-700",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      p.isActive ? "bg-emerald-500" : "bg-stone-500",
                    )}
                  />
                  <span className="font-mono">{p.sku}</span>
                  <span className="max-w-[100px] truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Editor Form */}
          {selectedProduct && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-stone-800 px-2 py-0.5 font-mono text-xs font-bold text-sky-400">
                      {selectedProduct.sku}
                    </span>
                    <h3 className="text-sm font-black text-white">{selectedProduct.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleProductActive(selectedProduct.sku)}
                      className={cn(
                        "flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition",
                        selectedProduct.isActive
                          ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                          : "bg-stone-800 text-stone-400",
                      )}
                    >
                      {selectedProduct.isActive ? (
                        <Eye className="size-3" />
                      ) : (
                        <EyeOff className="size-3" />
                      )}
                      <span>{selectedProduct.isActive ? "פעיל בשילוט" : "מוסתר"}</span>
                    </button>

                    {/* Toggle Sale */}
                    <button
                      onClick={() => handleToggleSaleMode(selectedProduct.sku)}
                      className={cn(
                        "flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition",
                        selectedProduct.salePrice || selectedProduct.discountTag
                          ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40"
                          : "bg-stone-800 text-stone-400",
                      )}
                    >
                      <BadgePercent className="size-3" />
                      <span>מצב מבצע</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteProduct(selectedProduct.sku)}
                      className="rounded-xl bg-stone-800 p-1.5 text-stone-400 transition hover:bg-rose-500/20 hover:text-rose-400"
                      title="מחק מוצר"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">שם מוצר</label>
                    <input
                      type="text"
                      value={selectedProduct.name}
                      onChange={(e) =>
                        handleUpdateProduct({ ...selectedProduct, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">קטגוריה</label>
                    <input
                      type="text"
                      value={selectedProduct.category}
                      onChange={(e) =>
                        handleUpdateProduct({ ...selectedProduct, category: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">מחיר רגיל</label>
                    <input
                      type="text"
                      value={selectedProduct.price || ""}
                      onChange={(e) =>
                        handleUpdateProduct({ ...selectedProduct, price: e.target.value })
                      }
                      placeholder="לדוגמה: 89 ₪"
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">מחיר מבצע / הנחה</label>
                    <input
                      type="text"
                      value={selectedProduct.salePrice || ""}
                      onChange={(e) =>
                        handleUpdateProduct({
                          ...selectedProduct,
                          salePrice: e.target.value,
                          discountTag: e.target.value ? "מבצע" : "",
                        })
                      }
                      placeholder="לדוגמה: 72 ₪"
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">צריכה לפי מ״ר</label>
                    <input
                      type="text"
                      value={selectedProduct.coverageM2 || ""}
                      onChange={(e) =>
                        handleUpdateProduct({ ...selectedProduct, coverageM2: e.target.value })
                      }
                      placeholder="1.5 ק״ג למ״ר"
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">זמן ייבוש</label>
                    <input
                      type="text"
                      value={selectedProduct.dryingTime || ""}
                      onChange={(e) =>
                        handleUpdateProduct({ ...selectedProduct, dryingTime: e.target.value })
                      }
                      placeholder="שעתיים ראשוני | 24 מלא"
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">שיטת יישום</label>
                    <input
                      type="text"
                      value={selectedProduct.applicationMethod || ""}
                      onChange={(e) =>
                        handleUpdateProduct({
                          ...selectedProduct,
                          applicationMethod: e.target.value,
                        })
                      }
                      placeholder="מאלג׳ משונן 10 מ״מ"
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">אריזה ומשטח</label>
                    <input
                      type="text"
                      value={selectedProduct.packaging || ""}
                      onChange={(e) =>
                        handleUpdateProduct({ ...selectedProduct, packaging: e.target.value })
                      }
                      placeholder="שק 25 ק״ג (48 במשטח)"
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-stone-400 font-bold mb-1">
                      משפט שיווקי לטיקר החדשות
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.marketingPhrase || ""}
                      onChange={(e) =>
                        handleUpdateProduct({
                          ...selectedProduct,
                          marketingPhrase: e.target.value,
                        })
                      }
                      placeholder="הדבק הנבחר לפרויקטים יוקרתיים — עמידות שיא..."
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-stone-400 font-bold mb-1">
                      קישור וידאו / YouTube / MP4
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.mediaUrl || ""}
                      onChange={(e) =>
                        handleUpdateProduct({ ...selectedProduct, mediaUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Signage Timing & Interruption Controls */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4 space-y-3">
                <h4 className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>טיימרים והגדרות מעבר מסכים</span>
                </h4>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-400 mb-1">משך שקופית (שניות)</label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={settings.slideDurationSeconds}
                      onChange={(e) =>
                        handleSaveSettings({ slideDurationSeconds: parseInt(e.target.value, 10) })
                      }
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">משך וידאו (שניות)</label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={settings.videoDurationSeconds}
                      onChange={(e) =>
                        handleSaveSettings({ videoDurationSeconds: parseInt(e.target.value, 10) })
                      }
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">הצגת לוח בהתראה (שניות)</label>
                    <input
                      type="number"
                      min={15}
                      max={180}
                      value={settings.dispatchInterruptSeconds}
                      onChange={(e) =>
                        handleSaveSettings({
                          dispatchInterruptSeconds: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LEFT SIDE (Lg: 5 cols) - Professional Live TV Simulator */}
        <div className="flex flex-col lg:col-span-5 min-h-0 bg-stone-950 p-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1.5">
              <Tv className="size-3.5 text-emerald-400" />
              <span>סימולטור שידור חי (Live TV Preview Window)</span>
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              שידור בזמן אמת
            </span>
          </div>

          {/* The Live TV Container Mockup */}
          <div className="relative flex-1 overflow-hidden rounded-2xl border-4 border-stone-800 bg-black shadow-2xl">
            <div className="size-full overflow-hidden">
              <LobbySignageOrchestrator initialProducts={products} />
            </div>
          </div>

          <div className="mt-2 text-center text-[11px] text-stone-500">
            הסימולטור מציג את תוכן הטלוויזיה בדיוק כפי שהיא רצה בלובי כעת, כולל קוד QR לסריקה ובדיקת
            מעברים.
          </div>
        </div>
      </div>
    </div>
  );
}
