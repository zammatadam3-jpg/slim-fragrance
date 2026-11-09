import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ALL_CATALOG_ITEMS,
  ATELIER_STORY_IMAGE,
  FRAGRANCES,
  Fragrance,
  HERO_ARCH_IMAGE,
  PACKS,
} from '../data/fragrances';
import { TRANSLATIONS } from '../data/translations';
import {
  addToCart,
  assertSafeExternalUrl,
  buildCartWhatsAppUrl,
  buildConciergeWhatsAppUrl,
  buildSingleProductWhatsAppUrl,
  calculateCartCount,
  calculateCartTotal,
  clampSafeQuantity,
  filterAndSortFragrances,
  getDefaultFormatForItem,
  getFormatLabel,
  getUnitPrice,
  makeCartKey,
  MAX_QTY_PER_ITEM,
  parseSafeStoredCart,
  removeFromCart,
  sanitizeUserText,
  toEnglishDigits,
  updateCartQuantity,
  validateContactForm,
} from './storeLogic';

const MOCK_NOIR_ABSOLU: Fragrance = {
  id: 'noir-absolu',
  slug: 'noir-absolu',
  name: 'Noir Absolu',
  category: 'For Him',
  priceMad: 450,
  decant10PriceMad: 50,
  isPack: false,
  image: '/images/scent_noir_absolu_1793649456099.jpg',
  character: { ar: 'عطر أسطوري', fr: 'Parfum', en: 'Perfume' },
  description: { ar: 'وصف', fr: 'desc', en: 'desc' },
  notes: {
    top: { ar: 'برغموت 10ml', fr: 'b', en: 'b' },
    heart: { ar: 'عنبر', fr: 'a', en: 'a' },
    base: { ar: 'عود', fr: 'o', en: 'o' },
  },
  longevity: { ar: '14h', fr: '14h', en: '14h' },
  sillage: { ar: 'قوي', fr: 'fort', en: 'strong' },
};

const MOCK_ROYAL_OUD: Fragrance = {
  id: 'royal-oud',
  slug: 'royal-oud',
  name: 'Royal Oud',
  category: 'Unisex',
  priceMad: 650,
  decant10PriceMad: 110,
  isPack: false,
  image: '/images/scent_royal_oud_1793649458247.jpg',
  character: { ar: 'عود ملكي 10ml', fr: 'Oud royal', en: 'Royal oud' },
  description: { ar: 'وصف', fr: 'desc', en: 'desc' },
  notes: {
    top: { ar: 'توابل', fr: 's', en: 's' },
    heart: { ar: 'زهور', fr: 'f', en: 'f' },
    base: { ar: 'عود', fr: 'o', en: 'o' },
  },
  longevity: { ar: '14h', fr: '14h', en: '14h' },
  sillage: { ar: 'ملكي', fr: 'royal', en: 'royal' },
};

const MOCK_PACK: Fragrance = {
  id: 'pack-discovery',
  slug: 'pack-discovery',
  name: 'Discovery Pack',
  category: 'Unisex',
  priceMad: 290,
  isPack: true,
  image: '/images/pack_discovery_4x10ml_1793740309304.jpg',
  character: { ar: 'باك التكتشاف', fr: 'Pack', en: 'Pack' },
  description: { ar: 'وصف', fr: 'desc', en: 'desc' },
  notes: {
    top: { ar: 'تنوع', fr: 'v', en: 'v' },
    heart: { ar: 'تنوع', fr: 'v', en: 'v' },
    base: { ar: 'تنوع', fr: 'v', en: 'v' },
  },
  longevity: { ar: '12h', fr: '12h', en: '12h' },
  sillage: { ar: 'ممتاز', fr: 'excellent', en: 'excellent' },
  packContents: [
    { ar: '4 عطور 10ml', fr: '4x10ml', en: '4x10ml' },
    { ar: 'علبة هدايا', fr: 'Coffret', en: 'Gift box' },
    { ar: 'عينة مجانية', fr: 'Échantillon', en: 'Free sample' },
  ],
};

