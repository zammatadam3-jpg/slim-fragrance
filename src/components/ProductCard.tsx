import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, MessageCircle, Plus } from 'lucide-react';
import { Fragrance, Language, ProductFormat } from '../data/fragrances';
import { Translations } from '../data/translations';
import {
  buildSingleProductWhatsAppUrl,
  getUnitPrice,
} from '../utils/storeLogic';
import { LuxuryImage } from './LuxuryImage';

interface ProductCardProps {
  fragrance: Fragrance;
  lang: Language;
  t: Translations;
  defaultFormat?: ProductFormat;
  onAddToCart: (fragrance: Fragrance, format: ProductFormat) => void;
  onSelectProduct: (fragrance: Fragrance, format: ProductFormat) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  fragrance,
  lang,
  t,
  defaultFormat = 'full',
  onAddToCart,
  onSelectProduct,
  index = 0,
}) => {
  const isPack = Boolean(fragrance.isPack);
  const isDecantOnly = Boolean(fragrance.isDecantOnly);
  const hasDecant = !isPack && !isDecantOnly && fragrance.decant10PriceMad !== undefined;

  const [selectedFormat, setSelectedFormat] = useState<ProductFormat>(() =>
    isPack
      ? 'pack'
      : isDecantOnly || (defaultFormat === 'decant10' && hasDecant)
      ? 'decant10'
      : 'full'
  );
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (isPack) {
      setSelectedFormat('pack');
    } else if (isDecantOnly || (defaultFormat === 'decant10' && hasDecant)) {
      setSelectedFormat('decant10');
    } else {
      setSelectedFormat('full');
    }
  }, [defaultFormat, isPack, isDecantOnly, hasDecant]);

  const activeFormat: ProductFormat = isPack ? 'pack' : isDecantOnly ? 'decant10' : selectedFormat;
  const activePriceMad = getUnitPrice(fragrance, activeFormat);
  const savingsMad =
    isPack && fragrance.originalPriceMad && fragrance.originalPriceMad > fragrance.priceMad
      ? fragrance.originalPriceMad - fragrance.priceMad
      : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(fragrance, activeFormat);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
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

  const badgeText = isPack
    ? t.formats.packBadge
    : isDecantOnly || activeFormat === 'decant10'
    ? lang === 'ar'
      ? 'تقسيمة 10ml أصلية'
      : lang === 'fr'
      ? 'Décant Original 10ml'
      : '10ml Original Decant'
    : fragrance.badge === 'Best Seller'
    ? t.card.bestSellerBadge
    : fragrance.badge === 'New'
    ? t.card.newBadge
    : null;

  const volumeDisplay = isPack
    ? fragrance.packSummary?.[lang] ?? t.formats.packBadge
    : isDecantOnly || activeFormat === 'decant10'
    ? '10ml'
    : fragrance.volumeLabel ?? t.formats.fullBottleShort;

  return (
    <motion.article
      initial={{ opacity: 0, y: 34, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.14, margin: '0px 0px -30px 0px' }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.08, 0.28),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group rounded-[26px] bg-[#FAF7F2] border border-[#E6DDD0] overflow-hidden flex flex-col transition-all duration-300 hover:border-[#B08455] hover:shadow-[0_14px_36px_rgba(30,21,15,0.07)]"
    >
      {/* Image Showcase Container */}
      <div className="relative aspect-[4/4.4] sm:aspect-[4/4.3] w-full overflow-hidden bg-[#F5EFE6]">
        <button
          type="button"
          onClick={() => onSelectProduct(fragrance, activeFormat)}
          aria-label={`Discover ${fragrance.name}`}
          className="block w-full h-full focus-visible:outline-none"
        >
          <motion.div
            initial={{ scale: 1.06 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <LuxuryImage
              src={fragrance.image}
              alt={`${fragrance.name} Eau de Parfum`}
              fallbackLabel={fragrance.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />
        </button>

        {/* Top Left Editorial Status / Pack Tag */}
        {badgeText && (
          <div className="absolute top-4 start-4 flex flex-col items-start gap-1.5 pointer-events-none">
            <span
              className={`px-3.5 py-1.5 rounded-full backdrop-blur-md border text-[11px] tracking-[0.12em] font-medium shadow-xs ${
                isPack
                  ? 'bg-[#2B1D14]/95 border-[#8C6239]/50 text-[#FAF7F2]'
                  : 'bg-white/90 border-[#E6DDD0] text-[#2B1D14]'
              }`}
            >
              {badgeText}
            </span>
            {savingsMad > 0 && (
              <span className="px-3 py-1 rounded-full bg-white/95 border border-[#D4C2AC] text-[10px] tracking-[0.1em] font-semibold text-[#8C6239] shadow-xs">
                {t.formats.saveAmount(savingsMad)}
              </span>
            )}
          </div>
        )}

        {/* Top Right Quick Add (+) Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`${t.card.addToBag}: ${fragrance.name}`}
          className={`absolute top-4 end-4 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6239] ${
            justAdded
              ? 'bg-[#2B1D14] border-[#2B1D14] text-[#FAF7F2]'
              : 'bg-white/90 border-[#E6DDD0] text-[#1E150F] hover:bg-[#2B1D14] hover:text-[#FAF7F2] hover:border-[#2B1D14]'
          }`}
        >
          {justAdded ? (
            <Check className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <Plus className="w-5 h-5 stroke-[1.7]" />
          )}
        </button>

        {/* Bottom Warm Beige / White CTA Button Inside Image */}
        <div className="absolute inset-x-4 bottom-4">
          <a
            href={buildSingleProductWhatsAppUrl(fragrance, lang, 1, activeFormat)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-full bg-[#FAF7F2]/95 hover:bg-white text-[#1E150F] border border-[#E6DDD0] text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase flex items-center justify-center gap-2.5 shadow-lg transition-colors duration-200 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 stroke-[1.9] text-[#8C6239] shrink-0" />
            <span>{t.card.orderViaWhatsapp}</span>
          </a>
        </div>
      </div>

      {/* Card Lower Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-[#FAF7F2]">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs tracking-[0.12em] text-[#6B5748] truncate">
              {localizedCategory}
            </span>
            <div dir="ltr" className="flex items-baseline gap-2 shrink-0">
              {isPack && fragrance.originalPriceMad && (
                <span className="text-xs text-[#6B5748]/75 line-through lining-nums tabular-nums whitespace-nowrap">
                  {fragrance.originalPriceMad} MAD
                </span>
              )}
              <span className="font-serif-editorial text-xl sm:text-2xl text-[#8C6239] font-medium lining-nums tabular-nums whitespace-nowrap">
                {activePriceMad} MAD
              </span>
            </div>
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-3">
            <button
              type="button"
              onClick={() => onSelectProduct(fragrance, activeFormat)}
              className="text-start font-serif-editorial text-2xl sm:text-[26px] text-[#1E150F] hover:text-[#8C6239] transition-colors leading-tight"
            >
              {fragrance.name}
            </button>
            {!isPack && (
              <span className="text-xs tracking-[0.1em] text-[#6B5748] tabular-nums whitespace-nowrap shrink-0">
                {volumeDisplay}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm text-[#6B5748]">
            {isPack && fragrance.packSummary
              ? fragrance.packSummary[lang]
              : fragrance.character[lang]}
          </p>


          {/* Concise Pack Contents Preview */}
          {isPack && fragrance.packContents && (
            <div className="mt-3.5 rounded-xl bg-white border border-[#E6DDD0] px-3.5 py-2.5 space-y-1">
              {fragrance.packContents.slice(0, 3).map((itemLine, i) => (
                <p
                  key={i}
                  className="text-xs text-[#6B5748] truncate flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-[#8C6239] shrink-0" />
                  <span className="truncate">{itemLine[lang]}</span>
                </p>
              ))}
              {fragrance.packContents.length > 3 && (
                <p className="text-[11px] text-[#8C6239] font-medium ps-2.5">
                  +{fragrance.packContents.length - 3}{' '}
                  {lang === 'ar' ? 'عطر إضافي' : lang === 'fr' ? 'autre inclus' : 'more included'}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 pt-1">
          <button
            type="button"
            onClick={() => onSelectProduct(fragrance, activeFormat)}
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#8C6239] hover:text-[#1E150F] font-medium transition-colors group/btn whitespace-nowrap"
          >
            <span>{t.card.discover}</span>
            <ArrowRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                lang === 'ar'
                  ? 'rotate-180 group-hover/btn:-translate-x-1'
                  : 'group-hover/btn:translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
};
