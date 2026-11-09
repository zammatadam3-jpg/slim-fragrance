export type Language = 'en' | 'fr' | 'ar';
export type PageView = 'home' | 'shop' | 'about' | 'contact' | 'product' | 'admin';
export type GenderCategory = 'All' | 'For Him' | 'For Her' | 'Unisex';
export type ProductFormat = 'full' | 'decant10' | 'pack';
export type FormatFilter = 'all' | 'full' | 'decant10' | 'pack';
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name';

export interface LocalizedText {
  en: string;
  fr: string;
  ar: string;
}

export interface Fragrance {
  id: string;
  slug: string;
  name: string;
  category: Exclude<GenderCategory, 'All'>;
  character: LocalizedText;
  priceMad: number;
  volumeLabel?: string;
  decant10PriceMad?: number;
  isPack?: boolean;
  isDecantOnly?: boolean;
  originalPriceMad?: number;
  packSummary?: LocalizedText;
  packContents?: LocalizedText[];
  badge?: 'Best Seller' | 'New';
  featuredOrder?: number;
  image: string;
  heroImage?: string;
  description: LocalizedText;
  notes: {
    top: LocalizedText;
    heart: LocalizedText;
    base: LocalizedText;
  };
  longevity: LocalizedText;
  sillage: LocalizedText;
  updatedAt?: string;
}

export interface CartItem {
  cartKey: string;
  fragrance: Fragrance;
  format: ProductFormat;
  quantity: number;
}

export const WHATSAPP_DISPLAY = '0605 816 604';
export const WHATSAPP_INTL = '212605816604';
export const INSTAGRAM_HANDLE = '@salim.fragrance';
export const INSTAGRAM_URL = 'https://instagram.com/salim.fragrance';

export const HERO_ARCH_IMAGE = '/images/hero_noir_absolu_arch_1793649453920.jpg';
export const ATELIER_STORY_IMAGE = '/images/atelier_story_casablanca_1793649467948.jpg';

export const PACK_DISCOVERY_IMAGE = '/images/pack_discovery_4x10ml_1793740309304.jpg';
export const PACK_OUD_TRIO_IMAGE = '/images/pack_oud_trio_10ml_1793740310624.jpg';
export const PACK_DUO_COFFRET_IMAGE = '/images/pack_duo_coffret_complet_1793740310102.jpg';

/**
 * Clean, empty catalog for store owner:
 * 0 products. Ready for the store owner to add their authentic products from admin.
 */
export const ALL_CATALOG_ITEMS: Fragrance[] = [];
export const FRAGRANCES: Fragrance[] = [];
export const PACKS: Fragrance[] = [];