const MOCK_CATALOG = [MOCK_NOIR_ABSOLU, MOCK_ROYAL_OUD, MOCK_PACK];

test('initial catalog starts empty (0 items) for store owner to add products from scratch', () => {
  assert.equal(ALL_CATALOG_ITEMS.length, 0);
  assert.equal(FRAGRANCES.length, 0);
  assert.equal(PACKS.length, 0);

  const checkPublicAsset = (imgUrl: string) => {
    assert.ok(imgUrl.startsWith('/images/'), `${imgUrl} should start with /images/`);
    assert.ok(!imgUrl.includes('..'), `${imgUrl} must not contain path traversal`);
    const diskPath = path.join(process.cwd(), 'public', imgUrl);
    assert.ok(fs.existsSync(diskPath), `Expected asset to exist on disk: ${diskPath}`);
  };

  checkPublicAsset(HERO_ARCH_IMAGE);
  checkPublicAsset(ATELIER_STORY_IMAGE);
});

test('filterAndSortFragrances filters by formatFilter (full, decant10, pack) and sorts by format price', () => {
  const packsOnly = filterAndSortFragrances(MOCK_CATALOG, {
    category: 'All',
    formatFilter: 'pack',
    query: '',
    sortBy: 'featured',
  });
  assert.equal(packsOnly.length, 1);
  assert.ok(packsOnly.every((i) => i.isPack));

  const decantsAsc = filterAndSortFragrances(MOCK_CATALOG, {
    category: 'All',
    formatFilter: 'decant10',
    query: '',
    sortBy: 'price-asc',
  });
  assert.equal(decantsAsc.length, 2);
  assert.ok(
    getUnitPrice(decantsAsc[0], 'decant10') <=
      getUnitPrice(decantsAsc[decantsAsc.length - 1], 'decant10')
  );
});

test('cart supports mixing 10ml decant, full bottle, and curated pack accurately', () => {
  let cart = addToCart([], MOCK_NOIR_ABSOLU, 1, 'decant10');
  cart = addToCart(cart, MOCK_NOIR_ABSOLU, 1, 'full');
  cart = addToCart(cart, MOCK_PACK, 1, 'pack');

  assert.equal(cart.length, 3);
  assert.equal(calculateCartCount(cart), 3);
  assert.equal(calculateCartTotal(cart), 50 + 450 + 290); // 790 MAD

  cart = updateCartQuantity(cart, makeCartKey('noir-absolu', 'decant10'), 2);
  assert.equal(calculateCartCount(cart), 4);
  assert.equal(calculateCartTotal(cart), 100 + 450 + 290); // 840 MAD

  cart = removeFromCart(cart, makeCartKey('noir-absolu', 'full'));
  assert.equal(cart.length, 2);
  assert.equal(calculateCartTotal(cart), 100 + 290); // 390 MAD
});

