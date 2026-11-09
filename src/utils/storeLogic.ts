import {
  CartItem,
  FormatFilter,
  Fragrance,
  GenderCategory,
  Language,
  ProductFormat,
  SortOption,
  WHATSAPP_INTL,
} from '../data/fragrances';

export const MAX_QTY_PER_ITEM = 50;
export const MAX_SEARCH_LENGTH = 100;
export const MAX_NAME_LENGTH = 80;
export const MAX_EMAIL_LENGTH = 120;
export const MAX_MESSAGE_LENGTH = 1000;

/**
 * Converts any Eastern Arabic-Indic (٠-٩) or Extended Arabic-Indic (۰-۹) digits
 * into standard English / Western digits (0-9).
 */
export function toEnglishDigits(input: string | number): string {
  const str = String(input);
  return str
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Strips ASCII control characters (except safe newlines where allowed), normalizes numerals
 * to English 0-9, and caps string length to prevent URL injection or oversized payloads.
 */
export function sanitizeUserText(
  raw: unknown,
  maxLength = 200,
  allowNewlines = false
): string {
  if (typeof raw !== 'string') return '';
  const englishNums = toEnglishDigits(raw);
  const withoutControls = allowNewlines
    ? englishNums.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    : englishNums.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/ {2,}/g, ' ');
  return withoutControls.trim().slice(0, maxLength);
}

/**
 * Clamps any integer quantity into a safe finite integer range [min, max].
 * Protects against NaN, Infinity, floats, negative numbers, and integer overflow.
 */
export function clampSafeQuantity(
  rawQty: unknown,
  min = 0,
  max = MAX_QTY_PER_ITEM
): number {
  const num = typeof rawQty === 'number' ? rawQty : Number(rawQty);
  if (!Number.isFinite(num)) return min;
  const rounded = Math.trunc(num);
  return Math.max(min, Math.min(max, rounded));
}

/**
 * Safely parses and validates persisted cart storage entries from untrusted localStorage.
 * Rejects non-arrays, prototype-pollution keys, invalid IDs, NaN/negative/huge quantities,
 * and deduplicates identical cartKeys.
 */
export function parseSafeStoredCart(
  rawJson: string | null,
  catalog: Fragrance[]
): CartItem[] {
  if (!rawJson || typeof rawJson !== 'string' || rawJson.length > 20_000) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const catalogById = new Map<string, Fragrance>();
  for (const item of catalog) {
    catalogById.set(item.id, item);
  }

  const deduped = new Map<string, CartItem>();

  for (const rawEntry of parsed.slice(0, 50)) {
    if (!rawEntry || typeof rawEntry !== 'object' || Array.isArray(rawEntry)) {
      continue;
    }

    const record = rawEntry as Record<string, unknown>;
    if (
      Object.prototype.hasOwnProperty.call(record, '__proto__') ||
      Object.prototype.hasOwnProperty.call(record, 'constructor') ||
      Object.prototype.hasOwnProperty.call(record, 'prototype')
    ) {
      continue;
    }

    const id = typeof record.id === 'string' ? record.id : '';
    const found = catalogById.get(id);
    if (!found) continue;

    const safeQty = clampSafeQuantity(record.quantity, 0, MAX_QTY_PER_ITEM);
    if (safeQty <= 0) continue;

    const rawFormat = record.format;
    const resolvedFormat: ProductFormat = found.isPack
      ? 'pack'
      : found.isDecantOnly || (rawFormat === 'decant10' && found.decant10PriceMad !== undefined)
      ? 'decant10'
      : 'full';

    const key = makeCartKey(found.id, resolvedFormat);
    const existing = deduped.get(key);
    if (existing) {
      existing.quantity = clampSafeQuantity(
        existing.quantity + safeQty,
        1,
        MAX_QTY_PER_ITEM
      );
    } else {
      deduped.set(key, {
        cartKey: key,
        fragrance: found,
        format: resolvedFormat,
        quantity: safeQty,
      });
    }
  }

  return Array.from(deduped.values());
}

/**
 * Enforces an allowlist on outbound URLs so no javascript:, data:, or untrusted host can ever be opened.
 */
export function assertSafeExternalUrl(
  url: string,
  allowedHosts: readonly string[] = ['wa.me', 'instagram.com', 'www.instagram.com']
): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !allowedHosts.includes(parsed.hostname)) {
      return `https://wa.me/${WHATSAPP_INTL}`;
    }
    return parsed.toString();
  } catch {
    return `https://wa.me/${WHATSAPP_INTL}`;
  }
}

