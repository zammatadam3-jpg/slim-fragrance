import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import {
  ALL_CATALOG_ITEMS,
  FormatFilter,
  FRAGRANCES,
  Fragrance,
  GenderCategory,
  Language,
  PACKS,
  ProductFormat,
  SortOption,
} from '../data/fragrances';
import { Translations } from '../data/translations';
import { filterAndSortFragrances } from '../utils/storeLogic';
import { ProductCard } from '../components/ProductCard';

type ScentMood = 'all' | 'oud' | 'woody' | 'floral' | 'fresh';

interface ShopViewProps {
  lang: Language;
  t: Translations;
  catalogItems?: Fragrance[];
  fragrances?: Fragrance[];
  packs?: Fragrance[];
  formatFilter: FormatFilter;
  onSelectFormatFilter: (fmt: FormatFilter) => void;
  selectedCategory: GenderCategory;
  onSelectCategory: (cat: GenderCategory) => void;
  onlyBestSellers: boolean;
  onToggleBestSellers: (val: boolean) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onAddToCart: (fragrance: Fragrance, format: ProductFormat) => void;
  onSelectProduct: (fragrance: Fragrance, format?: ProductFormat) => void;
}

const MOOD_MATCHERS: Record<Exclude<ScentMood, 'all'>, string[]> = {
  oud: ['oud', 'ambre', 'amber', 'orient', 'saffron', 'عود', 'عنبر', 'شرقي'],
  woody: ['noir', 'cuir', 'wood', 'cedar', 'leather', 'boisé', 'خشب', 'جلد'],
  floral: ['rose', 'jasmin', 'floral', 'زهري', 'ورد', 'ياسمين'],
  fresh: ['brume', 'sable', 'fresh', 'musk', 'musc', 'منعش', 'مسك'],
};