test('WhatsApp order URLs are always in Arabic with perfume name, order details, and prices (no image links)', () => {
  const decantUrl = buildSingleProductWhatsAppUrl(MOCK_ROYAL_OUD, 'en', 1, 'decant10');
  const decodedDecant = decodeURIComponent(decantUrl);
  assert.ok(decodedDecant.includes('مرحباً SALIM FRAGRANCE'));
  assert.ok(decodedDecant.includes('اسم العطر: Royal Oud'));
  assert.ok(decodedDecant.includes('تقسيمة عطر أصلية 10ml'));
  assert.ok(decodedDecant.includes('110 MAD'));
  assert.ok(!decodedDecant.includes('صورة المنتج:'));

  const fullUrl = buildSingleProductWhatsAppUrl(MOCK_ROYAL_OUD, 'fr', 1, 'full');
  const decodedFull = decodeURIComponent(fullUrl);
  assert.ok(decodedFull.includes('مرحباً SALIM FRAGRANCE'));
  assert.ok(decodedFull.includes('اسم العطر: Royal Oud'));
  assert.ok(decodedFull.includes('قارورة كاملة أصلية (كومبلي)'));
  assert.ok(!/100\s*ml/i.test(decodedFull));
  assert.ok(decodedFull.includes('650 MAD'));
  assert.ok(!decodedFull.includes('صورة المنتج:'));

  // Test newly added product from admin
  const customAkram: Fragrance = {
    id: 'akram-special',
    slug: 'akram',
    name: 'Akram',
    category: 'For Him',
    priceMad: 550,
    decant10PriceMad: 95,
    isPack: false,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f',
    character: { ar: 'عطر رجالي راقي', fr: 'Parfum noble', en: 'Noble perfume' },
    description: { ar: 'وصف', fr: 'desc', en: 'desc' },
    notes: {
      top: { ar: 'هيل', fr: 'cardamome', en: 'cardamom' },
      heart: { ar: 'عنبر', fr: 'ambre', en: 'amber' },
      base: { ar: 'عود', fr: 'oud', en: 'oud' },
    },
    longevity: { ar: '12 ساعة', fr: '12h', en: '12h' },
    sillage: { ar: 'قوي', fr: 'fort', en: 'strong' },
  };

  const akramUrl = buildSingleProductWhatsAppUrl(customAkram, 'fr', 2, 'full');
  const decodedAkram = decodeURIComponent(akramUrl);
  assert.ok(decodedAkram.includes('مرحباً SALIM FRAGRANCE'));
  assert.ok(decodedAkram.includes('اسم العطر: Akram'));
  assert.ok(decodedAkram.includes('الكمية: 2'));
  assert.ok(decodedAkram.includes('السعر الإجمالي: 1100 MAD'));
  assert.ok(!decodedAkram.includes('صورة المنتج:'));
  assert.ok(!decodedAkram.includes('https://images.unsplash.com'));

  // Cart order with multiple items
  const cart = addToCart(
    addToCart([], MOCK_ROYAL_OUD, 1, 'decant10'),
    customAkram,
    1,
    'full'
  );
  const cartDecoded = decodeURIComponent(buildCartWhatsAppUrl(cart, 'fr'));
  assert.ok(cartDecoded.includes('مرحباً SALIM FRAGRANCE'));
  assert.ok(cartDecoded.includes('تفاصيل السلة'));
  assert.ok(cartDecoded.includes('Royal Oud'));
  assert.ok(cartDecoded.includes('Akram'));
  assert.ok(cartDecoded.includes('المجموع الإجمالي: 660 MAD'));
  assert.ok(!cartDecoded.includes('صورة المنتج:'));

  // Standalone decant (isDecantOnly) test
  const decantOnlyItem: Fragrance = {
    id: 'decant-soleil',
    slug: 'soleil-10ml',
    name: 'Soleil 10ml',
    category: 'Unisex',
    priceMad: 120,
    decant10PriceMad: 120,
    isPack: false,
    isDecantOnly: true,
    image: '/images/scent_jasmin_nuit_1793649464121.jpg',
    character: { ar: 'تقسيمة متفرقة', fr: 'Decant', en: 'Decant' },
    description: { ar: 'وصف', fr: 'desc', en: 'desc' },
    notes: {
      top: { ar: 'برغموت', fr: 'b', en: 'b' },
      heart: { ar: 'ياسمين', fr: 'j', en: 'j' },
      base: { ar: 'مسك', fr: 'm', en: 'm' },
    },
    longevity: { ar: '12h', fr: '12h', en: '12h' },
    sillage: { ar: 'قوي', fr: 'fort', en: 'strong' },
  };

  const decantOnlyUrl = buildSingleProductWhatsAppUrl(decantOnlyItem, 'fr', 1);
  const decodedDecantOnly = decodeURIComponent(decantOnlyUrl);
  assert.ok(decodedDecantOnly.includes('اسم العطر: Soleil 10ml'));
  assert.ok(decodedDecantOnly.includes('تقسيمة عطر أصلية 10ml'));
  assert.ok(decodedDecantOnly.includes('120 MAD'));
  assert.equal(getUnitPrice(decantOnlyItem, 'full'), 120);
  assert.equal(getDefaultFormatForItem(decantOnlyItem), 'decant10');
});