export interface FilterCriteria {
  category: GenderCategory;
  formatFilter?: FormatFilter;
  onlyBestSellers?: boolean;
  query: string;
  sortBy: SortOption;
  lang?: Language;
}

export function getDefaultFormatForItem(
  item: Fragrance,
  activeFormatFilter: FormatFilter = 'all'
): ProductFormat {
  if (item.isPack) return 'pack';
  if (item.isDecantOnly) return 'decant10';
  if (activeFormatFilter === 'decant10' && item.decant10PriceMad !== undefined) {
    return 'decant10';
  }
  return 'full';
}

export function getUnitPrice(item: Fragrance, format: ProductFormat): number {
  if (item.isPack || format === 'pack') {
    return item.priceMad;
  }
  if (item.isDecantOnly) {
    return item.decant10PriceMad !== undefined ? item.decant10PriceMad : item.priceMad;
  }
  if (format === 'decant10' && item.decant10PriceMad !== undefined) {
    return item.decant10PriceMad;
  }
  return item.priceMad;
}

export function getFormatLabel(
  item: Fragrance,
  format: ProductFormat,
  lang: Language = 'en'
): string {
  if (item.isPack || format === 'pack') {
    return item.packSummary
      ? item.packSummary[lang]
      : lang === 'ar'
      ? 'باك مختار'
      : lang === 'fr'
      ? 'Pack & Coffret'
      : 'Curated Pack';
  }
  if (item.isDecantOnly || format === 'decant10') {
    return lang === 'ar'
      ? 'تقسيمة أصلية 10ml'
      : lang === 'fr'
      ? 'Décant Original 10ml'
      : '10ml Original Decant';
  }
  const sizeSuffix = item.volumeLabel ? ` ${toEnglishDigits(item.volumeLabel)}` : '';
  return lang === 'ar'
    ? `عطر كامل (كومبلي${sizeSuffix})`
    : lang === 'fr'
    ? `Flacon Complet${sizeSuffix}`
    : `Full Bottle${sizeSuffix}`;
}

export function makeCartKey(fragranceId: string, format: ProductFormat): string {
  return `${fragranceId}:${format}`;
}

export function filterAndSortFragrances(
  items: Fragrance[],
  criteria: FilterCriteria
): Fragrance[] {
  const normalizedQuery = sanitizeUserText(
    criteria.query,
    MAX_SEARCH_LENGTH,
    false
  ).toLowerCase();
  const formatFilter = criteria.formatFilter ?? 'all';

  const filtered = items.filter((item) => {
    // Format filtering
    if (formatFilter === 'pack' && !item.isPack) return false;
    if (formatFilter === 'full' && (item.isPack || item.isDecantOnly)) return false;
    if (
      formatFilter === 'decant10' &&
      !item.isDecantOnly &&
      (item.isPack || item.decant10PriceMad === undefined)
    ) {
      return false;
    }

    // Gender category filtering
    if (criteria.category !== 'All' && item.category !== criteria.category) {
      return false;
    }
    if (criteria.onlyBestSellers && item.badge !== 'Best Seller') {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }

    const packContentsText = (item.packContents ?? [])
      .map((c) => `${c.en} ${c.fr} ${c.ar}`)
      .join(' ');

    const searchableFields = [
      item.name,
      item.category,
      item.volumeLabel ?? '',
      item.isPack ? 'pack coffret باك' : 'decant complet تقسيمة كومبلي 10ml',
      item.character.en,
      item.character.fr,
      item.character.ar,
      item.description.en,
      item.description.fr,
      item.description.ar,
      item.notes.top.en,
      item.notes.top.fr,
      item.notes.top.ar,
      item.notes.heart.en,
      item.notes.heart.fr,
      item.notes.heart.ar,
      item.notes.base.en,
      item.notes.base.fr,
      item.notes.base.ar,
      packContentsText,
    ]
      .join(' ')
      .toLowerCase();

    return searchableFields.includes(normalizedQuery);
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    const formatA = getDefaultFormatForItem(a, formatFilter);
    const formatB = getDefaultFormatForItem(b, formatFilter);
    const priceA = getUnitPrice(a, formatA);
    const priceB = getUnitPrice(b, formatB);

    switch (criteria.sortBy) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default: {
        const packRankA = a.isPack ? 1 : 0;
        const packRankB = b.isPack ? 1 : 0;
        if (formatFilter === 'all' && packRankA !== packRankB) {
          return packRankA - packRankB;
        }
        const orderA = a.featuredOrder ?? 99;
        const orderB = b.featuredOrder ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return 0;
      }
    }
  });

  return sorted;
}

