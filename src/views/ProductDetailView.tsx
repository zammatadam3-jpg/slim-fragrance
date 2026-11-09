import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import {
  Fragrance,
  FRAGRANCES,
  Language,
  PACKS,
  ProductFormat,
} from '../data/fragrances';
import { Translations } from '../data/translations';
import {
  buildSingleProductWhatsAppUrl,
  getFormatLabel,
  getUnitPrice,
} from '../utils/storeLogic';
import { LuxuryImage } from '../components/LuxuryImage';
import { ProductCard } from '../components/ProductCard';
import { ScrollReveal } from '../components/ScrollReveal';

interface ProductDetailViewProps {
  fragrance: Fragrance;
  initialFormat?: ProductFormat;
  fragrances?: Fragrance[];
  packs?: Fragrance[];
  lang: Language;
  t: Translations;
  onBack: () => void;
  onAddToCart: (fragrance: Fragrance, qty: number, format: ProductFormat) => void;
  onSelectProduct: (fragrance: Fragrance, format?: ProductFormat) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  fragrance,
  initialFormat = 'full',
  fragrances = FRAGRANCES,
  packs = PACKS,
  lang,
  t,
  onBack,
  onAddToCart,
  onSelectProduct,
}) => {
  const isPack = Boolean(fragrance.isPack);
  const isDecantOnly = Boolean(fragrance.isDecantOnly);
  const hasDecant = !isPack && !isDecantOnly && fragrance.decant10PriceMad !== undefined;

  const [selectedFormat, setSelectedFormat] = useState<ProductFormat>(() =>
    isPack
      ? 'pack'
      : isDecantOnly || (initialFormat === 'decant10' && hasDecant)
      ? 'decant10'
      : 'full'
  );
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setSelectedFormat(
      isPack
        ? 'pack'
        : isDecantOnly || (initialFormat === 'decant10' && hasDecant)
        ? 'decant10'
        : 'full'
    );
    setQuantity(1);
  }, [fragrance.id, initialFormat, isPack, isDecantOnly, hasDecant]);

  const activeFormat: ProductFormat = isPack ? 'pack' : isDecantOnly ? 'decant10' : selectedFormat;
  const unitPrice = getUnitPrice(fragrance, activeFormat);
  const savingsMad =
    isPack && fragrance.originalPriceMad && fragrance.originalPriceMad > fragrance.priceMad
      ? fragrance.originalPriceMad - fragrance.priceMad
      : 0;

  const related = isPack
    ? [
        ...packs.filter((p) => p.id !== fragrance.id),
        ...fragrances.slice(0, 1),
      ].slice(0, 3)
    : [
        ...fragrances.filter((f) => f.id !== fragrance.id).slice(0, 2),
        ...(packs.length > 0 ? [packs[0]] : []),
      ];

  const handleAdd = () => {
    onAddToCart(fragrance, quantity, activeFormat);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1500);
  };

  const localizedCategory =
    fragrance.category === 'For Him'
      ? lang === 'ar'
        ? 'للرجال'
        : lang === 'fr'
        ? 'Pour Lui'
        : 'For Him'
      : fragrance.category === 'For Her'
      ? lang === 'ar'
        ? 'للنساء'
        : lang === 'fr'
        ? 'Pour Elle'
        : 'For Her'
      : lang === 'ar'
      ? 'للجنسين'
      : lang === 'fr'
      ? 'Unisexe'
      : 'Unisex';

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 sm:pt-12 pb-28 space-y-20 sm:space-y-24">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2.5 text-xs tracking-[0.2em] uppercase text-[#6B5748] hover:text-[#8C6239] transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft
            className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`}
          />
          <span>{t.productDetail.backToCollection}</span>
        </button>

        {/* Contiguous Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 lg:sticky lg:top-28"
          >
            <div className="relative rounded-[28px] overflow-hidden border border-[#E6DDD0] bg-[#FAF7F2] aspect-[4/4.3] shadow-[0_18px_45px_rgba(30,21,15,0.1)]">
              <LuxuryImage
                src={fragrance.image}
                alt={fragrance.name}
                fallbackLabel={fragrance.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 start-4 flex flex-col items-start gap-1.5">
                {isPack ? (
                  <span className="px-4 py-1.5 rounded-full bg-[#2B1D14]/95 backdrop-blur-md border border-[#8C6239]/50 text-xs font-medium tracking-[0.14em] text-[#FAF7F2] shadow-xs">
                    {t.formats.packBadge}
                  </span>
                ) : (
                  fragrance.badge && (
                    <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E6DDD0] text-xs font-medium tracking-[0.14em] text-[#2B1D14] shadow-xs">
                      {fragrance.badge === 'Best Seller'
                        ? t.card.bestSellerBadge
                        : t.card.newBadge}
                    </span>
                  )
                )}
                {savingsMad > 0 && (
                  <span className="px-3.5 py-1 rounded-full bg-white/95 border border-[#D4C2AC] text-[11px] font-semibold tracking-[0.1em] text-[#8C6239] shadow-xs">
                    {t.formats.saveAmount(savingsMad)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-6 space-y-6 sm:space-y-7 min-w-0">
            {/* Metadata & Name */}
            <ScrollReveal
              delay={0.06}
              distance={22}
              className="space-y-3 border-b border-[#E6DDD0] pb-6"
            >
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs tracking-[0.15em] uppercase text-[#8C6239] font-medium">
                <span>{localizedCategory}</span>
                <span aria-hidden="true">·</span>
                <span>{fragrance.character[lang]}</span>
                <span aria-hidden="true">·</span>
                <span className="lining-nums tabular-nums">
                  {getFormatLabel(fragrance, activeFormat, lang)}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-3 pt-1">
                <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#1E150F]">
                  {fragrance.name}
                </h1>
                <div dir="ltr" className="flex items-baseline gap-2.5">
                  {isPack && fragrance.originalPriceMad && (
                    <span className="text-base text-[#6B5748]/75 line-through lining-nums tabular-nums">
                      {fragrance.originalPriceMad} MAD
                    </span>
                  )}
                  <span className="font-serif-editorial text-3xl sm:text-4xl text-[#8C6239] font-medium lining-nums tabular-nums">
                    {unitPrice} MAD
                  </span>
                </div>
              </div>

              <p className="pt-2 text-[15px] sm:text-base text-[#6B5748] leading-relaxed">
                {fragrance.description[lang]}
              </p>
            </ScrollReveal>

            {/* Dedicated Format Badge Banner */}
            <ScrollReveal
              delay={0.09}
              distance={18}
              className="p-4 rounded-2xl bg-white border border-[#E6DDD0] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C6239] animate-pulse" />
                <div>
                  <p className="text-xs font-semibold text-[#1E150F]">
                    {activeFormat === 'decant10' || isDecantOnly
                      ? lang === 'ar'
                        ? 'تقسيمة عطر أصلية 10ml (Décant)'
                        : lang === 'fr'
                        ? 'Décant Parfum Original 10ml'
                        : '10ml Original Perfume Decant'
                      : isPack
                      ? lang === 'ar'
                        ? 'باك وعرض خاص (Coffret)'
                        : lang === 'fr'
                        ? 'Coffret Parfum Prestige'
                        : 'Prestige Fragrance Pack'
                      : lang === 'ar'
                      ? 'قارورة أصلية كاملة (كومبلي)'
                      : lang === 'fr'
                      ? 'Flacon Complet Original'
                      : 'Sealed Original Full Bottle'}
                  </p>
                  <p className="text-[11px] text-[#6B5748]">
                    {activeFormat === 'decant10' || isDecantOnly
                      ? lang === 'ar'
                        ? 'تعبئة احترافية من القارورة الرسمية في بخاخ زجاجي راقٍ 10ml (~140 رشة)'
                        : lang === 'fr'
                        ? 'Échantillonnage du flacon officiel dans un atomiseur en verre 10ml'
                        : 'Sampled directly from official bottle into a 10ml glass atomizer'
                      : isPack
                      ? lang === 'ar'
                        ? 'بوكس فاخر مجمع للبيع بسعر تفضيلي مميز'
                        : lang === 'fr'
                        ? 'Sélection exclusive présentée dans son coffret d’exception'
                        : 'Exclusive curated collection presented in a house box'
                      : lang === 'ar'
                      ? 'عطر فاخر أصلي بقارورته المغلقة الكاملة كما وردت من المصدر'
                      : lang === 'fr'
                      ? 'Flacon complet officiel avec son emballage d’origine scellé'
                      : 'Official full bottle sealed in original house packaging'}
                  </p>
                </div>
              </div>
              <span className="font-serif-editorial text-xl text-[#8C6239] font-medium lining-nums tabular-nums whitespace-nowrap ps-2" dir="ltr">
                {unitPrice} MAD
              </span>
            </ScrollReveal>

            {/* Included in this Pack Checklist */}
            {isPack && fragrance.packContents && (
              <ScrollReveal
                delay={0.09}
                distance={18}
                className="rounded-2xl bg-[#FAF7F2] border border-[#E6DDD0] p-5 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#8C6239] font-semibold">
                  <Package className="w-4 h-4 stroke-[1.8]" />
                  <span>{t.formats.includedInPack}</span>
                </div>
                <ul className="space-y-2.5 pt-1">
                  {fragrance.packContents.map((line, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-[#1E150F]"
                    >
                      <span className="mt-1 w-4 h-4 rounded-full bg-[#2B1D14] text-[#FAF7F2] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                      </span>
                      <span>{line[lang]}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            )}

            {/* Mobile-Optimized Quantity & Purchase Actions */}
            <ScrollReveal delay={0.16} distance={20} className="space-y-3.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Quantity Selector */}
                <div className="inline-flex items-center justify-between sm:justify-center rounded-full border border-[#E6DDD0] bg-[#FAF7F2] px-4 py-2 sm:px-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease bottle quantity"
                    className="w-9 h-9 flex items-center justify-center text-[#6B5748] hover:text-[#1E150F]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-medium text-[#1E150F] lining-nums tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    aria-label="Increase bottle quantity"
                    className="w-9 h-9 flex items-center justify-center text-[#6B5748] hover:text-[#1E150F]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Selection Button */}
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full sm:flex-1 py-4 px-5 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] hover:bg-[#F5EFE6] hover:border-[#8C6239] active:scale-[0.99] text-[#1E150F] text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center justify-center gap-2.5 transition-all"
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-[#8C6239] shrink-0" />
                      <span>{t.card.added}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#8C6239] shrink-0" />
                      <span>{t.productDetail.addToCollection}</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={buildSingleProductWhatsAppUrl(
                  fragrance,
                  lang,
                  quantity,
                  activeFormat
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-5 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] active:scale-[0.99] text-[#FAF7F2] text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center justify-center gap-2.5 transition-all shadow-md text-center"
              >
                <MessageCircle className="w-4 h-4 stroke-[2] shrink-0" />
                <span>
                  {t.productDetail.orderDirectWhatsapp} ·{' '}
                  <span dir="ltr" className="inline-block lining-nums tabular-nums">
                    {unitPrice * quantity} MAD
                  </span>
                </span>
              </a>

              <p className="text-xs text-[#6B5748] text-center pt-1.5 leading-relaxed max-w-xs sm:max-w-md mx-auto px-3">
                {t.productDetail.deliveryPromise}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Also from the Maison */}
      <div className="pt-8 border-t border-[#E6DDD0]">
        <ScrollReveal distance={22}>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#1E150F] mb-8">
            {t.signatureEdit.titlePart1}{' '}
            <span className="italic text-[#8C6239]">
              {t.signatureEdit.titleItalic}
            </span>
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {related.map((item, idx) => (
            <ProductCard
              key={item.id}
              fragrance={item}
              lang={lang}
              t={t}
              onAddToCart={(f, fmt) => onAddToCart(f, 1, fmt)}
              onSelectProduct={(f, fmt) => onSelectProduct(f, fmt)}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
