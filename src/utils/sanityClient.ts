import { createClient } from '@sanity/client';
import createImageUrlBuilder from '@sanity/image-url';
import { ALL_CATALOG_ITEMS, Fragrance, FRAGRANCES, PACKS } from '../data/fragrances';
import { getFragrancesFromFirestore } from './firebase';

/**
 * Sanity project environment variables.
 * In Vite, variables exposed to the client must begin with VITE_.
 */
export const SANITY_PROJECT_ID =
  (import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined)?.trim() || '';

export const SANITY_DATASET =
  (import.meta.env.VITE_SANITY_DATASET as string | undefined)?.trim() || 'production';

export const isSanityConfigured = Boolean(SANITY_PROJECT_ID);

/**
 * Client for fetching live product documents from Sanity.
 */
export const sanityClient = isSanityConfigured
  ? createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      useCdn: true, // Blazing fast cached edge delivery
      apiVersion: '2024-03-01',
    })
  : null;

const imageBuilder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export function urlForSanityImage(source: unknown): string {
  if (!imageBuilder || !source) return '';
  try {
    return imageBuilder.image(source).auto('format').fit('max').width(1200).url();
  } catch {
    return '';
  }
}

/**
 * Shape of a fragrance document in Sanity Studio.
 */
export interface SanityFragranceDoc {
  _id: string;
  name: string;
  slug?: { current: string } | string;
  category?: 'For Him' | 'For Her' | 'Unisex';
  priceMad: number;
  decant10PriceMad?: number;
  volumeLabel?: string;
  isPack?: boolean;
  isDecantOnly?: boolean;
  originalPriceMad?: number;
  badge?: 'Best Seller' | 'New';
  featuredOrder?: number;
  image?: unknown;
  imageUrl?: string;
  character?: { en?: string; fr?: string; ar?: string } | string;
  description?: { en?: string; fr?: string; ar?: string } | string;
  notes?: {
    top?: { en?: string; fr?: string; ar?: string } | string;
    heart?: { en?: string; fr?: string; ar?: string } | string;
    base?: { en?: string; fr?: string; ar?: string } | string;
  };
  longevity?: { en?: string; fr?: string; ar?: string } | string;
  sillage?: { en?: string; fr?: string; ar?: string } | string;
  packSummary?: { en?: string; fr?: string; ar?: string } | string;
  packContents?: Array<{ en?: string; fr?: string; ar?: string } | string>;
}

function normalizeLocalizedText(val: unknown, fallback = ''): { en: string; fr: string; ar: string } {
  if (!val) {
    return { en: fallback, fr: fallback, ar: fallback };
  }
  if (typeof val === 'string') {
    return { en: val, fr: val, ar: val };
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    const en = typeof obj.en === 'string' && obj.en ? obj.en : fallback;
    const fr = typeof obj.fr === 'string' && obj.fr ? obj.fr : en || fallback;
    const ar = typeof obj.ar === 'string' && obj.ar ? obj.ar : en || fallback;
    return { en, fr, ar };
  }
  return { en: fallback, fr: fallback, ar: fallback };
}

/**
 * Maps a raw Sanity CMS document safely into the app's Fragrance type.
 */
