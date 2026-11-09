import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, Language, PageView } from '../data/fragrances';
import { Translations } from '../data/translations';
import {
  buildCartWhatsAppUrl,
  calculateCartCount,
  calculateCartTotal,
  getFormatLabel,
  getUnitPrice,
} from '../utils/storeLogic';
import { LuxuryImage } from './LuxuryImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (cartKey: string, newQty: number) => void;
  onRemove: (cartKey: string) => void;
  onNavigate: (page: PageView) => void;
  lang: Language;
  t: Translations;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  onNavigate,
  lang,
  t,
}) => {
  const totalCount = calculateCartCount(items);
  const totalMad = calculateCartTotal(items);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={t.cart.kicker}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1E150F]/45 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: lang === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-white border-s border-[#E6DDD0] h-full flex flex-col justify-between shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-[#EAE0D3] flex items-center justify-between">
              <div>
                <p className="text-[11px] tracking-[0.26em] uppercase text-[#8C6239]">
                  {t.cart.kicker}
                </p>
                <h2 className="mt-1 font-serif-editorial text-3xl text-[#1E150F]">
                  {t.cart.title(totalCount)}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close selection drawer"
                className="w-11 h-11 rounded-full border border-[#E6DDD0] bg-[#FAF7F2] flex items-center justify-center text-[#6B5748] hover:text-[#1E150F] hover:border-[#B08455] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full border border-[#E6DDD0] bg-[#FAF7F2] flex items-center justify-center text-[#8C6239] mb-5">
                    <ShoppingBag className="w-7 h-7 stroke-[1.4]" />
                  </div>
                  <h3 className="font-serif-editorial text-2xl text-[#1E150F]">
                    {t.cart.emptyTitle}
                  </h3>
                  <p className="mt-2 text-sm text-[#6B5748] max-w-xs leading-relaxed">
                    {t.cart.emptySubtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('shop');
                    }}
                    className="mt-7 px-7 py-3.5 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] text-[#FAF7F2] text-xs font-semibold tracking-[0.18em] uppercase transition-colors"
                  >
                    {t.cart.browseBtn}
                  </button>
                </div>
              ) : (
                items.map(({ cartKey, fragrance, format, quantity }) => {
                  const unitPrice = getUnitPrice(fragrance, format);
                  const formatLabel = getFormatLabel(fragrance, format, lang);

                  return (
                    <div
                      key={cartKey}
                      className="flex gap-4 pb-6 border-b border-[#EAE0D3] last:border-b-0"
                    >
                      <div className="w-24 h-28 rounded-2xl overflow-hidden border border-[#E6DDD0] bg-[#FAF7F2] shrink-0">
                        <LuxuryImage
                          src={fragrance.image}
                          alt={fragrance.name}
                          fallbackLabel={fragrance.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-serif-editorial text-xl text-[#1E150F] leading-snug">
                              {fragrance.name}
                            </h3>
                            <p className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E6DDD0] text-[11px] font-medium text-[#8C6239]">
                              {formatLabel}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemove(cartKey)}
                            aria-label={`${t.cart.removeAria}: ${fragrance.name} (${formatLabel})`}
                            className="p-2 text-[#6B5748] hover:text-[#1E150F] transition-colors rounded-full shrink-0"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.6]" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          {/* Quantity Stepper Pill */}
                          <div className="inline-flex items-center rounded-full border border-[#E6DDD0] bg-[#FAF7F2] px-2 py-1">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(cartKey, quantity - 1)}
                              aria-label={`Decrease quantity of ${fragrance.name} (${formatLabel})`}
                              className="w-7 h-7 flex items-center justify-center text-[#6B5748] hover:text-[#1E150F] transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-medium text-[#1E150F] tabular-nums">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(cartKey, quantity + 1)}
                              aria-label={`Increase quantity of ${fragrance.name} (${formatLabel})`}
                              className="w-7 h-7 flex items-center justify-center text-[#6B5748] hover:text-[#1E150F] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span
                            dir="ltr"
                            className="inline-block text-sm font-semibold text-[#8C6239] lining-nums tabular-nums whitespace-nowrap"
                          >
                            {unitPrice * quantity} MAD
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Total & WhatsApp Order Button */}
            {items.length > 0 && (
              <div className="px-6 py-6 border-t border-[#E6DDD0] bg-[#FAF7F2] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif-editorial text-2xl text-[#1E150F]">
                    {t.cart.total}
                  </span>
                  <span
                    dir="ltr"
                    className="inline-block font-serif-editorial text-3xl text-[#8C6239] font-medium lining-nums tabular-nums"
                  >
                    {totalMad} MAD
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#6B5748] leading-relaxed">
                  {t.cart.conciergeNote}
                </p>

                <a
                  href={buildCartWhatsAppUrl(items, lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] text-[#FAF7F2] text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center text-center transition-colors shadow-md"
                >
                  {t.cart.sendOrderBtn}
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
