import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, MessageCircle, Search, X } from 'lucide-react';
import {
  ALL_CATALOG_ITEMS,
  ATELIER_STORY_IMAGE,
  FormatFilter,
  FRAGRANCES,
  Fragrance,
  GenderCategory,
  HERO_ARCH_IMAGE,
  Language,
  PACKS,
  PageView,
  ProductFormat,
} from '../data/fragrances';
import { Translations } from '../data/translations';
import {
  buildConciergeWhatsAppUrl,
  buildSingleProductWhatsAppUrl,
  filterAndSortFragrances,
  getUnitPrice,
} from '../utils/storeLogic';
import { LuxuryImage } from '../components/LuxuryImage';
import { ProductCard } from '../components/ProductCard';
import { ScrollReveal } from '../components/ScrollReveal';

interface HomeViewProps {
  lang: Language;
  t: Translations;
  catalogItems?: Fragrance[];
  fragrances?: Fragrance[];
  packs?: Fragrance[];
  onNavigate: (page: PageView) => void;
  onNavigateShopWithFormat: (
    format: FormatFilter,
    category?: GenderCategory,
    query?: string
  ) => void;
  onAddToCart: (fragrance: Fragrance, format: ProductFormat) => void;
  onSelectProduct: (fragrance: Fragrance, format?: ProductFormat) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  t,
  catalogItems = ALL_CATALOG_ITEMS,
  fragrances = FRAGRANCES,
  packs = PACKS,
  onNavigate,
  onNavigateShopWithFormat,
  onAddToCart,
  onSelectProduct,
}) => {
  const [quickQuery, setQuickQuery] = useState('');
  const [homeTab, setHomeTab] = useState<'all' | 'decant10' | 'pack'>('all');
  const [homeGender, setHomeGender] = useState<GenderCategory>('All');
  const catalogSectionRef = useRef<HTMLElement | null>(null);

  const heroFragrance =
    fragrances.find((f) => f.id === 'noir-absolu') ?? fragrances[0] ?? catalogItems[0];

  const instantMatches = useMemo(() => {
    const q = quickQuery.trim();
    if (!q) return [];
    return filterAndSortFragrances(catalogItems, {
      category: 'All',
      formatFilter: 'all',
      query: q,
      sortBy: 'featured',
      lang,
    }).slice(0, 5);
  }, [quickQuery, lang, catalogItems]);

  const homeCatalogItems = useMemo(() => {
    const formatFilter: FormatFilter =
      homeTab === 'pack' ? 'pack' : homeTab === 'decant10' ? 'decant10' : 'full';
    return filterAndSortFragrances(catalogItems, {
      category: homeGender,
      formatFilter,
      query: '',
      sortBy: 'featured',
      lang,
    });
  }, [homeTab, homeGender, lang, catalogItems]);

  const scrollToHomeCatalog = (
    tab: 'all' | 'decant10' | 'pack',
    gender: GenderCategory = 'All'
  ) => {
    setHomeTab(tab);
    setHomeGender(gender);
    catalogSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const quickShortcuts: {
    id: string;
    title: string;
    subtitle: string;
    onClick: () => void;
  }[] = [
    {
      id: 'decant10',
      title:
        lang === 'ar'
          ? 'تقسيمات 10ml'
          : lang === 'fr'
          ? 'Décants 10ml'
          : '10ml Decants',
      subtitle:
        lang === 'ar'
          ? 'ابتداءً من 50 درهم'
          : lang === 'fr'
          ? 'Dès 50 MAD'
          : 'From 50 MAD',
      onClick: () => scrollToHomeCatalog('decant10', 'All'),
    },
    {
      id: 'full',
      title:
        lang === 'ar'
          ? 'عطور كومبلي'
          : lang === 'fr'
          ? 'Flacons Complets'
          : 'Full Bottles',
      subtitle:
        lang === 'ar'
          ? 'قارورة كاملة أصلية'
          : lang === 'fr'
          ? 'Flacon original scellé'
          : 'Original full bottle',
      onClick: () => scrollToHomeCatalog('all', 'All'),
    },
    {
      id: 'packs',
      title:
        lang === 'ar'
          ? 'الباكات والعروض'
          : lang === 'fr'
          ? 'Packs & Coffrets'
          : 'Curated Packs',
      subtitle:
        lang === 'ar'
          ? 'وفّر حتى 275 درهم'
          : lang === 'fr'
          ? 'Jusqu’à -275 MAD'
          : 'Save up to 275 MAD',
      onClick: () => scrollToHomeCatalog('pack', 'All'),
    },
  ];

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateShopWithFormat('all', 'All', quickQuery.trim());
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* 1. HERO + INSTANT PRODUCT FINDER */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 sm:pt-12 lg:pt-16">
        {/* Instant Search Bar right at top for effortless product discovery */}
        <div className="max-w-2xl mb-7 sm:mb-10">
          <div className="relative">
            <form onSubmit={handleQuickSearchSubmit} className="relative">
              <label htmlFor="home-instant-search" className="sr-only">
                {t.collection.searchPlaceholder}
              </label>
              <Search className="w-4 h-4 text-[#8C6239] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="home-instant-search"
                type="text"
                inputMode="search"
                maxLength={100}
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder={t.collection.searchPlaceholder}
                className="w-full h-12 sm:h-13 ps-11 pe-11 rounded-2xl bg-[#FAF7F2] border border-[#E6DDD0] text-sm text-[#1E150F] placeholder:text-[#6B5748]/80 focus:outline-none focus:border-[#8C6239] focus:bg-white transition-all shadow-2xs"
              />
              {quickQuery && (
                <button
                  type="button"
                  onClick={() => setQuickQuery('')}
                  aria-label="Clear quick search"
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6B5748] hover:text-[#1E150F]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Instant Live Results Dropdown */}
            <AnimatePresence>
              {quickQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.16 }}
                  className="absolute inset-x-0 top-full mt-2 z-30 rounded-2xl bg-white border border-[#E6DDD0] shadow-[0_18px_40px_rgba(30,21,15,0.14)] overflow-hidden"
                >
                  {instantMatches.length === 0 ? (
                    <div className="p-4 text-sm text-[#6B5748] text-center">
                      {t.collection.emptyState}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EAE0D3]">
                      {instantMatches.map((item) => {
                        const defaultFmt: ProductFormat = item.isPack
                          ? 'pack'
                          : 'full';
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setQuickQuery('');
                              onSelectProduct(item, defaultFmt);
                            }}
                            className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#FAF7F2] transition-colors text-start"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F5EFE6] border border-[#E6DDD0] shrink-0">
                                <LuxuryImage
                                  src={item.image}
                                  alt={item.name}
                                  fallbackLabel={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-serif-editorial text-lg text-[#1E150F] truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-[#6B5748] truncate">
                                  {item.isPack && item.packSummary
                                    ? item.packSummary[lang]
                                    : item.character[lang]}
                                </p>
                              </div>
                            </div>

                            <div className="text-end shrink-0">
                              {item.isPack ? (
                                <span
                                  dir="ltr"
                                  className="inline-block text-sm font-semibold text-[#8C6239] lining-nums tabular-nums"
                                >
                                  {item.priceMad} MAD
                                </span>
                              ) : (
                                <div className="text-xs lining-nums tabular-nums">
                                  <span className="block font-semibold text-[#8C6239]">
                                    <span dir="ltr" className="inline-block">
                                      10ml · {item.decant10PriceMad} DH
                                    </span>
                                  </span>
                                  <span className="block text-[#6B5748]">
                                    <span>{t.formats.fullBottleShort} · </span>
                                    <span dir="ltr" className="inline-block">
                                      {item.priceMad} DH
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() =>
                          onNavigateShopWithFormat('all', 'All', quickQuery.trim())
                        }
                        className="w-full px-4 py-2.5 bg-[#FAF7F2] text-xs font-semibold tracking-[0.14em] uppercase text-[#8C6239] hover:text-[#1E150F] text-center"
                      >
                        {t.signatureEdit.viewAll}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3 One-Tap Shortcut Cards: 10ml Decants, Full Bottles, Packs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3.5">
            {quickShortcuts.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={card.onClick}
                className="p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DDD0] hover:border-[#8C6239] text-start transition-all group"
              >
                <span className="block text-xs sm:text-[13px] font-semibold text-[#1E150F] group-hover:text-[#8C6239] transition-colors truncate">
                  {card.title}
                </span>
                <span className="block text-[11px] text-[#6B5748] mt-0.5 truncate">
                  {card.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-3xl space-y-5 sm:space-y-6">
          {/* Editorial Column */}
          <div className="space-y-5 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3.5"
            >
              <span
                className="w-8 sm:w-10 h-px bg-[#8C6239]/75 shrink-0"
                aria-hidden="true"
              />
              <p className="text-[11px] sm:text-xs tracking-[0.24em] uppercase text-[#8C6239] font-medium leading-relaxed">
                {t.hero.kicker}
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.72,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-serif-editorial text-[42px] sm:text-6xl lg:text-[64px] leading-[1.08] text-[#1E150F] text-balance"
            >
              <span className="block">{t.hero.titlePart1}</span>
              <span className="block italic text-[#8C6239] font-normal mt-1">
                {t.hero.titleItalic}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[15px] sm:text-lg text-[#6B5748] leading-[1.7] max-w-xl"
            >
              {t.hero.subtitle}
            </motion.p>

            {/* Clean 2-Button Primary CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <button
                type="button"
                onClick={() => scrollToHomeCatalog('all', 'All')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] active:scale-[0.99] text-[#FAF7F2] text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-3 transition-all duration-200 whitespace-nowrap shadow-sm"
              >
                <span>{t.hero.shopNow}</span>
                <ArrowRight
                  className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`}
                />
              </button>

              <a
                href={buildConciergeWhatsAppUrl(lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] hover:bg-[#F5EFE6] hover:border-[#8C6239] active:scale-[0.99] text-[#1E150F] text-xs font-medium tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2.5 transition-all duration-200 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#8C6239] shrink-0" />
                <span>{t.hero.orderWhatsapp}</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. EASY DIRECT CATALOG ON HOME (Switch Format & Gender right on Home without page reloads) */}
      <section
        ref={catalogSectionRef}
        className="max-w-7xl mx-auto px-5 sm:px-8 pt-2 scroll-mt-24"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7 sm:mb-9">
          <div className="space-y-2.5 max-w-2xl">
            <ScrollReveal distance={18}>
              <p
                className={`text-[11px] sm:text-xs text-[#8C6239] font-medium ${
                  lang === 'ar' ? 'tracking-normal' : 'tracking-[0.26em] uppercase'
                }`}
              >
                {t.signatureEdit.kicker}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.06} distance={22}>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl text-[#1E150F] leading-[1.12] text-balance">
                <span>{t.signatureEdit.titlePart1} </span>
                <span className="italic text-[#8C6239] font-normal">
                  {t.signatureEdit.titleItalic}
                </span>
              </h2>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.12} distance={18}>
            <button
              type="button"
              onClick={() => onNavigateShopWithFormat('all', 'All')}
              className="self-start md:self-auto px-5 py-3 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] hover:bg-[#F5EFE6] hover:border-[#8C6239] text-xs font-medium tracking-[0.18em] uppercase text-[#1E150F] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t.signatureEdit.viewAll}</span>
              <ArrowRight
                className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`}
              />
            </button>
          </ScrollReveal>
        </div>

        {/* Simple 2-Step Visual Selector Bar on Home */}
        <div className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Format Tabs: Full Bottles | 10ml Decants | Packs */}
          <div
            role="group"
            aria-label="Home quick format filter"
            className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-[#E6DDD0]"
          >
            <button
              type="button"
              aria-pressed={homeTab === 'decant10'}
              onClick={() => setHomeTab('decant10')}
              className={`py-2 px-1.5 sm:px-4 rounded-lg text-xs font-medium transition-all whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                homeTab === 'decant10'
                  ? 'bg-[#8C6239] text-[#FAF7F2] shadow-2xs font-semibold'
                  : 'text-[#8C6239] hover:text-[#1E150F] font-medium'
              }`}
            >
              <span>{t.formats.decant10Short}</span>
            </button>
            <button
              type="button"
              aria-pressed={homeTab === 'all'}
              onClick={() => setHomeTab('all')}
              className={`py-2 px-2.5 sm:px-4 rounded-lg text-xs font-medium transition-all whitespace-nowrap text-center ${
                homeTab === 'all'
                  ? 'bg-[#2B1D14] text-[#FAF7F2] shadow-2xs'
                  : 'text-[#6B5748] hover:text-[#1E150F]'
              }`}
            >
              {t.formats.fullBottleShort}
            </button>
            <button
              type="button"
              aria-pressed={homeTab === 'pack'}
              onClick={() => setHomeTab('pack')}
              className={`py-2 px-2.5 sm:px-4 rounded-lg text-xs font-medium transition-all whitespace-nowrap text-center ${
                homeTab === 'pack'
                  ? 'bg-[#2B1D14] text-[#FAF7F2] shadow-2xs'
                  : 'text-[#6B5748] hover:text-[#1E150F]'
              }`}
            >
              {lang === 'ar' ? 'الباكات' : lang === 'fr' ? 'Packs' : 'Packs'}
            </button>
          </div>

          {/* Gender Quick Filter: All / For Him / For Her / Unisex */}
          <div
            role="group"
            aria-label="Home quick gender filter"
            className="grid grid-cols-4 sm:flex items-center gap-1.5"
          >
            {(
              [
                { value: 'All', label: t.collection.all },
                { value: 'For Him', label: t.collection.forHim },
                { value: 'For Her', label: t.collection.forHer },
                { value: 'Unisex', label: t.collection.unisex },
              ] as { value: GenderCategory; label: string }[]
            ).map((g) => {
              const active = homeGender === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setHomeGender(g.value)}
                  className={`py-2 px-2.5 sm:px-3.5 rounded-lg text-[11px] font-medium tracking-[0.08em] uppercase transition-colors whitespace-nowrap text-center ${
                    active
                      ? 'bg-[#8C6239] text-white'
                      : 'bg-white border border-[#E6DDD0] text-[#6B5748] hover:text-[#1E150F]'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* All Matching Products Displayed Directly */}
        {homeCatalogItems.length === 0 ? (
          <div className="py-14 text-center rounded-3xl bg-[#FAF7F2] border border-[#E6DDD0] px-6 max-w-xl mx-auto">
            {catalogItems.length === 0 ? (
              <>
                <p className="font-serif-editorial text-2xl text-[#1E150F]">
                  {lang === 'ar'
                    ? 'المتجر قيد تجديد التشكيلة'
                    : lang === 'fr'
                    ? 'Collection en cours de réapprovisionnement'
                    : 'Collection being refreshed'}
                </p>
                <p className="mt-2 text-sm text-[#6B5748] leading-relaxed">
                  {lang === 'ar'
                    ? 'تواصل مباشرة مع خدمة العملاء عبر واتساب لطلب عطورك المفضلة أو الاستفسار عن التوفر.'
                    : lang === 'fr'
                    ? 'Contactez notre conciergerie WhatsApp pour toute commande de parfum ou renseignement.'
                    : 'Contact our WhatsApp concierge directly for scent requests or availability.'}
                </p>
                <a
                  href={buildConciergeWhatsAppUrl(lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#2B1D14] text-[#FAF7F2] text-xs font-semibold tracking-[0.16em] uppercase hover:bg-[#3E2A1E] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#8C6239]" />
                  <span>{t.hero.orderWhatsapp}</span>
                </a>
              </>
            ) : (
              <>
                <p className="text-sm text-[#6B5748]">{t.collection.emptyState}</p>
                <button
                  type="button"
                  onClick={() => {
                    setHomeTab('all');
                    setHomeGender('All');
                  }}
                  className="mt-3 text-xs font-semibold text-[#8C6239] underline"
                >
                  {t.collection.resetFilters}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {homeCatalogItems.map((fragrance, idx) => (
              <ProductCard
                key={fragrance.id}
                fragrance={fragrance}
                defaultFormat={homeTab === 'decant10' ? 'decant10' : 'full'}
                lang={lang}
                t={t}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
                index={idx}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. DEDICATED CURATED PACKS SECTION (Only displayed if packs exist) */}
      {homeTab !== 'pack' && packs.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-9 sm:mb-11">
            <div className="space-y-3 max-w-2xl">
              <ScrollReveal distance={18}>
                <p className="text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#8C6239] font-medium">
                  {t.packsSection.kicker}
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.07} distance={24}>
                <h2 className="font-serif-editorial text-3xl sm:text-5xl text-[#1E150F] leading-[1.1] text-balance">
                  <span>{t.packsSection.titlePart1} </span>
                  <span className="italic text-[#8C6239] font-normal">
                    {t.packsSection.titleItalic}
                  </span>
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.14} distance={20}>
                <p className="text-sm sm:text-base text-[#6B5748] leading-relaxed">
                  {t.packsSection.subtitle}
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.18} distance={18}>
              <button
                type="button"
                onClick={() => onNavigateShopWithFormat('pack', 'All')}
                className="self-start md:self-auto px-6 py-3.5 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] hover:bg-[#F5EFE6] hover:border-[#8C6239] text-xs font-medium tracking-[0.2em] uppercase text-[#1E150F] inline-flex items-center gap-2.5 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.packsSection.viewAllPacks}</span>
                <ArrowRight
                  className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`}
                />
              </button>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {packs.map((packItem, idx) => (
              <ProductCard
                key={packItem.id}
                fragrance={packItem}
                defaultFormat="pack"
                lang={lang}
                t={t}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. OUR STORY SECTION */}
      <section className="border-y border-[#E6DDD0] bg-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <ScrollReveal distance={18}>
                <p className="text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#8C6239] font-medium">
                  {t.story.kicker}
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.07} distance={24}>
                <h2 className="font-serif-editorial text-3xl sm:text-5xl text-[#1E150F] leading-[1.14] text-balance">
                  <span>{t.story.titlePart1} </span>
                  <span className="italic text-[#8C6239] font-normal">
                    {t.story.titleItalic}
                  </span>
                </h2>
              </ScrollReveal>

              <ScrollReveal
                delay={0.12}
                scale={0.98}
                className="lg:hidden rounded-3xl overflow-hidden border border-[#E6DDD0] aspect-[4/3] my-6 bg-[#F5EFE6]"
              >
                <LuxuryImage
                  src={ATELIER_STORY_IMAGE}
                  alt="SALIM FRAGRANCE Ksar El Kebir Atelier"
                  fallbackLabel="Maison Ksar El Kebir"
                  className="w-full h-full object-cover"
                />
              </ScrollReveal>

              <div className="space-y-4 text-sm sm:text-base text-[#6B5748] leading-relaxed">
                <ScrollReveal delay={0.14} distance={20}>
                  <p>{t.story.p1}</p>
                </ScrollReveal>
                <ScrollReveal delay={0.2} distance={20}>
                  <p>{t.story.p2}</p>
                </ScrollReveal>
              </div>

              <ScrollReveal delay={0.26} distance={18} className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateShopWithFormat('all', 'All')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] text-[#FAF7F2] text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-3 transition-colors whitespace-nowrap shadow-sm"
                >
                  <span>{t.story.cta}</span>
                  <ArrowRight
                    className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`}
                  />
                </button>
              </ScrollReveal>
            </div>

            <ScrollReveal
              delay={0.15}
              scale={0.97}
              className="hidden lg:block lg:col-span-6"
            >
              <div className="rounded-[28px] overflow-hidden border border-[#E6DDD0] aspect-[4/3.4] shadow-[0_20px_50px_rgba(30,21,15,0.1)] bg-[#F5EFE6]">
                <LuxuryImage
                  src={ATELIER_STORY_IMAGE}
                  alt="SALIM FRAGRANCE Ksar El Kebir Atelier"
                  fallbackLabel="Maison Ksar El Kebir"
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. CONCIERGE CTA */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center py-2 sm:py-4">
        <div className="space-y-6">
          <ScrollReveal distance={18}>
            <p className="text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#8C6239] font-medium">
              {t.conciergeCta.kicker}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.08} distance={24}>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl text-[#1E150F] leading-[1.14] text-balance">
              <span>{t.conciergeCta.titlePart1} </span>
              <span className="italic text-[#8C6239] font-normal">
                {t.conciergeCta.titleItalic}
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal
            delay={0.16}
            distance={20}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4"
          >
            <a
              href={buildConciergeWhatsAppUrl(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] text-[#FAF7F2] text-xs font-semibold tracking-[0.2em] uppercase transition-colors whitespace-nowrap text-center shadow-sm"
            >
              {t.conciergeCta.primaryBtn}
            </a>

            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] hover:bg-[#F5EFE6] hover:border-[#8C6239] text-xs font-medium tracking-[0.2em] uppercase text-[#1E150F] transition-colors whitespace-nowrap"
            >
              {t.conciergeCta.secondaryBtn}
            </button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
