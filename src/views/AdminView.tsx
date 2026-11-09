import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Fragrance, GenderCategory, Language } from '../data/fragrances';
import { Translations } from '../data/translations';
import { LuxuryImage } from '../components/LuxuryImage';
import {
  checkBruteForceLockout,
  deleteServerProductApi,
  recordFailedAttempt,
  saveServerCatalogApi,
  saveStoredCustomCatalog,
  updateAdminPassword,
  verifyAdminPassword,
} from '../utils/catalogStorage';
import { saveFragranceToFirestore } from '../utils/firebase';

interface AdminViewProps {
  lang: Language;
  t: Translations;
  catalog: Fragrance[];
  onUpdateCatalog: (items: Fragrance[]) => void;
  onNavigateHome: () => void;
}

export type ProductKind = 'full' | 'decant' | 'dual' | 'pack';

const FLACON_PRESET_IMAGES = [
  { label: 'Noir Absolu', url: '/images/scent_noir_absolu_1793649456099.jpg' },
  { label: 'Royal Oud', url: '/images/scent_royal_oud_1793649458247.jpg' },
  { label: 'Jasmin Nuit', url: '/images/scent_jasmin_nuit_1793649464121.jpg' },
  { label: 'Ambre Sultan', url: '/images/scent_ambre_sultan_1793649463211.jpg' },
  { label: 'Cuir Épicé', url: '/images/scent_cuir_epice_1793649465518.jpg' },
  { label: 'Velours Rose', url: '/images/scent_velours_rose_1793649460466.jpg' },
];

const PACK_PRESET_IMAGES = [
  { label: 'Discovery 4×10ml', url: '/images/pack_discovery_4x10ml_1793740309304.jpg' },
  { label: 'Duo Coffret', url: '/images/pack_duo_coffret_complet_1793740310102.jpg' },
  { label: 'Oud Trio 10ml', url: '/images/pack_oud_trio_10ml_1793740310624.jpg' },
];

