import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import {
  FormatFilter,
  GenderCategory,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  Language,
  PageView,
  WHATSAPP_DISPLAY,
} from '../data/fragrances';
import { Translations } from '../data/translations';
import { buildConciergeWhatsAppUrl } from '../utils/storeLogic';

interface FooterProps {
  lang: Language;
  t: Translations;
  onNavigate: (page: PageView) => void;
  onNavigateCollection: (
    category: GenderCategory,
    onlyBestSellers?: boolean,
    format?: FormatFilter
  ) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  t,
  onNavigate,
  onNavigateCollection,
}) => {
  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E6DDD0] text-[#6B5748]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-24 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-start group focus-visible:outline-none"
            >
              <span className="block font-serif-editorial text-2xl tracking-[0.26em] text-[#1E150F]">
                SALIM
              </span>
              <span className="block text-[10px] tracking-[0.34em] text-[#8C6239] mt-1.5 uppercase">
                FRAGRANCE
              </span>
            </button>

            <p className="text-sm text-[#6B5748] max-w-sm leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={buildConciergeWhatsAppUrl(lang)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact SALIM FRAGRANCE on WhatsApp"
                className="w-11 h-11 rounded-full border border-[#E6DDD0] bg-white flex items-center justify-center text-[#1E150F] hover:border-[#8C6239] hover:text-[#8C6239] transition-colors"
              >
                <MessageCircle className="w-4 h-4 stroke-[1.7]" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit SALIM FRAGRANCE on Instagram"
                className="w-11 h-11 rounded-full border border-[#E6DDD0] bg-white flex items-center justify-center text-[#1E150F] hover:border-[#8C6239] hover:text-[#8C6239] transition-colors"
              >
                <Instagram className="w-4 h-4 stroke-[1.7]" />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-[11px] tracking-[0.26em] uppercase text-[#8C6239] font-medium">
              {t.footer.explore}
            </h3>
            <ul className="space-y-3 text-sm text-[#1E150F]/90">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#8C6239] transition-colors"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCollection('All', false, 'all')}
                  className="hover:text-[#8C6239] transition-colors"
                >
                  {t.nav.shopAll}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#8C6239] transition-colors"
                >
                  {t.nav.aboutUs}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#8C6239] transition-colors"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Formats & Collections Column */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-[11px] tracking-[0.26em] uppercase text-[#8C6239] font-medium">
              {t.footer.collections}
            </h3>
            <ul className="space-y-3 text-sm text-[#1E150F]/90">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCollection('All', false, 'full')}
                  className="hover:text-[#8C6239] transition-colors"
                >
                  {t.formats.fullBottle}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCollection('All', false, 'decant10')}
                  className="hover:text-[#8C6239] transition-colors"
                >
                  {t.formats.decant10}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCollection('All', false, 'pack')}
                  className="hover:text-[#8C6239] transition-colors"
                >
                  {t.formats.packs}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCollection('All', true, 'all')}
                  className="hover:text-[#8C6239] transition-colors"
                >
                  {t.collection.bestSellers}
                </button>
              </li>
            </ul>

            <div className="pt-4 space-y-2 text-sm text-[#6B5748]">
              <a
                href={buildConciergeWhatsAppUrl(lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#8C6239] transition-colors tabular-nums"
              >
                WhatsApp · {WHATSAPP_DISPLAY}
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[#8C6239] transition-colors"
              >
                {INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-[#E6DDD0] text-center">
          <p className="text-[11px] tracking-[0.26em] uppercase text-[#6B5748]">
            {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};
