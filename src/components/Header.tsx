import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import {
  FormatFilter,
  INSTAGRAM_URL,
  Language,
  PageView,
  WHATSAPP_DISPLAY,
} from '../data/fragrances';
import { Translations } from '../data/translations';
import { buildConciergeWhatsAppUrl } from '../utils/storeLogic';

interface HeaderProps {
  activePage: PageView;
  activeFormatFilter: FormatFilter;
  onNavigate: (page: PageView) => void;
  onNavigateShopWithFormat: (format: FormatFilter) => void;
  cartCount: number;
  onOpenCart: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  t: Translations;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  activeFormatFilter,
  onNavigate,
  onNavigateShopWithFormat,
  cartCount,
  onOpenCart,
  isMenuOpen,
  onToggleMenu,
  lang,
  onChangeLang,
  t,
}) => {
  const navItems: {
    key: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }[] = [
    {
      key: 'home',
      label: t.nav.home,
      isActive: activePage === 'home',
      onClick: () => onNavigate('home'),
    },
    {
      key: 'shop',
      label: t.nav.shop,
      isActive:
        (activePage === 'shop' &&
          activeFormatFilter !== 'pack' &&
          activeFormatFilter !== 'decant10') ||
        activePage === 'product',
      onClick: () => onNavigateShopWithFormat('all'),
    },
    {
      key: 'decant10',
      label: t.formats.decant10Short,
      isActive: activePage === 'shop' && activeFormatFilter === 'decant10',
      onClick: () => onNavigateShopWithFormat('decant10'),
    },
    {
      key: 'packs',
      label: lang === 'ar' ? 'الباكات' : lang === 'fr' ? 'Packs' : 'Packs',
      isActive: activePage === 'shop' && activeFormatFilter === 'pack',
      onClick: () => onNavigateShopWithFormat('pack'),
    },
    {
      key: 'about',
      label: t.nav.about,
      isActive: activePage === 'about',
      onClick: () => onNavigate('about'),
    },
    {
      key: 'contact',
      label: t.nav.contact,
      isActive: activePage === 'contact',
      onClick: () => onNavigate('contact'),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 h-18 sm:h-20 bg-white/95 backdrop-blur-md border-b border-[#EAE0D3]">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-6">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-start group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6239] rounded-sm whitespace-nowrap shrink-0"
            aria-label="SALIM FRAGRANCE Home"
          >
            <span className="block font-serif-editorial text-lg sm:text-2xl tracking-[0.26em] text-[#1E150F] leading-none">
              SALIM
            </span>
            <span className="block text-[8px] sm:text-[10px] tracking-[0.34em] text-[#8C6239] mt-1 uppercase">
              FRAGRANCE
            </span>
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-5 lg:gap-7 text-sm text-[#6B5748]"
          >
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={`relative py-1 transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6239] rounded-sm ${
                  item.isActive
                    ? 'text-[#1E150F] font-medium'
                    : 'text-[#6B5748] hover:text-[#1E150F]'
                }`}
              >
                {item.label}
                {item.isActive && (
                  <motion.span
                    layoutId="desktop-nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-[#8C6239]"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Quick Actions (Language always visible on Mobile & Desktop + Search + Bag + Menu) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Always-Visible Compact Language Switcher (No need to open menu on mobile!) */}
            <div
              role="group"
              aria-label="Language switcher"
              className="inline-flex items-center rounded-full border border-[#E6DDD0] bg-[#FAF7F2] p-0.5 text-[10px] sm:text-[11px]"
            >
              {(['ar', 'fr', 'en'] as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  className={`px-2 sm:px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                    lang === code
                      ? 'bg-[#2B1D14] text-[#FAF7F2] font-semibold'
                      : 'text-[#6B5748] hover:text-[#1E150F]'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Quick Search Shortcut to Shop Finder */}
            <button
              type="button"
              onClick={() => onNavigateShopWithFormat('all')}
              aria-label="Search fragrances"
              className="w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-full text-[#1E150F] hover:bg-[#FAF7F2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6239]"
            >
              <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.7]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open selection bag (${cartCount} items)`}
              className="relative w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-full text-[#1E150F] hover:bg-[#FAF7F2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6239]"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2B1D14] text-[#FAF7F2] text-[10px] font-semibold flex items-center justify-center tabular-nums shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleMenu}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-full text-[#1E150F] hover:bg-[#FAF7F2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6239]"
            >
              {isMenuOpen ? (
                <X className="w-5.5 h-5.5 stroke-[1.6]" />
              ) : (
                <Menu className="w-5.5 h-5.5 stroke-[1.6]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Luxury Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-18 sm:top-20 bottom-0 z-30 bg-white/98 backdrop-blur-xl overflow-y-auto border-t border-[#EAE0D3]"
          >
            <div className="max-w-3xl mx-auto px-6 py-7 flex flex-col justify-between min-h-full">
              <nav
                aria-label="Drawer navigation"
                className="divide-y divide-[#EAE0D3] border-b border-[#EAE0D3]"
              >
                {navItems.map((item, idx) => (
                  <motion.button
                    key={item.key}
                    type="button"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.22 }}
                    onClick={item.onClick}
                    className={`w-full py-4.5 text-start font-serif-editorial text-2xl sm:text-3xl transition-colors flex items-center justify-between ${
                      item.isActive
                        ? 'text-[#8C6239]'
                        : 'text-[#1E150F] hover:text-[#8C6239]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              <div className="pt-7 pb-8 space-y-5">
                <div className="space-y-2.5 text-xs tracking-[0.2em] uppercase">
                  <a
                    href={buildConciergeWhatsAppUrl(lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#8C6239] hover:text-[#1E150F] transition-colors font-medium"
                  >
                    WHATSAPP · {WHATSAPP_DISPLAY}
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[#6B5748] hover:text-[#1E150F] transition-colors"
                  >
                    INSTAGRAM
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