export function addToCart(
  items: CartItem[],
  fragrance: Fragrance,
  delta = 1,
  requestedFormat?: ProductFormat
): CartItem[] {
  const safeDelta = clampSafeQuantity(delta, -MAX_QTY_PER_ITEM, MAX_QTY_PER_ITEM);
  if (safeDelta === 0) return items;

  const format: ProductFormat = fragrance.isPack
    ? 'pack'
    : fragrance.isDecantOnly || (requestedFormat === 'decant10' && fragrance.decant10PriceMad !== undefined)
    ? 'decant10'
    : 'full';
  const key = makeCartKey(fragrance.id, format);

  const existingIndex = items.findIndex((i) => i.cartKey === key);
  if (existingIndex === -1) {
    if (safeDelta <= 0) return items;
    return [
      ...items,
      {
        cartKey: key,
        fragrance,
        format,
        quantity: clampSafeQuantity(safeDelta, 1, MAX_QTY_PER_ITEM),
      },
    ];
  }

  return items
    .map((item, idx) =>
      idx === existingIndex
        ? {
            ...item,
            quantity: clampSafeQuantity(
              item.quantity + safeDelta,
              0,
              MAX_QTY_PER_ITEM
            ),
          }
        : item
    )
    .filter((item) => item.quantity > 0);
}

export function updateCartQuantity(
  items: CartItem[],
  cartKey: string,
  newQuantity: number
): CartItem[] {
  const safeQty = clampSafeQuantity(newQuantity, 0, MAX_QTY_PER_ITEM);
  if (safeQty <= 0) {
    return items.filter((i) => i.cartKey !== cartKey);
  }
  return items.map((item) =>
    item.cartKey === cartKey ? { ...item, quantity: safeQty } : item
  );
}

export function removeFromCart(items: CartItem[], cartKey: string): CartItem[] {
  return items.filter((item) => item.cartKey !== cartKey);
}

export function calculateCartCount(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + clampSafeQuantity(item.quantity, 0, MAX_QTY_PER_ITEM),
    0
  );
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const safeQty = clampSafeQuantity(item.quantity, 0, MAX_QTY_PER_ITEM);
    return sum + getUnitPrice(item.fragrance, item.format) * safeQty;
  }, 0);
}

/**
 * Safely resolves an image URL to an absolute HTTP/HTTPS URL that WhatsApp can unfurl.
 * If the image is a relative path (e.g. /images/...), it prefixes window.location.origin.
 * If it's already an absolute URL (e.g. Sanity CDN or external https://...), it uses it.
 * If it's a data URI (which would exceed browser URL length limits), it provides a store product link.
 */
export function resolveShareableImageUrl(imagePath?: string, fragranceId?: string): string {
  if (!imagePath || typeof imagePath !== 'string') return '';
  const clean = imagePath.trim();
  if (!clean) return '';

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://salim-fragrance.ma';

  if (clean.startsWith('/')) {
    return `${origin}${clean}`;
  }

  if (clean.startsWith('data:')) {
    if (fragranceId) {
      return `${origin}/#product-${fragranceId}`;
    }
    return origin;
  }

  return clean;
}

export function buildSingleProductWhatsAppUrl(
  fragrance: Fragrance,
  _lang: Language = 'ar',
  quantity = 1,
  requestedFormat?: ProductFormat
): string {
  const safeQuantity = clampSafeQuantity(quantity, 1, MAX_QTY_PER_ITEM);
  const format: ProductFormat = fragrance.isPack
    ? 'pack'
    : fragrance.isDecantOnly || (requestedFormat === 'decant10' && fragrance.decant10PriceMad !== undefined)
    ? 'decant10'
    : 'full';
  const unitPrice = getUnitPrice(fragrance, format);
  const subtotal = unitPrice * safeQuantity;

  let formatArabic = '';
  if (format === 'pack') {
    formatArabic =
      fragrance.packSummary?.ar ||
      fragrance.packSummary?.fr ||
      fragrance.packSummary?.en ||
      'باك وعرض خاص';
  } else if (format === 'decant10') {
    formatArabic = 'تقسيمة عطر أصلية 10ml';
  } else {
    const sizeSuffix = fragrance.volumeLabel ? ` ${toEnglishDigits(fragrance.volumeLabel)}` : '';
    formatArabic = `قارورة كاملة أصلية (كومبلي${sizeSuffix})`;
  }

  const lines = [
    'مرحباً SALIM FRAGRANCE 🌟',
    'أود تأكيد طلب المنتج التالي من المتجر:',
    '',
    `• اسم العطر: ${fragrance.name}`,
    `• نوع الطلب: ${formatArabic}`,
    `• الكمية: ${safeQuantity}`,
    `• السعر الإجمالي: ${subtotal} MAD`,
  ];

  lines.push('');
  lines.push('يرجى تأكيد توفر الطلب ومعلومات التوصيل داخل المغرب.');
  lines.push('شكراً لكم!');

  const message = lines.join('\n');

  return assertSafeExternalUrl(
    `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(
      toEnglishDigits(message)
    )}`
  );
}