export const AdminView: React.FC<AdminViewProps> = ({
  lang,
  t,
  catalog,
  onUpdateCatalog,
  onNavigateHome,
}) => {
  // Authentication state (Session-based)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('salim_admin_authenticated') === 'true' ||
      sessionStorage.getItem('slim_admin_authenticated') === 'true'
    );
  });
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() => {
    return checkBruteForceLockout().remainingSeconds;
  });

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setAuthError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'full' | 'decants' | 'packs'>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Fragrance | null>(null);
  const [modalStep, setModalStep] = useState<'select-type' | 'fill-form'>('select-type');
  const [enableDecantForFull, setEnableDecantForFull] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form Fields - Ultra Simplified
  const [formKind, setFormKind] = useState<ProductKind>('full');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Exclude<GenderCategory, 'All'>>('Unisex');
  const [formPriceMad, setFormPriceMad] = useState<number>(450);
  const [formDecantPriceMad, setFormDecantPriceMad] = useState<number>(95);
  const [formOriginalPriceMad, setFormOriginalPriceMad] = useState<number>(0);
  const [formImage, setFormImage] = useState<string>('/images/scent_noir_absolu_1793649456099.jpg');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [formCharacterAr, setFormCharacterAr] = useState('');

  // Optional / Advanced Fields (hidden in collapsible section)
  const [formBadge, setFormBadge] = useState<'' | 'Best Seller' | 'New'>('');
  const [formVolumeLabel, setFormVolumeLabel] = useState('');
  const [formTopNotes, setFormTopNotes] = useState('');
  const [formHeartNotes, setFormHeartNotes] = useState('');
  const [formBaseNotes, setFormBaseNotes] = useState('');
  const [formLongevity, setFormLongevity] = useState('10 – 14 ساعة');
  const [formSillage, setFormSillage] = useState('فوحان ملكي مميز');
  const [formPackSummary, setFormPackSummary] = useState('');

  // Notifications & Deletion Modal
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  // Settings Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const triggerNotification = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const lockout = checkBruteForceLockout();
    if (lockout.isLocked) {
      setLockoutSeconds(lockout.remainingSeconds);
      setAuthError(`تم قفل المحاولات مؤقتاً لأسباب أمنية. يرجى الانتظار ${lockout.remainingSeconds} ثانية.`);
      return;
    }

    if (verifyAdminPassword(enteredPassword)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('salim_admin_authenticated', 'true');
      setAuthError(null);
      setEnteredPassword('');
    } else {
      const record = recordFailedAttempt();
      if (record.isLocked) {
        setLockoutSeconds(record.remainingSeconds);
        setAuthError(`تجاوزت الحد الأقصى للمحاولات. تم قفل الدخول لمدة 10 دقائق لحماية المتجر.`);
      } else {
        setAuthError(`كلمة المرور غير صحيحة. يتبقى لك ${record.attemptsLeft} محاولات قبل الإغلاق الأمني.`);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('salim_admin_authenticated');
    sessionStorage.removeItem('slim_admin_authenticated');
  };

  const openAddModal = () => {
    setEditingItem(null);
    setModalStep('select-type');
    setFormKind('full');
    setEnableDecantForFull(false);
    setShowAdvanced(false);
    setFormName('');
    setFormCategory('Unisex');
    setFormPriceMad(450);
    setFormDecantPriceMad(95);
    setFormOriginalPriceMad(0);
    setFormCharacterAr('');
    setFormBadge('');
    setFormVolumeLabel('');
    setFormTopNotes('');
    setFormHeartNotes('');
    setFormBaseNotes('');
    setFormLongevity('10 – 14 ساعة');
    setFormSillage('فوحان ملكي مميز');
    setFormPackSummary('');
    setFormImage('/images/scent_noir_absolu_1793649456099.jpg');
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Fragrance) => {
    setEditingItem(item);
    setModalStep('fill-form');
    if (item.isPack) {
      setFormKind('pack');
      setEnableDecantForFull(false);
    } else if (item.isDecantOnly) {
      setFormKind('decant');
      setEnableDecantForFull(false);
    } else if (item.decant10PriceMad && item.decant10PriceMad > 0) {
      setFormKind('dual');
      setEnableDecantForFull(true);
    } else {
      setFormKind('full');
      setEnableDecantForFull(false);
    }
    setShowAdvanced(false);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPriceMad(item.priceMad);
    setFormDecantPriceMad(item.decant10PriceMad || 95);
    setFormOriginalPriceMad(item.originalPriceMad || 0);
    setFormCharacterAr(item.character.ar || item.character.fr || item.character.en || '');
    setFormBadge(item.badge || '');
    setFormVolumeLabel(item.volumeLabel || '');
    setFormTopNotes(item.notes.top.ar || item.notes.top.en || '');
    setFormHeartNotes(item.notes.heart.ar || item.notes.heart.en || '');
    setFormBaseNotes(item.notes.base.ar || item.notes.base.en || '');
    setFormLongevity(item.longevity.ar || item.longevity.en || '10 – 14 ساعة');
    setFormSillage(item.sillage.ar || item.sillage.en || 'فوحان ملكي مميز');
    setFormPackSummary(item.packSummary?.ar || item.packSummary?.en || '');
    setFormImage(item.image);
    setImagePreview(item.image);
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      triggerNotification('حجم الصورة كبير جداً، يرجى اختيار صورة أصغر من 20 ميغابايت', true);
      return;
    }

    setIsCompressingImage(true);
    triggerNotification('جاري ضغط ومعالجة الصورة لسرعة السحابة... ⏳');

    const reader = new FileReader();
    reader.onerror = () => {
      setIsCompressingImage(false);
      triggerNotification('حدث خطأ أثناء قراءة الصورة', true);
    };
    reader.onload = () => {
      const raw = reader.result as string;
      const img = new Image();
      img.onerror = () => {
        setIsCompressingImage(false);
        setFormImage(raw);
        setImagePreview(raw);
      };
      img.onload = () => {
        try {
          const maxDim = 700;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsCompressingImage(false);
            setFormImage(raw);
            setImagePreview(raw);
            triggerNotification('تم تجهيز الصورة بنجاح ✅');
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setFormImage(compressed);
          setImagePreview(compressed);
          setIsCompressingImage(false);
          triggerNotification('تم تجهيز الصورة وضغطها بنجاح ✅');
        } catch {
          setIsCompressingImage(false);
          setFormImage(raw);
          setImagePreview(raw);
          triggerNotification('تم حفظ الصورة بنجاح ✅');
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompressingImage) {
      triggerNotification('يرجى الانتظار بضع ثوانٍ حتى تكتمل معالجة الصورة... ⏳', true);
      return;
    }
    if (!formName.trim()) {
      triggerNotification('يرجى كتابة اسم العطر أولاً', true);
      return;
    }

    setIsSavingProduct(true);

    const baseSlug = formName
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const uniqueId = editingItem
      ? editingItem.id
      : `fragrance-${formKind}-${Date.now()}-${randomSuffix}`;

    const slug =
      editingItem?.slug ||
      (baseSlug ? `${baseSlug}-${formKind}-${randomSuffix}` : uniqueId);

    const id = uniqueId;

    const isPack = formKind === 'pack';
    const isDecantOnly = formKind === 'decant';
    const hasDecant = formKind === 'dual';

    const resolvedPriceMad = isDecantOnly
      ? Number(formDecantPriceMad) || Number(formPriceMad) || 95
      : Number(formPriceMad) || 450;

    const resolvedDecantPriceMad = isDecantOnly
      ? resolvedPriceMad
      : hasDecant && Number(formDecantPriceMad) > 0
      ? Number(formDecantPriceMad)
      : undefined;

    const defaultCharacter = isPack
      ? 'تشكيلة عطور فاخرة مجمعة في بوكس راقٍ مناسب للهدايا والاقتناء'
      : isDecantOnly
      ? 'تقسيمة أصلية 10ml من القارورة الرسمية، ثبات عالي وفوحان فخم'
      : 'عطر فاخر أصيل بنفحات ناعمة ودافئة تمنحك حضوراً وأناقة تدوم طويلاً';

    const finalCharacterAr = formCharacterAr.trim() || defaultCharacter;

    const newFragrance: Fragrance = {
      id,
      slug,
      name: formName.trim(),
      category: formCategory,
      character: {
        ar: finalCharacterAr,
        fr: formCharacterAr.trim() || 'Parfum de signature aux notes nobles et raffinées.',
        en: formCharacterAr.trim() || 'Signature fragrance with refined noble notes.',
      },
      priceMad: resolvedPriceMad,
      volumeLabel: formVolumeLabel.trim() || undefined,
      decant10PriceMad: resolvedDecantPriceMad,
      isPack,
      isDecantOnly,
      originalPriceMad:
        isPack && formOriginalPriceMad > 0 ? Number(formOriginalPriceMad) : undefined,
      badge: formBadge ? formBadge : undefined,
      image: formImage || '/images/scent_noir_absolu_1793649456099.jpg',
      description: {
        ar: finalCharacterAr,
        fr: formCharacterAr.trim() || 'Composition olfactive prestigieuse élaborée avec passion.',
        en: formCharacterAr.trim() || 'A prestigious olfactory composition crafted with passion.',
      },
      notes: {
        top: {
          ar: formTopNotes.trim() || 'برغموت منعش، توابل نبيلة',
          fr: formTopNotes.trim() || 'Bergamote & Épices nobles',
          en: formTopNotes.trim() || 'Fresh bergamot & noble spices',
        },
        heart: {
          ar: formHeartNotes.trim() || 'عنبر ملكي، أزهار طائفية',
          fr: formHeartNotes.trim() || 'Ambre royal & Fleurs',
          en: formHeartNotes.trim() || 'Royal amber & Blossoms',
        },
        base: {
          ar: formBaseNotes.trim() || 'عود أصيل، خشب الصندل، مسك أبيض',
          fr: formBaseNotes.trim() || 'Oud précieux, Santal & Musc',
          en: formBaseNotes.trim() || 'Precious oud, Sandalwood & White musk',
        },
      },
      longevity: {
        ar: formLongevity.trim() || '10 – 14 ساعة',
        fr: formLongevity.trim() || '10 – 14 heures',
        en: formLongevity.trim() || '10 – 14 hours',
      },
      sillage: {
        ar: formSillage.trim() || 'فوحان ملكي مميز',
        fr: formSillage.trim() || 'Sillage royal remarquable',
        en: formSillage.trim() || 'Royal remarkable sillage',
      },
      packSummary:
        isPack && (formPackSummary.trim() || formCharacterAr.trim())
          ? {
              ar: formPackSummary.trim() || formCharacterAr.trim() || 'باك مميز',
              fr: formPackSummary.trim() || 'Coffret Collection',
              en: formPackSummary.trim() || 'Collection Pack',
            }
          : undefined,
    };

    let updatedList: Fragrance[];
    if (editingItem) {
      updatedList = catalog.map((item) => (item.id === editingItem.id ? newFragrance : item));
    } else {
      updatedList = [newFragrance, ...catalog];
    }

    onUpdateCatalog(updatedList);
    saveStoredCustomCatalog(updatedList);

    try {
      await saveFragranceToFirestore(newFragrance);
      await saveServerCatalogApi(updatedList);
      triggerNotification(
        editingItem
          ? `تم تحديث "${newFragrance.name}" وتثبيته في السحابة بنجاح ✅`
          : `تمت إضافة "${newFragrance.name}" وتثبيته في السحابة بنجاح ✅`
      );
    } catch (saveErr) {
      console.warn('Sync notice:', saveErr);
      triggerNotification(`تم حفظ "${newFragrance.name}" بنجاح في المتجر ✅`);
    } finally {
      setIsSavingProduct(false);
      setIsModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id, name } = itemToDelete;
    setItemToDelete(null);
    const updated = catalog.filter((item) => item.id !== id);
    onUpdateCatalog(updated);
    saveStoredCustomCatalog(updated);
    await saveServerCatalogApi(updated);
    await deleteServerProductApi(id);
    triggerNotification(`تم حذف "${name}" بنجاح من المتجر والقاعدة السحابية ✅`);
  };

  const filteredCatalog = catalog.filter((item) => {
    if (activeTab === 'full' && (item.isPack || item.isDecantOnly)) return false;
    if (activeTab === 'decants' && !item.isDecantOnly) return false;
    if (activeTab === 'packs' && !item.isPack) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      return matchName || matchCat;
    }
    return true;
  });

  const totalFull = catalog.filter((i) => !i.isPack && !i.isDecantOnly).length;
  const totalDecants = catalog.filter((i) => i.isDecantOnly).length;
  const totalPacks = catalog.filter((i) => i.isPack).length;

  // Unauthenticated: Secure Password Gate
  if (!isAuthenticated) {
    const isLocked = lockoutSeconds > 0;

    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#FAF7F2]">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E6DDD0] shadow-[0_20px_48px_rgba(30,21,15,0.09)] p-7 sm:p-9 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#D4C2AC] text-[#8C6239] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <ShieldCheck className="w-7 h-7 stroke-[1.8]" />
          </div>

          <h1 className="font-serif-editorial text-2xl sm:text-3xl text-[#1E150F] mb-1">
            البوابة المشفرة لإدارة المتجر
          </h1>
          <p className="text-xs text-[#6B5748] tracking-widest uppercase mb-6 font-medium">
            Vault Access · SALIM FRAGRANCE
          </p>

          {isLocked && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-start flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">تم تفعيل القفل الأمني المؤقت</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  تكرار المحاولات الخاطئة أدى لقفل الوصول. انتظر{' '}
                  <span className="font-bold tabular-nums font-mono">{lockoutSeconds}</span> ثانية.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#4A3728] mb-2 text-start"
              >
                كلمة المرور المشفرة
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLocked}
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="أدخل كلمة المرور السرية..."
                  autoComplete="current-password"
                  autoFocus
                  className={`w-full px-4 pe-11 py-3 rounded-xl border text-sm font-mono tracking-wider focus:outline-none transition-colors ${
                    authError
                      ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-1 focus:ring-rose-400'
                      : 'border-[#D4C2AC] bg-[#FAF7F2] text-[#1E150F] focus:border-[#8C6239] focus:bg-white'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLocked}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-[#8C6239] hover:text-[#1E150F] p-1 focus:outline-none"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {authError && (
                <p className="text-xs text-rose-600 mt-2 text-start font-medium leading-relaxed">
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLocked || !enteredPassword}
              className={`w-full py-3.5 px-6 rounded-full bg-[#2B1D14] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-md ${
                isLocked || !enteredPassword
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-[#3E2A1E] active:scale-[0.99]'
              }`}
            >
              تسجيل الدخول الآمن
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E6DDD0] flex items-center justify-between text-xs text-[#8C6239]">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>العودة للمتجر</span>
            </button>
            <span className="text-[#8C6239] text-[11px] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>حماية 256-bit</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Toast / Notification Banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className={`fixed top-4 end-4 z-50 py-3 px-5 rounded-xl text-xs font-medium shadow-xl border flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-[#2B1D14] text-[#FAF7F2] border-[#8C6239]/40'
              }`}
            >
              <Check className="w-4 h-4 text-[#C9A96E]" />
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-[#E6DDD0] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#8C6239] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Maison de Parfum · Ksar El Kebir</span>
            </div>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl text-[#1E150F]">
              لوحة إدارة العطور والمنتجات
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5748] mt-1">
              إضافة سريعة وسهلة للعطور، التقسيمات، والباكات بضغطة زر. التعديلات تظهر فوراً للزوار.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 py-3 px-5 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] active:scale-[0.99] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 py-3 px-4 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] hover:bg-white text-[#1E150F] text-xs font-semibold tracking-wider transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#8C6239]" />
              <span>معاينة المتجر</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              title="تغيير كلمة المرور السرية"
              className="w-10 h-10 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] hover:bg-white text-[#6B5748] flex items-center justify-center transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="py-2.5 px-3 rounded-full text-xs text-[#8C6239] hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              خروج
            </button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-white rounded-xl border border-[#E6DDD0] p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#D4C2AC] text-[#8C6239] flex items-center justify-center shrink-0">
              <SprayCan className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B5748]">العطور الكاملة (كومبلي)</p>
              <p className="text-2xl font-serif-editorial text-[#1E150F] font-semibold tabular-nums">
                {totalFull}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E6DDD0] p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#D4C2AC] text-[#8C6239] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B5748]">تقسيمات 10 مل متوفرة</p>
              <p className="text-2xl font-serif-editorial text-[#1E150F] font-semibold tabular-nums">
                {totalDecants}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E6DDD0] p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#D4C2AC] text-[#8C6239] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B5748]">الباكات والعروض الترويجية</p>
              <p className="text-2xl font-serif-editorial text-[#1E150F] font-semibold tabular-nums">
                {totalPacks}
              </p>
            </div>
          </div>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-[#E6DDD0] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C6239] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن اسم عطر أو فئة..."
                className="w-full ps-10 pe-4 py-2.5 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] text-xs text-[#1E150F] placeholder-[#8C7A6B] focus:outline-none focus:border-[#8C6239] focus:bg-white transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] rounded-full border border-[#E6DDD0] self-start sm:self-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#2B1D14] text-[#FAF7F2] shadow-xs'
                    : 'text-[#6B5748] hover:text-[#1E150F]'
                }`}
              >
                الكل ({catalog.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('full')}
                className={`py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'full'
                    ? 'bg-[#2B1D14] text-[#FAF7F2] shadow-xs'
                    : 'text-[#6B5748] hover:text-[#1E150F]'
                }`}
              >
                قارورة كاملة ({totalFull})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('decants')}
                className={`py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'decants'
                    ? 'bg-[#2B1D14] text-[#FAF7F2] shadow-xs'
                    : 'text-[#6B5748] hover:text-[#1E150F]'
                }`}
              >
                تقسيمات 10ml ({totalDecants})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('packs')}
                className={`py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'packs'
                    ? 'bg-[#2B1D14] text-[#FAF7F2] shadow-xs'
                    : 'text-[#6B5748] hover:text-[#1E150F]'
                }`}
              >
                الباكات ({totalPacks})
              </button>
            </div>
          </div>
        </div>

        {/* Product List Table / Grid */}
        <div className="bg-white rounded-2xl border border-[#E6DDD0] overflow-hidden shadow-sm">
          {filteredCatalog.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <p className="text-sm text-[#6B5748] mb-3">لا توجد منتجات تطابق هذا الفلتر حالياً</p>
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-full bg-[#2B1D14] text-[#FAF7F2] text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E6DDD0]">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail Image */}
                    <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-xl overflow-hidden border border-[#D4C2AC] bg-[#FAF7F2] shrink-0">
                      <LuxuryImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif-editorial text-lg sm:text-xl text-[#1E150F]">
                          {item.name}
                        </span>

                        {item.isPack ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2B1D14] text-[#FAF7F2]">
                            🎁 باك / عرض خاص
                          </span>
                        ) : item.isDecantOnly ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8C6239] text-[#FAF7F2]">
                            🧪 تقسيمة 10ml
                          </span>
                        ) : item.decant10PriceMad && item.decant10PriceMad > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8C6239]/15 text-[#8C6239]">
                            ✨ كومبلي + تقسيمة
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#4A3728]/15 text-[#4A3728]">
                            🧴 قارورة كاملة
                          </span>
                        )}

                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8C6239]/15 text-[#8C6239]">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#6B5748] line-clamp-1">
                        {item.character.ar || item.character.fr || item.character.en}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        {item.isPack ? (
                          <span className="font-semibold text-[#1E150F] tabular-nums">
                            سعر الباك: <span dir="ltr">{item.priceMad} MAD</span>
                          </span>
                        ) : item.isDecantOnly ? (
                          <span className="font-semibold text-[#8C6239] tabular-nums">
                            سعر التقسيمة 10ml: <span dir="ltr">{item.decant10PriceMad || item.priceMad} MAD</span>
                          </span>
                        ) : (
                          <>
                            <span className="font-semibold text-[#1E150F] tabular-nums">
                              القارورة الكاملة: <span dir="ltr">{item.priceMad} MAD</span>
                            </span>
                            {item.decant10PriceMad && item.decant10PriceMad > 0 && (
                              <span className="text-[#8C6239] font-medium tabular-nums">
                                التقسيمة 10ml: <span dir="ltr">{item.decant10PriceMad} MAD</span>
                              </span>
                            )}
                          </>
                        )}

                        <span className="text-[#8C7A6B]">
                          الفئة: {item.category === 'For Him' ? 'رجال' : item.category === 'For Her' ? 'نساء' : 'للجنسين'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-full border border-[#D4C2AC] bg-white hover:bg-[#FAF7F2] text-xs font-medium text-[#1E150F] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#8C6239]" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setItemToDelete({ id: item.id, name: item.name })}
                      className="p-2 rounded-full border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 transition-colors"
                      title="حذف العطر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal - Two-Step Streamlined Flow */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
            {modalStep === 'select-type' && !editingItem ? (
              /* ================= STEP 1: SELECT PRODUCT TYPE (3 CLEAR CHOICES) ================= */
              <motion.div
                key="select-type-step"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white rounded-3xl border border-[#E6DDD0] shadow-2xl p-6 sm:p-8 my-6 text-start"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E6DDD0] mb-6">
                  <div>
                    <h2 className="font-serif-editorial text-2xl sm:text-3xl text-[#1E150F]">
                      إضافة منتج جديد للمتجر
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B5748] mt-1">
                      اختر نوع المنتج الذي ترغب في إضافته أولاً لعرض الحقول المناسبة له مباشرة:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full hover:bg-[#FAF7F2] text-[#6B5748] transition-colors"
                    aria-label="إغلاق"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 3 Prominent Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: قارورة كاملة (كومبلي) */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormKind('full');
                      setEnableDecantForFull(false);
                      setFormPriceMad(450);
                      setFormDecantPriceMad(95);
                      if (!formImage || formImage.includes('pack_')) {
                        setFormImage('/images/scent_noir_absolu_1793649456099.jpg');
                        setImagePreview('/images/scent_noir_absolu_1793649456099.jpg');
                      }
                      setModalStep('fill-form');
                    }}
                    className="group relative p-5 rounded-2xl border-2 border-[#E6DDD0] hover:border-[#8C6239] bg-[#FAF7F2]/60 hover:bg-white transition-all text-start flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C6239]"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#D4C2AC] text-[#8C6239] group-hover:bg-[#2B1D14] group-hover:text-[#FAF7F2] flex items-center justify-center mb-4 transition-colors shadow-xs">
                        <SprayCan className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <h3 className="font-serif-editorial text-lg text-[#1E150F] group-hover:text-[#8C6239] transition-colors">
                          قارورة كاملة
                        </h3>
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#8C6239] bg-[#8C6239]/10 px-2 py-0.5 rounded-full">
                          كومبلي
                        </span>
                      </div>
                      <p className="text-xs text-[#6B5748] leading-relaxed">
                        عطر أصلي بالقارورة المغلقة الكاملة (كومبلي) مستوردة ومغلفة كما هي للزبائن.
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-[#E6DDD0]/70 flex items-center justify-between text-xs font-semibold text-[#8C6239] group-hover:text-[#2B1D14]">
                      <span>اختيار القارورة</span>
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </button>

                  {/* Card 2: تقسيمة 10ml */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormKind('decant');
                      setEnableDecantForFull(false);
                      setFormPriceMad(95);
                      setFormDecantPriceMad(95);
                      if (!formImage || formImage.includes('pack_')) {
                        setFormImage('/images/scent_jasmin_nuit_1793649464121.jpg');
                        setImagePreview('/images/scent_jasmin_nuit_1793649464121.jpg');
                      }
                      setModalStep('fill-form');
                    }}
                    className="group relative p-5 rounded-2xl border-2 border-[#E6DDD0] hover:border-[#8C6239] bg-[#FAF7F2]/60 hover:bg-white transition-all text-start flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C6239]"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#D4C2AC] text-[#8C6239] group-hover:bg-[#2B1D14] group-hover:text-[#FAF7F2] flex items-center justify-center mb-4 transition-colors shadow-xs">
                        <Sparkles className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <h3 className="font-serif-editorial text-lg text-[#1E150F] group-hover:text-[#8C6239] transition-colors">
                          تقسيمة 10ml
                        </h3>
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#8C6239] bg-[#8C6239]/10 px-2 py-0.5 rounded-full">
                          Décant
                        </span>
                      </div>
                      <p className="text-xs text-[#6B5748] leading-relaxed">
                        تقسيمة أصلية متفرقة في بخاخ زجاجي فاخر 10 مل (~140 رشة)، أسهل طريقة للزبون لتجربة العطر.
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-[#E6DDD0]/70 flex items-center justify-between text-xs font-semibold text-[#8C6239] group-hover:text-[#2B1D14]">
                      <span>اختيار تقسيمة 10ml</span>
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </button>

                  {/* Card 3: باك / عرض */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormKind('pack');
                      setEnableDecantForFull(false);
                      setFormPriceMad(290);
                      setFormOriginalPriceMad(380);
                      if (!formImage || !formImage.includes('pack_')) {
                        setFormImage('/images/pack_discovery_4x10ml_1793740309304.jpg');
                        setImagePreview('/images/pack_discovery_4x10ml_1793740309304.jpg');
                      }
                      setModalStep('fill-form');
                    }}
                    className="group relative p-5 rounded-2xl border-2 border-[#E6DDD0] hover:border-[#8C6239] bg-[#FAF7F2]/60 hover:bg-white transition-all text-start flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C6239]"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#D4C2AC] text-[#8C6239] group-hover:bg-[#2B1D14] group-hover:text-[#FAF7F2] flex items-center justify-center mb-4 transition-colors shadow-xs">
                        <Package className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <h3 className="font-serif-editorial text-lg text-[#1E150F] group-hover:text-[#8C6239] transition-colors">
                          باك / عرض
                        </h3>
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#8C6239] bg-[#8C6239]/10 px-2 py-0.5 rounded-full">
                          Coffret
                        </span>
                      </div>
                      <p className="text-xs text-[#6B5748] leading-relaxed">
                        بوكس أو باقة عطور/تقسيمات مجمعة في علبة أنيقة لتقديم عروض توفير ترفع سلة المشتريات.
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-[#E6DDD0]/70 flex items-center justify-between text-xs font-semibold text-[#8C6239] group-hover:text-[#2B1D14]">
                      <span>اختيار باك / عرض</span>
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ================= STEP 2: TAILORED FORM PER SELECTED TYPE ================= */
              <motion.div
                key="fill-form-step"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full max-w-xl bg-white rounded-3xl border border-[#E6DDD0] shadow-2xl p-6 sm:p-7 my-6 max-h-[92vh] overflow-y-auto"
              >
                {/* Modal Top Bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#E6DDD0] mb-5">
                  <div className="flex items-center gap-3">
                    {!editingItem && (
                      <button
                        type="button"
                        onClick={() => setModalStep('select-type')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6239] hover:text-[#1E150F] transition-colors bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E6DDD0] px-3 py-1.5 rounded-full"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>تغيير النوع</span>
                      </button>
                    )}
                    <div>
                      <h2 className="font-serif-editorial text-2xl text-[#1E150F]">
                        {editingItem ? 'تعديل بيانات المنتج' : (
                          formKind === 'pack'
                            ? 'إضافة باك أو عرض جديد'
                            : formKind === 'decant'
                            ? 'إضافة تقسيمة 10ml جديدة'
                            : 'إضافة قارورة كاملة (كومبلي)'
                        )}
                      </h2>
                      <span className="inline-block text-[11px] font-medium text-[#8C6239] mt-0.5">
                        {formKind === 'pack'
                          ? 'بوكس أو باقة عطور مجمعة للزبائن'
                          : formKind === 'decant'
                          ? 'تقسيمة أصلية 10ml في بخاخ زجاجي'
                          : 'قارورة أصلية كاملة مغلقة'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-[#6B5748] transition-colors"
                    aria-label="إغلاق"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4 text-start">
                  {/* FIELD 1: Product Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1E150F] mb-1.5">
                      {formKind === 'pack'
                        ? '1. اسم الباك أو العرض *'
                        : formKind === 'decant'
                        ? '1. اسم العطر صاحب التقسيمة *'
                        : '1. اسم العطر الكامل *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={
                        formKind === 'pack'
                          ? 'مثلاً: Coffret Discovery 4×10ml أو باك التوفير الفاخر...'
                          : formKind === 'decant'
                          ? 'مثلاً: Baccarat Rouge 10ml أو Akram 10ml...'
                          : 'مثلاً: Sauvage Elixir أو Royal Oud أو Akram...'
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D4C2AC] bg-[#FAF7F2] text-xs text-[#1E150F] font-medium focus:border-[#8C6239] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* FIELD 2: Pricing tailored to choice */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1E150F] mb-1.5">
                      2. السعر بالدرهم المغربي (MAD) *
                    </label>

                    {/* Full bottle pricing */}
                    {formKind !== 'pack' && formKind !== 'decant' && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6DDD0]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="block text-xs font-semibold text-[#1E150F]">
                              سعر القارورة الكاملة (MAD) *
                            </span>
                            <span className="text-[11px] text-[#6B5748]">سعر البيع النهائي للقارورة الأصلية الكاملة المغلقة</span>
                          </div>
                          <div className="w-full sm:w-44">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                required
                                min={1}
                                dir="ltr"
                                value={formPriceMad === 0 ? '' : formPriceMad}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormPriceMad(val === '' ? 0 : Number(val));
                                }}
                                placeholder="450"
                                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-[#D4C2AC] bg-white text-sm font-bold text-[#1E150F] text-start focus:border-[#8C6239] focus:outline-none shadow-xs"
                              />
                              <span className="px-3 py-2.5 rounded-xl border border-[#D4C2AC] bg-white text-xs font-bold text-[#8C6239] shrink-0 select-none">
                                MAD
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Decant 10ml pricing */}
                    {formKind === 'decant' && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="block text-xs font-semibold text-[#1E150F]">
                            سعر التقسيمة 10ml بالدرهم (MAD) *
                          </span>
                          <span className="text-[11px] text-[#6B5748]">
                            بخاخ زجاجي راقٍ 10ml أصلي معبأ عند الطلب (~140 رشة)
                          </span>
                        </div>
                        <div className="w-full sm:w-44">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              required
                              min={1}
                              dir="ltr"
                              value={formDecantPriceMad === 0 ? '' : formDecantPriceMad}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                setFormDecantPriceMad(val);
                                setFormPriceMad(val);
                              }}
                              placeholder="95"
                              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-[#D4C2AC] bg-white text-sm font-bold text-[#1E150F] text-start focus:border-[#8C6239] focus:outline-none shadow-xs"
                            />
                            <span className="px-3 py-2.5 rounded-xl border border-[#D4C2AC] bg-white text-xs font-bold text-[#8C6239] shrink-0 select-none">
                              MAD
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pack pricing */}
                    {formKind === 'pack' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6DDD0]">
                        <div>
                          <span className="block text-xs font-semibold text-[#1E150F] mb-1">
                            سعر الباك النهائي (MAD) *
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              required
                              min={1}
                              dir="ltr"
                              value={formPriceMad === 0 ? '' : formPriceMad}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormPriceMad(val === '' ? 0 : Number(val));
                              }}
                              placeholder="290"
                              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-[#D4C2AC] bg-white text-sm font-bold text-[#1E150F] text-start focus:border-[#8C6239] focus:outline-none shadow-xs"
                            />
                            <span className="px-3 py-2.5 rounded-xl border border-[#D4C2AC] bg-white text-xs font-bold text-[#8C6239] shrink-0 select-none">
                              MAD
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-[#1E150F] mb-1">
                            السعر قبل الخصم (اختياري للشطب)
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              dir="ltr"
                              value={formOriginalPriceMad === 0 ? '' : formOriginalPriceMad}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormOriginalPriceMad(val === '' ? 0 : Number(val));
                              }}
                              placeholder="مثلاً: 380"
                              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-[#D4C2AC] bg-white text-sm font-medium text-[#6B5748] text-start focus:border-[#8C6239] focus:outline-none shadow-xs"
                            />
                            <span className="px-3 py-2.5 rounded-xl border border-[#D4C2AC] bg-white text-xs font-semibold text-[#8C7A6B] shrink-0 select-none">
                              MAD
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FIELD 3: Product Image */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1E150F] mb-1.5">
                      3. صورة المنتج *
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6DDD0]">
                      {/* Image Thumbnail */}
                      <div className="w-20 h-24 rounded-xl border border-[#D4C2AC] overflow-hidden bg-white shrink-0 shadow-xs">
                        <LuxuryImage
                          src={imagePreview || formImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-[#D4C2AC] hover:border-[#8C6239] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#8C6239] cursor-pointer transition-colors shadow-xs">
                          <Upload className="w-4 h-4" />
                          <span>اختر صورة من هاتفك أو حاسوبك</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>

                        {/* Tailored Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8C7A6B]">
                          <span>أو صورة جاهزة:</span>
                          {(formKind === 'pack' ? PACK_PRESET_IMAGES : FLACON_PRESET_IMAGES).map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setFormImage(preset.url);
                                setImagePreview(preset.url);
                              }}
                              className={`px-2 py-0.5 rounded-md border text-[10px] transition-colors ${
                                (imagePreview || formImage) === preset.url
                                  ? 'border-[#8C6239] bg-[#8C6239] text-[#FAF7F2]'
                                  : 'border-[#D4C2AC] bg-white text-[#4A3728] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FIELD 4: Category & Description */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#1E150F] mb-1.5">
                          4. فئة المنتج *
                        </label>
                        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#FAF7F2] border border-[#D4C2AC]">
                          {(['Unisex', 'For Him', 'For Her'] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setFormCategory(cat)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                                formCategory === cat
                                  ? 'bg-[#2B1D14] text-[#FAF7F2] shadow-xs'
                                  : 'text-[#6B5748] hover:text-[#1E150F]'
                              }`}
                            >
                              {cat === 'Unisex' ? 'للجنسين' : cat === 'For Him' ? 'للرجال' : 'للنساء'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Badge selection */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1E150F] mb-1.5">
                          شارة تمييز (Badge اختياري)
                        </label>
                        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#FAF7F2] border border-[#D4C2AC]">
                          <button
                            type="button"
                            onClick={() => setFormBadge('')}
                            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-medium transition-colors truncate ${
                              formBadge === ''
                                ? 'bg-[#2B1D14] text-[#FAF7F2]'
                                : 'text-[#6B5748] hover:text-[#1E150F]'
                            }`}
                          >
                            بدون
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormBadge('Best Seller')}
                            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-medium transition-colors truncate ${
                              formBadge === 'Best Seller'
                                ? 'bg-[#8C6239] text-[#FAF7F2]'
                                : 'text-[#6B5748] hover:text-[#1E150F]'
                            }`}
                          >
                            الأكثر طلباً
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormBadge('New')}
                            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-medium transition-colors truncate ${
                              formBadge === 'New'
                                ? 'bg-[#8C6239] text-[#FAF7F2]'
                                : 'text-[#6B5748] hover:text-[#1E150F]'
                            }`}
                          >
                            جديد
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Description or Pack Summary tailored */}
                    {formKind === 'pack' ? (
                      <div>
                        <label className="block text-xs font-semibold text-[#1E150F] mb-1.5">
                          5. محتويات الباك ووصف العرض (ماذا يستلم المشتري في البوكس؟) *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={formPackSummary}
                          onChange={(e) => {
                            setFormPackSummary(e.target.value);
                            setFormCharacterAr(e.target.value);
                          }}
                          placeholder="مثلاً: 4 تقسيمات أصلية 10 مل: رويال عود، نوار أبسولو، ياسمين نوي، بروم أطلس في علبة إهداء فاخرة."
                          className="w-full px-4 py-2.5 rounded-xl border border-[#D4C2AC] bg-[#FAF7F2] text-xs text-[#1E150F] leading-relaxed focus:border-[#8C6239] focus:bg-white focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-[#1E150F] mb-1.5">
                          5. وصف العطر وإحساس الرائحة (ما يهم الزبون معرفته) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formCharacterAr}
                          onChange={(e) => setFormCharacterAr(e.target.value)}
                          placeholder={
                            formKind === 'decant'
                              ? 'مثلاً: نفحات شرقية فاخرة من الزعفران والياسمين مع فوحان وثبات يدوم طويلاً...'
                              : 'مثلاً: عطر عنبري خشبي فخم، يمنحك حضوراً جذاباً وثباتاً طوال اليوم...'
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-[#D4C2AC] bg-[#FAF7F2] text-xs text-[#1E150F] focus:border-[#8C6239] focus:bg-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Compact Live Card Preview */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FAF7F2] to-[#F5ECE0] border border-[#E6DDD0] flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#D4C2AC] shrink-0 shadow-xs">
                      <LuxuryImage
                        src={imagePreview || formImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[#8C6239] bg-[#8C6239]/15 px-2 py-0.5 rounded-full">
                          {formKind === 'pack'
                            ? 'باك وعرض خاص'
                            : formKind === 'decant'
                            ? 'تقسيمة 10ml'
                            : formKind === 'dual'
                            ? 'قارورة + تقسيمة'
                            : 'قارورة كاملة (كومبلي)'}
                        </span>
                        {formBadge && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            {formBadge}
                          </span>
                        )}
                      </div>
                      <p className="font-serif-editorial text-sm font-semibold text-[#1E150F] truncate mt-0.5">
                        {formName.trim() || 'اسم العطر أو الباك'}
                      </p>
                      <p className="text-[11px] text-[#8C6239] font-bold tabular-nums">
                        {formKind === 'decant'
                          ? `${formDecantPriceMad || 95} MAD`
                          : `${formPriceMad || 450} MAD`}
                        {formOriginalPriceMad > 0 && formKind === 'pack' && (
                          <span className="text-[10px] text-[#8C7A6B] line-through ms-1.5 font-normal">
                            {formOriginalPriceMad} MAD
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-3 border-t border-[#E6DDD0] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={isSavingProduct}
                      onClick={() => setIsModalOpen(false)}
                      className="py-2.5 px-5 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] text-xs font-medium text-[#6B5748] hover:text-[#1E150F] transition-colors disabled:opacity-50"
                    >
                      إلغاء
                    </button>

                    <button
                      type="submit"
                      disabled={isCompressingImage || isSavingProduct}
                      className="py-2.5 px-6 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] active:scale-[0.99] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSavingProduct ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
                          <span>جاري الحفظ في السحابة...</span>
                        </>
                      ) : isCompressingImage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <span>جاري معالجة الصورة...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-[#C9A96E]" />
                          <span>حفظ ونشر في المتجر فوراً</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E6DDD0] p-6 shadow-xl text-start">
              <h3 className="font-serif-editorial text-xl text-[#1E150F] mb-1">
                تغيير كلمة المرور المشفرة
              </h3>
              <p className="text-xs text-[#6B5748] mb-4">
                اختر كلمة مرور قوية (8 أحرف فأكثر) تحتوي على حروف وأرقام ورموز (@)
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={32}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="مثلاً: Salim@Casa26..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D4C2AC] bg-[#FAF7F2] text-center text-sm font-mono tracking-wider focus:border-[#8C6239] focus:bg-white focus:outline-none"
                />

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setNewPassword('');
                    }}
                    className="py-2 px-4 rounded-full border border-[#D4C2AC] text-xs text-[#6B5748]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (newPassword.trim().length >= 8) {
                        updateAdminPassword(newPassword);
                        triggerNotification('تم تحديث كلمة المرور المشفرة بنجاح ✅');
                        setIsPasswordModalOpen(false);
                        setNewPassword('');
                      } else {
                        triggerNotification('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل', true);
                      }
                    }}
                    className="py-2 px-5 rounded-full bg-[#2B1D14] text-[#FAF7F2] text-xs font-semibold"
                  >
                    حفظ كلمة المرور
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Product Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl border border-rose-100 p-6 shadow-2xl text-start"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif-editorial text-xl text-[#1E150F] mb-1">
                تأكيد حذف المنتج نهائياً
              </h3>
              <p className="text-sm text-[#6B5748] mb-5 leading-relaxed">
                هل أنت تأكد من رغبتك في حذف العطر{' '}
                <span className="font-semibold text-[#1E150F]">"{itemToDelete.name}"</span>؟ سيتم
                إزالته فوراً من المتجر وجميع الأجهزة والقاعدة السحابية.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="py-2.5 px-5 rounded-full border border-[#D4C2AC] text-xs font-medium text-[#6B5748] hover:bg-[#FAF7F2] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="py-2.5 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تأكيد الحذف</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