export const ShopView: React.FC<ShopViewProps> = ({
  lang,
  t,
  catalogItems = ALL_CATALOG_ITEMS,
  fragrances = FRAGRANCES,
  packs = PACKS,
  formatFilter,
  onSelectFormatFilter,
  selectedCategory,
  onSelectCategory,
  onlyBestSellers,
  onToggleBestSellers,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onAddToCart,
  onSelectProduct,
}) => {
  const [selectedMood, setSelectedMood] = useState<ScentMood>('all');

  const baseFiltered = useMemo(
    () =>
      filterAndSortFragrances(catalogItems, {
        category: selectedCategory,
        formatFilter,
        onlyBestSellers,
        query: searchQuery,
        sortBy,
        lang,
      }),
    [catalogItems, selectedCategory, formatFilter, onlyBestSellers, searchQuery, sortBy, lang]
  );

  const filteredFragrances = useMemo(() => {
    if (selectedMood === 'all') return baseFiltered;
    const keywords = MOOD_MATCHERS[selectedMood];
    return baseFiltered.filter((item) => {
      const text = [
        item.id,
        item.name,
        item.character.en,
        item.character.fr,
        item.character.ar,
        item.notes.top.en,
        item.notes.heart.en,
        item.notes.base.en,
      ]
        .join(' ')
        .toLowerCase();
      return keywords.some((kw) => text.includes(kw));
    });
  }, [baseFiltered, selectedMood]);

  const decant10Count = useMemo(
    () => catalogItems.filter((i) => i.isDecantOnly || (!i.isPack && i.decant10PriceMad !== undefined)).length,
    [catalogItems]
  );
  const fullCount = useMemo(
    () => catalogItems.filter((i) => !i.isPack && !i.isDecantOnly).length,
    [catalogItems]
  );
  const packCount = useMemo(
    () => catalogItems.filter((i) => i.isPack).length,
    [catalogItems]
  );

  const formatOptions: { value: FormatFilter; label: string; count: number }[] = [
    { value: 'all', label: t.formats.allFormats, count: catalogItems.length },
    { value: 'decant10', label: t.formats.decant10Short, count: decant10Count },
    { value: 'full', label: t.formats.fullBottleShort, count: fullCount },
    { value: 'pack', label: t.formats.packs, count: packCount },
  ];

  const categories: { value: GenderCategory; label: string }[] = [
    { value: 'All', label: t.collection.all },
    { value: 'For Him', label: t.collection.forHim },
    { value: 'For Her', label: t.collection.forHer },
    { value: 'Unisex', label: t.collection.unisex },
  ];

  const moods: { value: ScentMood; label: string }[] = [
    {
      value: 'all',
      label:
        lang === 'ar' ? 'كل الروائح' : lang === 'fr' ? 'Toutes les notes' : 'All Scents',
    },
    {
      value: 'oud',
      label:
        lang === 'ar' ? 'عود وعنبر' : lang === 'fr' ? 'Oud & Ambre' : 'Oud & Amber',
    },
    {
      value: 'woody',
      label:
        lang === 'ar' ? 'خشبي وجلد' : lang === 'fr' ? 'Boisé & Cuir' : 'Woody & Leather',
    },
    {
      value: 'floral',
      label:
        lang === 'ar' ? 'ورد وزهور' : lang === 'fr' ? 'Rose & Floral' : 'Rose & Floral',
    },
    {
      value: 'fresh',
      label:
        lang === 'ar' ? 'منعش ومسك' : lang === 'fr' ? 'Frais & Musc' : 'Fresh & Musk',
    },
  ];

  const hasActiveFilters =
    formatFilter !== 'all' ||
    selectedCategory !== 'All' ||
    onlyBestSellers ||
    selectedMood !== 'all' ||
    Boolean(searchQuery.trim());

  const handleReset = () => {
    onSelectFormatFilter('all');
    onSelectCategory('All');
    onToggleBestSellers(false);
    setSelectedMood('all');
    onSearchChange('');
    onSortChange('featured');
  };

  const cardDefaultFormat: ProductFormat =
    formatFilter === 'decant10' ? 'decant10' : 'full';

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 sm:pt-12 pb-28">
      {/* Compact, Clear Header so Products Appear Immediately Above the Fold */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 sm:pb-7">
        <div className="space-y-1.5">
          <p className="text-[11px] tracking-[0.24em] uppercase text-[#8C6239] font-medium">
            {t.collection.kicker}
          </p>
          <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#1E150F] leading-[1.12]">
            <span>{t.collection.titlePart1} </span>
            <span className="italic text-[#8C6239] font-normal">
              {t.collection.titleItalic}
            </span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#6B5748] max-w-md">
          {t.collection.subtitle}
        </p>
      </div>

      {/* Ultra-Clean Finder Card: Search First -> Format -> Gender & Scent Note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-[#FAF7F2] border border-[#E6DDD0] p-4 sm:p-5 space-y-3.5"
      >
        {/* 1. Prominent Search + Sort Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
          <div className="md:col-span-8 relative">
            <label htmlFor="scent-search" className="sr-only">
              {t.collection.searchPlaceholder}
            </label>
            <Search className="w-4 h-4 text-[#8C6239] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="scent-search"
              type="text"
              inputMode="search"
              maxLength={100}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.collection.searchPlaceholder}
              className="w-full h-11 sm:h-12 ps-11 pe-10 rounded-2xl bg-white border border-[#E6DDD0] text-sm text-[#1E150F] placeholder:text-[#6B5748]/75 focus:outline-none focus:border-[#8C6239] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#6B5748] hover:text-[#1E150F]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 relative">
            <label htmlFor="scent-sort" className="sr-only">
              Sort fragrances
            </label>
            <SlidersHorizontal className="w-4 h-4 text-[#6B5748] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="scent-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full h-11 sm:h-12 ps-11 pe-9 rounded-2xl bg-white border border-[#E6DDD0] text-sm text-[#1E150F] focus:outline-none focus:border-[#8C6239] appearance-none cursor-pointer transition-colors"
            >
              <option value="featured">{t.collection.sortFeatured}</option>
              <option value="price-asc">{t.collection.sortPriceAsc}</option>
              <option value="price-desc">{t.collection.sortPriceDesc}</option>
              <option value="name">{t.collection.sortName}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#6B5748] absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Format Tabs (2x2 on Mobile, 4-col on Desktop) with Item Counts */}
        <div
          role="group"
          aria-label="Filter by product format"
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        >
          {formatOptions.map((opt) => {
            const active = formatFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectFormatFilter(opt.value)}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  active
                    ? 'bg-[#2B1D14] text-[#FAF7F2] shadow-xs'
                    : 'bg-white border border-[#E6DDD0] text-[#1E150F] hover:border-[#8C6239]'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${
                    active
                      ? 'bg-white/15 text-[#FAF7F2]'
                      : 'bg-[#FAF7F2] text-[#8C6239]'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Gender + Scent Note Pills (Easy 1-tap narrowing) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-0.5">
          {/* Gender */}
          <div
            role="group"
            aria-label="Filter fragrances by category"
            className="grid grid-cols-4 sm:inline-flex items-center gap-1.5"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat.value && !onlyBestSellers;
              return (
                <button
                  key={cat.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    onSelectCategory(cat.value);
                    onToggleBestSellers(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-[11px] font-medium tracking-[0.08em] uppercase transition-colors whitespace-nowrap text-center ${
                    active
                      ? 'bg-[#8C6239] text-white'
                      : 'bg-white border border-[#E6DDD0] text-[#6B5748] hover:text-[#1E150F]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Scent Family / Mood Quick Chips (Wrapped cleanly so all 5 are visible on mobile) */}
          <div
            role="group"
            aria-label="Filter by scent family"
            className="flex flex-wrap items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8C6239] shrink-0 me-0.5 hidden sm:block" />
            {moods.map((mood) => {
              const active = selectedMood === mood.value;
              return (
                <button
                  key={mood.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#1E150F] text-[#FAF7F2] font-medium'
                      : 'bg-white border border-[#E6DDD0] text-[#6B5748] hover:border-[#8C6239] hover:text-[#1E150F]'
                  }`}
                >
                  {mood.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Results Count + Instant Reset */}
      <div className="py-4 sm:py-5 flex items-center justify-between text-xs tracking-[0.1em] text-[#6B5748] lining-nums tabular-nums">
        <span>{t.collection.countLabel(filteredFragrances.length)}</span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[#8C6239] font-semibold hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t.collection.resetFilters}</span>
          </button>
        )}
      </div>

      {/* Collection Grid */}
      {filteredFragrances.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-[#E6DDD0] bg-[#FAF7F2] px-6 max-w-xl mx-auto">
          <p className="font-serif-editorial text-2xl text-[#1E150F]">
            {catalogItems.length === 0
              ? lang === 'ar'
                ? 'المتجر قيد تجديد التشكيلة'
                : lang === 'fr'
                ? 'Collection en cours de réapprovisionnement'
                : 'Collection being refreshed'
              : t.collection.emptyState}
          </p>
          {catalogItems.length === 0 ? (
            <p className="mt-2 text-sm text-[#6B5748] leading-relaxed">
              {lang === 'ar'
                ? 'تواصل معنا مباشرة عبر واتساب لطلب أي عطر أو الاستفسار.'
                : lang === 'fr'
                ? 'Contactez notre conciergerie WhatsApp pour toute demande spécifique.'
                : 'Contact our WhatsApp concierge directly for any scent inquiries.'}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 px-7 py-3 rounded-full bg-[#2B1D14] text-[#FAF7F2] text-xs font-semibold tracking-[0.18em] uppercase hover:bg-[#3E2A1E] transition-colors"
            >
              {t.collection.resetFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredFragrances.map((fragrance, idx) => (
            <ProductCard
              key={fragrance.id}
              fragrance={fragrance}
              defaultFormat={cardDefaultFormat}
              lang={lang}
              t={t}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};