test('all Arabic strings use English 0-9 numerals and zero 100ml / 100 مل labels exist anywhere', () => {
  assert.equal(toEnglishDigits('٠١٢٣٤٥٦٧٨٩'), '0123456789');
  assert.equal(toEnglishDigits('۰۱۲۳۴۵۶۷۸۹'), '0123456789');

  // Searching with Arabic numerals still finds 10ml products smoothly
  const arabicNumSearch = filterAndSortFragrances(MOCK_CATALOG, {
    category: 'All',
    formatFilter: 'all',
    query: '١٠ml',
    sortBy: 'featured',
    lang: 'ar',
  });
  assert.ok(arabicNumSearch.length >= 2);

  const allStrings: string[] = [];
  const collectStrings = (val: unknown) => {
    if (typeof val === 'string') {
      allStrings.push(val);
    } else if (typeof val === 'function') {
      allStrings.push(String((val as (n: number) => string)(150)));
    } else if (Array.isArray(val)) {
      val.forEach(collectStrings);
    } else if (val && typeof val === 'object') {
      Object.values(val).forEach(collectStrings);
    }
  };

  collectStrings(MOCK_CATALOG);
  collectStrings(TRANSLATIONS);
  for (const item of MOCK_CATALOG) {
    for (const l of ['ar', 'fr', 'en'] as const) {
      allStrings.push(getFormatLabel(item, item.isPack ? 'pack' : 'full', l));
      if (!item.isPack) {
        allStrings.push(getFormatLabel(item, 'decant10', l));
      }
    }
  }

  for (const s of allStrings) {
    assert.ok(
      !/[\u0660-\u0669\u06F0-\u06F9]/.test(s),
      `Found non-English Arabic-Indic numeral in string: "${s}"`
    );
    assert.ok(
      !/100\s*(ml|مل)/i.test(s),
      `Found forbidden 100ml reference in string: "${s}"`
    );
  }

  const custom150 = { ...MOCK_NOIR_ABSOLU, volumeLabel: '150ml' };
  assert.equal(getFormatLabel(custom150, 'full', 'ar'), 'عطر كامل (كومبلي 150ml)');
});

test('security: parseSafeStoredCart rejects non-arrays, prototype pollution, invalid IDs, NaN/negative/huge quantities, and price tampering', () => {
  assert.deepEqual(parseSafeStoredCart('{not-json', MOCK_CATALOG), []);
  assert.deepEqual(parseSafeStoredCart('{"id":"noir-absolu"}', MOCK_CATALOG), []);
  assert.deepEqual(
    parseSafeStoredCart('[{"__proto__":{"polluted":true},"id":"noir-absolu","quantity":2}]', MOCK_CATALOG),
    []
  );

  const tamperedPayload = JSON.stringify([
    { id: 'noir-absolu', format: 'full', quantity: 999999, priceMad: 1 },
    { id: 'noir-absolu', format: 'decant10', quantity: -5 },
    { id: 'fake-script-injection<script>', format: 'full', quantity: 2 },
    { id: 'royal-oud', format: 'decant10', quantity: 'NaN' },
  ]);

  const parsed = parseSafeStoredCart(tamperedPayload, MOCK_CATALOG);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].fragrance.id, 'noir-absolu');
  assert.equal(parsed[0].quantity, MAX_QTY_PER_ITEM);
  assert.equal(calculateCartTotal(parsed), 450 * MAX_QTY_PER_ITEM);
});

