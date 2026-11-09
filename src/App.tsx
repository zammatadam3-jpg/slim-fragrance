/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Home, MessageCircle, Package, ShoppingBag, Sparkles, SprayCan } from 'lucide-react';
import {
  ALL_CATALOG_ITEMS,
  CartItem,
  FormatFilter,
  FRAGRANCES,
  Fragrance,
  GenderCategory,
  Language,
  PACKS,
  PageView,
  ProductFormat,
  SortOption,
} from './data/fragrances';
import { TRANSLATIONS } from './data/translations';
import {
  addToCart,
  buildConciergeWhatsAppUrl,
  calculateCartCount,
  parseSafeStoredCart,
  removeFromCart,
  updateCartQuantity,
} from './utils/storeLogic';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { AdminView } from './views/AdminView';
import { fetchCatalogItems } from './utils/sanityClient';
import { ADMIN_SECRET_ROUTE, getStoredCustomCatalog, saveStoredCustomCatalog } from './utils/catalogStorage';
import { subscribeToFragrances } from './utils/firebase';

const CART_STORAGE_KEY = 'salim_fragrance_selection_v2';
const LANG_STORAGE_KEY = 'salim_fragrance_lang_v1';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved =
        localStorage.getItem(LANG_STORAGE_KEY) ||
        localStorage.getItem('slim_fragrance_lang_v1');
      if (saved === 'en' || saved === 'fr' || saved === 'ar') return saved;
    } catch {
      // ignore storage errors
    }
    return 'fr';
  });

  // Dynamic Catalog State: checks custom admin storage first, then Sanity live, then default house collection
  const [catalogItems, setCatalogItems] = useState<Fragrance[]>(() => {
    const custom = getStoredCustomCatalog();
    if (custom !== null) return custom;
    return ALL_CATALOG_ITEMS;
  });
  const [fragranceList, setFragranceList] = useState<Fragrance[]>(() => {
    const custom = getStoredCustomCatalog();
    if (custom !== null) return custom.filter((i) => !i.isPack);
    return FRAGRANCES;
  });
  const [packList, setPackList] = useState<Fragrance[]>(() => {
    const custom = getStoredCustomCatalog();
    if (custom !== null) return custom.filter((i) => i.isPack);
    return PACKS;
  });

  const [activePage, setActivePage] = useState<PageView>('home');
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance>(FRAGRANCES[0]);
  const [selectedFormat, setSelectedFormat] = useState<ProductFormat>('full');
  const [previousPage, setPreviousPage] = useState<PageView>('shop');

  // Shop filters
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<GenderCategory>('All');
  const [onlyBestSellers, setOnlyBestSellers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Overlays
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart state — strictly validated & sanitized via parseSafeStoredCart
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored =
        localStorage.getItem(CART_STORAGE_KEY) ||
        localStorage.getItem('slim_fragrance_selection_v2');
      return parseSafeStoredCart(stored, ALL_CATALOG_ITEMS);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(
          cartItems.map((i) => ({
            id: i.fragrance.id,
            format: i.format,
            quantity: i.quantity,
          }))
        )
      );
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial and recurring sync from API / Sanity / Firestore
    const syncCatalog = () => {
      fetchCatalogItems().then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res.items)) {
          setCatalogItems(res.items);
          setFragranceList(res.fragrances);
          setPackList(res.packs);
          saveStoredCustomCatalog(res.items);
        }
      });
    };

    syncCatalog();
    window.addEventListener('focus', syncCatalog);

    // 2. Real-time Cloud Firestore push listener (instant multi-device sync)
    let unsubscribeFirestore: (() => void) | undefined;
    try {
      unsubscribeFirestore = subscribeToFragrances((items) => {
        if (!isMounted) return;
        if (Array.isArray(items)) {
          setCatalogItems(items);
          setFragranceList(items.filter((i) => !i.isPack));
          setPackList(items.filter((i) => i.isPack));
          saveStoredCustomCatalog(items);
        }
      });
    } catch (e) {
      console.warn('Real-time listener setup notice:', e);
    }

    return () => {
      isMounted = false;
      window.removeEventListener('focus', syncCatalog);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // High-Security Secret Entrance: ONLY responds to the secret cryptographic route token
  // Generic /admin, #admin, or ?admin are explicitly blocked and neutralized.
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const searchParams = new URLSearchParams(window.location.search);
      const vaultQuery = searchParams.get('vault') || searchParams.get('portal');

      if (hash === ADMIN_SECRET_ROUTE || vaultQuery === ADMIN_SECRET_ROUTE) {
        setActivePage('admin');
        window.scrollTo(0, 0);
      } else if (
        hash === 'admin' ||
        searchParams.has('admin') ||
        window.location.pathname.includes('/admin')
      ) {
        // Neutralize simple guessable paths immediately
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  const handleUpdateCatalogFromAdmin = (updated: Fragrance[]) => {
    setCatalogItems(updated);
    setFragranceList(updated.filter((i) => !i.isPack));
    setPackList(updated.filter((i) => i.isPack));
  };

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    const dir = TRANSLATIONS[lang].dir;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const t = TRANSLATIONS[lang];
  const cartCount = calculateCartCount(cartItems);

  const navigateTo = (page: PageView) => {
    setActivePage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleNavigateShopWithFormat = (
    format: FormatFilter,
    category: GenderCategory = 'All',
    query = ''
  ) => {
    setFormatFilter(format);
    setSelectedCategory(category);
    setOnlyBestSellers(false);
    setSearchQuery(query);
    setActivePage('shop');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleSelectProduct = (fragrance: Fragrance, format?: ProductFormat) => {
    setPreviousPage(activePage === 'product' ? 'shop' : activePage);
    setSelectedFragrance(fragrance);
    setSelectedFormat(
      fragrance.isPack ? 'pack' : format === 'decant10' ? 'decant10' : 'full'
    );
    setActivePage('product');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleNavigateCollection = (
    category: GenderCategory,
    bestSellersOnly = false,
    format: FormatFilter = 'all'
  ) => {
    setFormatFilter(format);
    setSelectedCategory(category);
    setOnlyBestSellers(bestSellersOnly);
    setSearchQuery('');
    setActivePage('shop');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (
    fragrance: Fragrance,
    qty = 1,
    format: ProductFormat = 'full'
  ) => {
    setCartItems((prev) => addToCart(prev, fragrance, qty, format));
  };

  const handleUpdateQty = (cartKey: string, newQty: number) => {
    setCartItems((prev) => updateCartQuantity(prev, cartKey, newQty));
  };

  const handleRemoveFromCart = (cartKey: string) => {
    setCartItems((prev) => removeFromCart(prev, cartKey));
  };

  return (
    <div
      dir={t.dir}
      className="min-h-screen flex flex-col bg-white text-[#1E150F] pb-16 md:pb-0"
    >
      <Header
        activePage={activePage}
        activeFormatFilter={formatFilter}
        onNavigate={navigateTo}
        onNavigateShopWithFormat={(fmt) => handleNavigateShopWithFormat(fmt)}
        cartCount={cartCount}
        onOpenCart={() => {
          setIsMenuOpen(false);
          setIsCartOpen(true);
        }}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((v) => !v)}
        lang={lang}
        onChangeLang={setLang}
        t={t}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomeView
            lang={lang}
            t={t}
            catalogItems={catalogItems}
            fragrances={fragranceList}
            packs={packList}
            onNavigate={navigateTo}
            onNavigateShopWithFormat={handleNavigateShopWithFormat}
            onAddToCart={(f, fmt) => handleAddToCart(f, 1, fmt)}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'shop' && (
          <ShopView
            lang={lang}
            t={t}
            catalogItems={catalogItems}
            fragrances={fragranceList}
            packs={packList}
            formatFilter={formatFilter}
            onSelectFormatFilter={setFormatFilter}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onlyBestSellers={onlyBestSellers}
            onToggleBestSellers={setOnlyBestSellers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onAddToCart={(f, fmt) => handleAddToCart(f, 1, fmt)}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'product' && (
          <ProductDetailView
            key={`${selectedFragrance.id}-${selectedFormat}`}
            fragrance={selectedFragrance}
            initialFormat={selectedFormat}
            fragrances={fragranceList}
            packs={packList}
            lang={lang}
            t={t}
            onBack={() => navigateTo(previousPage)}
            onAddToCart={(f, qty, fmt) => handleAddToCart(f, qty, fmt)}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'about' && (
          <AboutView lang={lang} t={t} onNavigate={navigateTo} />
        )}

        {activePage === 'contact' && <ContactView lang={lang} t={t} />}

        {activePage === 'admin' && (
          <AdminView
            lang={lang}
            t={t}
            catalog={catalogItems}
            onUpdateCatalog={handleUpdateCatalogFromAdmin}
            onNavigateHome={() => navigateTo('home')}
          />
        )}
      </main>

      <Footer
        lang={lang}
        t={t}
        onNavigate={navigateTo}
        onNavigateCollection={handleNavigateCollection}
      />

      {/* Selection Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveFromCart}
        onNavigate={navigateTo}
        lang={lang}
        t={t}
      />

      {/* Mobile Bottom Quick-Navigation Bar (1-Tap to Home, All Scents, 10ml Decants, Packs, or Bag) */}
      {!isCartOpen && !isMenuOpen && activePage !== 'admin' && (
        <nav
          aria-label="Mobile quick navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white/98 backdrop-blur-md border-t border-[#E6DDD0] grid grid-cols-5 items-center px-1 shadow-[0_-6px_24px_rgba(30,21,15,0.06)]"
        >
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors ${
              activePage === 'home' ? 'text-[#8C6239]' : 'text-[#6B5748]'
            }`}
          >
            <Home className="w-4.5 h-4.5 stroke-[1.8]" />
            <span>{t.nav.home}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateShopWithFormat('all')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors ${
              activePage === 'shop' &&
              (formatFilter === 'all' || formatFilter === 'full')
                ? 'text-[#8C6239]'
                : 'text-[#6B5748]'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5 stroke-[1.8]" />
            <span>{t.nav.shop}</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateShopWithFormat('decant10')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors ${
              activePage === 'shop' && formatFilter === 'decant10'
                ? 'text-[#8C6239]'
                : 'text-[#6B5748]'
            }`}
          >
            <SprayCan className="w-4.5 h-4.5 stroke-[1.8]" />
            <span>10ml</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateShopWithFormat('pack')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors ${
              activePage === 'shop' && formatFilter === 'pack'
                ? 'text-[#8C6239]'
                : 'text-[#6B5748]'
            }`}
          >
            <Package className="w-4.5 h-4.5 stroke-[1.8]" />
            <span>
              {lang === 'ar' ? 'الباكات' : lang === 'fr' ? 'Packs' : 'Packs'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium text-[#6B5748] hover:text-[#1E150F]"
          >
            <ShoppingBag className="w-4.5 h-4.5 stroke-[1.8]" />
            <span>
              {lang === 'ar' ? 'السلة' : lang === 'fr' ? 'Panier' : 'Bag'}
            </span>
            {cartCount > 0 && (
              <span className="absolute top-0.5 end-3 min-w-[16px] h-[16px] px-1 rounded-full bg-[#2B1D14] text-[#FAF7F2] text-[9px] font-semibold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </nav>
      )}

      {/* Floating WhatsApp Concierge Button (Positioned cleanly above mobile bottom bar) */}
      {!isCartOpen && activePage !== 'admin' && (
        <a
          href={buildConciergeWhatsAppUrl(lang)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with SALIM FRAGRANCE concierge on WhatsApp"
          className="fixed bottom-20 md:bottom-6 end-4 sm:end-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] active:scale-95 text-[#FAF7F2] shadow-[0_10px_28px_rgba(43,29,20,0.28)] border border-[#8C6239]/35 flex items-center justify-center transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6239]"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.9]" />
        </a>
      )}
    </div>
  );
}