export function mapSanityDocToFragrance(doc: SanityFragranceDoc): Fragrance {
  const slug =
    typeof doc.slug === 'string'
      ? doc.slug
      : doc.slug?.current || doc.name.toLowerCase().replace(/\s+/g, '-');

  const resolvedImage = doc.image
    ? urlForSanityImage(doc.image)
    : doc.imageUrl || '/images/scent_noir_absolu_1793649456099.jpg';

  const category =
    doc.category === 'For Him' || doc.category === 'For Her' || doc.category === 'Unisex'
      ? doc.category
      : 'Unisex';

  const packContents = Array.isArray(doc.packContents)
    ? doc.packContents.map((c) => normalizeLocalizedText(c, ''))
    : undefined;

  return {
    id: doc._id || slug,
    slug,
    name: doc.name || 'Untitled Fragrance',
    category,
    character: normalizeLocalizedText(doc.character, 'Signature Fragrance'),
    priceMad: Number(doc.priceMad) || 450,
    volumeLabel: doc.volumeLabel || undefined,
    decant10PriceMad:
      doc.decant10PriceMad !== undefined && Number(doc.decant10PriceMad) > 0
        ? Number(doc.decant10PriceMad)
        : undefined,
    isPack: Boolean(doc.isPack),
    isDecantOnly: Boolean(doc.isDecantOnly),
    originalPriceMad:
      doc.originalPriceMad !== undefined && Number(doc.originalPriceMad) > 0
        ? Number(doc.originalPriceMad)
        : undefined,
    packSummary: doc.packSummary ? normalizeLocalizedText(doc.packSummary, '') : undefined,
    packContents,
    badge: doc.badge === 'Best Seller' || doc.badge === 'New' ? doc.badge : undefined,
    featuredOrder: typeof doc.featuredOrder === 'number' ? doc.featuredOrder : undefined,
    image: resolvedImage,
    description: normalizeLocalizedText(doc.description, ''),
    notes: {
      top: normalizeLocalizedText(doc.notes?.top, 'Citrus, Spices'),
      heart: normalizeLocalizedText(doc.notes?.heart, 'Floral, Amber'),
      base: normalizeLocalizedText(doc.notes?.base, 'Woody, Musk'),
    },
    longevity: normalizeLocalizedText(doc.longevity, '10 – 12 hours'),
    sillage: normalizeLocalizedText(doc.sillage, 'Commanding & Warm'),
  };
}

/**
 * GROQ query to retrieve all fragrances from Sanity.
 */
const FRAGRANCES_QUERY = `*[_type == "fragrance"] | order(featuredOrder asc, _createdAt desc)`;

/**
 * Fetches all fragrances from Sanity with an automatic graceful fallback to the hardcoded catalog.
 */
export async function fetchCatalogItems(): Promise<{
  items: Fragrance[];
  fragrances: Fragrance[];
  packs: Fragrance[];
  isFromSanity: boolean;
}> {
  // 1. Direct Cloud Firestore (persistent across all physical devices, visitors, and reboots)
  try {
    const cloudDocs = await getFragrancesFromFirestore();
    if (Array.isArray(cloudDocs)) {
      const packs = cloudDocs.filter((item) => item.isPack);
      const fragrances = cloudDocs.filter((item) => !item.isPack);
      return {
        items: cloudDocs,
        fragrances,
        packs,
        isFromSanity: false,
      };
    }
  } catch (err) {
    console.warn('Firestore fetchCatalogItems notice:', err);
  }

  // 2. Secondary API fallback
  try {
    const res = await fetch('/api/catalog');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const items: Fragrance[] = data.items;
        const packs = items.filter((item) => item.isPack);
        const fragrances = items.filter((item) => !item.isPack);
        return {
          items,
          fragrances,
          packs,
          isFromSanity: false,
        };
      }
    }
  } catch {
    // API route unavailable
  }

  if (!sanityClient) {
    return {
      items: ALL_CATALOG_ITEMS,
      fragrances: FRAGRANCES,
      packs: PACKS,
      isFromSanity: false,
    };
  }

  try {
    const rawDocs = await sanityClient.fetch<SanityFragranceDoc[]>(FRAGRANCES_QUERY);
    if (!Array.isArray(rawDocs) || rawDocs.length === 0) {
      return {
        items: [],
        fragrances: [],
        packs: [],
        isFromSanity: true,
      };
    }

    const mapped = rawDocs.map(mapSanityDocToFragrance);
    const packs = mapped.filter((item) => item.isPack);
    const fragrances = mapped.filter((item) => !item.isPack);

    return {
      items: mapped,
      fragrances,
      packs,
      isFromSanity: true,
    };
  } catch (error) {
    console.warn('Sanity fetch encountered an error, falling back to local catalog:', error);
    return {
      items: ALL_CATALOG_ITEMS,
      fragrances: FRAGRANCES,
      packs: PACKS,
      isFromSanity: false,
    };
  }
}