export function buildCartWhatsAppUrl(items: CartItem[], _lang: Language = 'ar'): string {
  if (items.length === 0) {
    return buildConciergeWhatsAppUrl('ar');
  }

  const total = calculateCartTotal(items);

  const itemBlocks: string[] = [];
  items.forEach((item, idx) => {
    const safeQty = clampSafeQuantity(item.quantity, 1, MAX_QTY_PER_ITEM);
    const unitPrice = getUnitPrice(item.fragrance, item.format);
    const lineTotal = unitPrice * safeQty;

    let formatArabic = '';
    if (item.format === 'pack') {
      formatArabic =
        item.fragrance.packSummary?.ar ||
        item.fragrance.packSummary?.fr ||
        item.fragrance.packSummary?.en ||
        'باك وعرض خاص';
    } else if (item.format === 'decant10') {
      formatArabic = 'تقسيمة أصلية 10ml';
    } else {
      const sizeSuffix = item.fragrance.volumeLabel
        ? ` ${toEnglishDigits(item.fragrance.volumeLabel)}`
        : '';
      formatArabic = `قارورة كاملة أصلية (كومبلي${sizeSuffix})`;
    }

    const blockLines = [
      `${idx + 1}. ${item.fragrance.name}`,
      `   • نوع الطلب: ${formatArabic}`,
      `   • الكمية: ${safeQty}`,
      `   • السعر: ${lineTotal} MAD`,
    ];
    itemBlocks.push(blockLines.join('\n'));
  });

  const message = [
    'مرحباً SALIM FRAGRANCE 🌟',
    'أود تأكيد طلبي من المتجر (تفاصيل السلة):',
    '',
    itemBlocks.join('\n\n'),
    '',
    '──────────────────',
    `💰 المجموع الإجمالي: ${total} MAD`,
    '📍 التوصيل: لجميع مدن المغرب والدفع عند الاستلام.',
    '',
    'يرجى تأكيد الطلب وتفاصيل التوصيل. شكراً لكم!',
  ].join('\n');

  return assertSafeExternalUrl(
    `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(
      toEnglishDigits(message)
    )}`
  );
}

export function buildConciergeWhatsAppUrl(
  _lang: Language = 'ar',
  customText?: string
): string {
  const safeCustom = customText
    ? sanitizeUserText(customText, MAX_MESSAGE_LENGTH + 150, true)
    : '';
  const message =
    safeCustom ||
    'مرحباً SALIM FRAGRANCE 🌟، أود الاستفسار عن توفر العطور وتقسيمات 10 مل والباكات لديكم.';

  return assertSafeExternalUrl(
    `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(
      toEnglishDigits(message)
    )}`
  );
}

export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
}

export function validateContactForm(input: ContactFormInput): boolean {
  // Reject automated bot submissions that fill the hidden honeypot field
  if (typeof input.honeypot === 'string' && input.honeypot.trim().length > 0) {
    return false;
  }

  const trimmedName = sanitizeUserText(input.name, MAX_NAME_LENGTH, false);
  const trimmedEmail = sanitizeUserText(input.email, MAX_EMAIL_LENGTH, false);
  const trimmedMessage = sanitizeUserText(input.message, MAX_MESSAGE_LENGTH, true);

  if (
    trimmedName.length < 2 ||
    !trimmedEmail ||
    trimmedEmail.length > MAX_EMAIL_LENGTH ||
    trimmedMessage.length < 3
  ) {
    return false;
  }

  // Linear-time (non-ReDoS) strict email check
  const atIndex = trimmedEmail.indexOf('@');
  if (atIndex <= 0 || atIndex !== trimmedEmail.lastIndexOf('@')) {
    return false;
  }
  const localPart = trimmedEmail.slice(0, atIndex);
  const domainPart = trimmedEmail.slice(atIndex + 1);
  if (
    !localPart ||
    localPart.length > 64 ||
    !domainPart ||
    domainPart.length > 253 ||
    domainPart.startsWith('.') ||
    domainPart.endsWith('.') ||
    domainPart.includes('..') ||
    /\s/.test(trimmedEmail)
  ) {
    return false;
  }
  const dotIndex = domainPart.lastIndexOf('.');
  if (dotIndex <= 0 || domainPart.length - dotIndex - 1 < 2) {
    return false;
  }

  return true;
}
