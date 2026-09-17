export interface StoreProduct {
  sku: string;
  name: string;
  category: string;
  price?: number | string;
  salePrice?: number | string;
  discountTag?: string;
  images: string[];
  mediaUrl?: string;
  mediaType?: "youtube" | "video" | "presentation" | "none";
  coverageM2?: string;
  dryingTime?: string;
  applicationMethod?: string;
  packaging?: string;
  marketingPhrase?: string;
  isActive: boolean;
  displayDuration: number;
}

export interface LobbySignageSettings {
  slideDurationSeconds: number; // default: 12
  videoDurationSeconds: number; // default: 30
  dispatchInterruptSeconds: number; // default: 60 (returns to lobby after 60s of calm)
  enableDispatchInterrupt: boolean; // default: true
  enableMediaPlayback: boolean; // default: true
  enableMarketingTicker: boolean; // default: true
  showQrCode: boolean; // default: true
  transitionEffect: "fade" | "slide" | "zoom";
}

export interface StoreProductsResponse {
  products: StoreProduct[];
  lastSyncedAt: string;
  source: "sheets" | "cache" | "fallback";
  sheetName: string;
}