test('security: clampSafeQuantity, sanitizeUserText, and assertSafeExternalUrl block malicious payloads', () => {
  assert.equal(clampSafeQuantity(NaN, 1, 50), 1);
  assert.equal(clampSafeQuantity(Infinity, 1, 50), 1);
  assert.equal(clampSafeQuantity(9999, 1, 50), 50);
  assert.equal(clampSafeQuantity(-10, 0, 50), 0);

  const dirty = 'Slim\u0000\u0007\u001B[31m Alert';
  assert.equal(sanitizeUserText(dirty, 50, false), 'Slim [31m Alert');

  assert.equal(
    assertSafeExternalUrl('javascript:alert(1)'),
    'https://wa.me/212605816604'
  );
  assert.equal(
    assertSafeExternalUrl('https://evil-phishing.example.com/wa'),
    'https://wa.me/212605816604'
  );
  assert.equal(
    assertSafeExternalUrl('https://instagram.com/salim.fragrance'),
    'https://instagram.com/salim.fragrance'
  );

  const safeConcierge = buildConciergeWhatsAppUrl('en', '<script>alert(1)</script>\u0000');
  assert.ok(safeConcierge.startsWith('https://wa.me/212605816604?text='));
  assert.ok(!safeConcierge.includes('%00'));
});

test('security: validateContactForm rejects honeypot bots, ReDoS strings, and invalid inputs', () => {
  assert.equal(validateContactForm({ name: '', email: 'a@b.com', message: 'Hello' }), false);
  assert.equal(validateContactForm({ name: 'Slim', email: 'bad', message: 'Hello' }), false);
  assert.equal(
    validateContactForm({
      name: 'Slim',
      email: 'slim@casa.ma',
      message: 'Pack info please',
      honeypot: 'http://spam-bot.example',
    }),
    false
  );
  const longEmail = `${'a'.repeat(5000)}@${'b'.repeat(5000)}.com`;
  assert.equal(
    validateContactForm({ name: 'Slim', email: longEmail, message: 'Pack info' }),
    false
  );
  assert.equal(
    validateContactForm({ name: 'Slim', email: 'slim@casa.ma', message: 'Pack info' }),
    true
  );
});

test('security: default admin password has uppercase, lowercase, numbers, @ and brand connection', async () => {
  const { DEFAULT_ADMIN_PASSWORD, ADMIN_SECRET_ROUTE, verifyAdminPassword } = await import('./catalogStorage');
  assert.equal(DEFAULT_ADMIN_PASSWORD.length, 12);
  assert.ok(/[A-Z]/.test(DEFAULT_ADMIN_PASSWORD), 'Must contain uppercase');
  assert.ok(/[a-z]/.test(DEFAULT_ADMIN_PASSWORD), 'Must contain lowercase');
  assert.ok(/[0-9]/.test(DEFAULT_ADMIN_PASSWORD), 'Must contain numbers');
  assert.ok(/@/.test(DEFAULT_ADMIN_PASSWORD), 'Must contain arobase @');
  assert.ok(DEFAULT_ADMIN_PASSWORD.includes('Salim'), 'Must be related to brand name');
  assert.equal(ADMIN_SECRET_ROUTE, 'sf-vault-k89x2');
  assert.notEqual(ADMIN_SECRET_ROUTE, 'admin');

  assert.equal(verifyAdminPassword('Salim@Casa26'), true);
  assert.equal(verifyAdminPassword('Slim@Casa26'), true);
  assert.equal(verifyAdminPassword('wrong-pass'), false);
  assert.equal(verifyAdminPassword('2026'), false);
});

test('empty catalog preserves 0 items and does not resuscitate dummy items', () => {
  const emptyList: typeof ALL_CATALOG_ITEMS = [];
  const filtered = filterAndSortFragrances(emptyList, {
    category: 'All',
    formatFilter: 'all',
    query: '',
    sortBy: 'featured',
  });
  assert.equal(filtered.length, 0);
  assert.deepEqual(filtered, []);
});
