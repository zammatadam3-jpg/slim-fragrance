import { Language } from './fragrances';

export interface Translations {
  dir: 'ltr' | 'rtl';
  nav: {
    home: string;
    shop: string;
    packs: string;
    about: string;
    contact: string;
    shopAll: string;
    aboutUs: string;
  };
  formats: {
    allFormats: string;
    fullBottle: string;
    fullBottleShort: string;
    decant10: string;
    decant10Short: string;
    packs: string;
    packBadge: string;
    saveAmount: (mad: number) => string;
    decantSubtitle: string;
    fullSubtitle: string;
    chooseFormat: string;
    includedInPack: string;
  };
  hero: {
    kicker: string;
    titlePart1: string;
    titleItalic: string;
    subtitle: string;
    shopNow: string;
    explorePacks: string;
    orderWhatsapp: string;
    statScents: string;
    statFormats: string;
    statDelivery: string;
    bestSeller: string;
    orderNow: string;
  };
  signatureEdit: {
    kicker: string;
    titlePart1: string;
    titleItalic: string;
    subtitle: string;
    viewAll: string;
  };
  packsSection: {
    kicker: string;
    titlePart1: string;
    titleItalic: string;
    subtitle: string;
    viewAllPacks: string;
  };
  collection: {
    kicker: string;
    titlePart1: string;
    titleItalic: string;
    subtitle: string;
    all: string;
    forHim: string;
    forHer: string;
    unisex: string;
    bestSellers: string;
    searchPlaceholder: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortName: string;
    countLabel: (count: number) => string;
    emptyState: string;
    resetFilters: string;
  };
  card: {
    orderViaWhatsapp: string;
    discover: string;
    addToBag: string;
    added: string;
    newBadge: string;
    bestSellerBadge: string;
  };
  story: {
    kicker: string;
    titlePart1: string;
    titleItalic: string;
    p1: string;
    p2: string;
    p3: string;
    cta: string;
  };
  conciergeCta: {
    kicker: string;
    titlePart1: string;
    titleItalic: string;
    primaryBtn: string;
    secondaryBtn: string;
  };
  contact: {
    kicker: string;
    titlePart1: string;
    titleItalic: string;
    subtitle: string;
    whatsappLabel: string;
    instagramLabel: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendBtn: string;
    sentSuccess: string;
    validationError: string;
  };
  cart: {
    kicker: string;
    title: (count: number) => string;
    emptyTitle: string;
    emptySubtitle: string;
    browseBtn: string;
    total: string;
    conciergeNote: string;
    sendOrderBtn: string;
    removeAria: string;
  };
  productDetail: {
    backToCollection: string;
    topNotes: string;
    heartNotes: string;
    baseNotes: string;
    longevity: string;
    sillage: string;
    addToCollection: string;
    orderDirectWhatsapp: string;
    deliveryPromise: string;
  };
  footer: {
    explore: string;
    collections: string;
    rights: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    dir: 'ltr',
    nav: {
      home: 'Home',
      shop: 'Shop',
      packs: 'Packs & 10ml',
      about: 'About',
      contact: 'Contact',
      shopAll: 'Shop All',
      aboutUs: 'About Us',
    },
    formats: {
      allFormats: 'All Formats',
      fullBottle: 'Full Bottle',
      fullBottleShort: 'Full Bottle',
      decant10: 'Original Decants 10ml',
      decant10Short: '10ml Decant',
      packs: 'Packs & Coffrets',
      packBadge: 'Curated Pack',
      saveAmount: (mad) => `Save ${mad} MAD`,
      decantSubtitle: 'Authentic 10ml glass spray decant (~140 sprays)',
      fullSubtitle: 'Complete sealed original presentation flacon',
      chooseFormat: 'Select Format',
      includedInPack: 'Included in this Pack',
    },
    hero: {
      kicker: 'MAISON DE PARFUM · KSAR EL KEBIR',
      titlePart1: 'Discover Your',
      titleItalic: 'Signature Scent',
      subtitle:
        'Original fragrances available as sealed full bottles, authentic 10ml glass spray decants, and curated discovery packs.',
      shopNow: 'SHOP NOW',
      explorePacks: 'DISCOVER PACKS',
      orderWhatsapp: 'ORDER ON WHATSAPP',
      statScents: '10ml Decants & Full Bottles',
      statFormats: 'Curated Packs Available',
      statDelivery: 'Delivered across Morocco',
      bestSeller: 'Best Seller',
      orderNow: 'ORDER NOW',
    },
    signatureEdit: {
      kicker: 'FULL BOTTLES & 10ML DECANTS',
      titlePart1: 'Fragrances chosen',
      titleItalic: 'by the maison',
      subtitle:
        'Choose between an authentic 10ml spray decant to test on skin or the complete original bottle directly on every scent.',
      viewAll: 'VIEW ALL FRAGRANCES',
    },
    packsSection: {
      kicker: 'COFFRETS & DISCOVERY SETS',
      titlePart1: 'Exclusive Packs',
      titleItalic: '& 10ml Sets',
      subtitle:
        'Thoughtfully paired 10ml original decant sets and full-bottle coffrets at privileged bundle pricing.',
      viewAllPacks: 'VIEW ALL PACKS',
    },
    collection: {
      kicker: 'THE COLLECTION',
      titlePart1: 'Full Bottles, 10ml Decants',
      titleItalic: '& Packs',
      subtitle:
        'Switch between original full bottles, authentic 10ml glass decants, and curated packs — delivered across Morocco.',
      all: 'ALL',
      forHim: 'FOR HIM',
      forHer: 'FOR HER',
      unisex: 'UNISEX',
      bestSellers: 'Best Sellers',
      searchPlaceholder: 'Search a scent, pack, or note...',
      sortFeatured: 'Featured',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortName: 'Alphabetical',
      countLabel: (count) => `${count} ${count === 1 ? 'creation' : 'creations'}`,
      emptyState: 'No fragrances or packs match your search.',
      resetFilters: 'Reset filters',
    },
    card: {
      orderViaWhatsapp: 'ORDER VIA WHATSAPP',
      discover: 'DISCOVER',
      addToBag: 'Add to selection',
      added: 'Added',
      newBadge: 'New',
      bestSellerBadge: 'Best Seller',
    },
    story: {
      kicker: 'OUR STORY',
      titlePart1: 'Authentic scents, in 10ml decants,',
      titleItalic: 'full bottles & packs',
      p1: "SALIM FRAGRANCE began in Ksar El Kebir with a clear conviction: everyone deserves access to 100% original, long-lasting fragrances — whether you want to explore several scents in 10ml glass spray decants or invest in a complete full bottle.",
      p2: 'Every 10ml decant is decanted cleanly to order from the original bottle into a luxury glass atomizer (~140 sprays), giving you weeks of real wear on skin. And when you fall in love, our sealed full bottles and curated packs offer unmatched value.',
      p3: 'Today more than five hundred clients across Morocco trust the house for their daily signature scents, discovery decants, and gift coffrets — with every order confirmed personally on WhatsApp.',
      cta: 'EXPLORE BOTTLES & DECANTS',
    },
    conciergeCta: {
      kicker: 'CUSTOM PACK OR ADVICE?',
      titlePart1: 'Tell us what you love — we will compose',
      titleItalic: 'your selection',
      primaryBtn: 'MESSAGE OUR CONCIERGE',
      secondaryBtn: 'CONTACT PAGE',
    },
    contact: {
      kicker: 'CONTACT',
      titlePart1: 'We answer',
      titleItalic: 'personally',
      subtitle:
        'Reach us on WhatsApp for instant advice on 10ml decants, full bottles, or custom multi-scent packs.',
      whatsappLabel: 'WhatsApp',
      instagramLabel: 'Instagram',
      formTitle: 'Write to the house',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@email.com',
      messageLabel: 'Message',
      messagePlaceholder:
        'Ask about a 10ml decant, a complete full bottle, or a custom pack.',
      sendBtn: 'SEND MESSAGE',
      sentSuccess:
        'Thank you. Your message has been received by the maison — we will reply shortly, or you can continue directly on WhatsApp.',
      validationError: 'Please fill in your name, a valid email, and your message.',
    },
    cart: {
      kicker: 'YOUR SELECTION',
      title: (count) => `The Collection (${count})`,
      emptyTitle: 'Your selection is empty',
      emptySubtitle:
        'Add 10ml original decants, original full bottles, or curated packs to your selection.',
      browseBtn: 'EXPLORE COLLECTION',
      total: 'Total',
      conciergeNote:
        'Your order (10ml decants, full bottles, or packs) is confirmed personally on WhatsApp. Delivery across Morocco.',
      sendOrderBtn: 'SEND ORDER VIA WHATSAPP',
      removeAria: 'Remove from selection',
    },
    productDetail: {
      backToCollection: 'BACK TO COLLECTION',
      topNotes: 'Top Notes',
      heartNotes: 'Heart Notes',
      baseNotes: 'Base Notes',
      longevity: 'Longevity',
      sillage: 'Sillage',
      addToCollection: 'ADD TO SELECTION',
      orderDirectWhatsapp: 'ORDER VIA WHATSAPP',
      deliveryPromise:
        '100% Original · Personal confirmation on WhatsApp · Fast delivery across Morocco · Cash on delivery',
    },
    footer: {
      explore: 'EXPLORE',
      collections: 'FORMATS & COLLECTIONS',
      rights: '© 2026 SALIM FRAGRANCE',
    },
  },
  fr: {
    dir: 'ltr',
    nav: {
      home: 'Accueil',
      shop: 'Boutique',
      packs: 'Packs & 10ml',
      about: 'Maison',
      contact: 'Contact',
      shopAll: 'Toute la Collection',
      aboutUs: 'Notre Histoire',
    },
    formats: {
      allFormats: 'Tous les Formats',
      fullBottle: 'Flacon Complet',
      fullBottleShort: 'Complet',
      decant10: 'Décants Originaux 10ml',
      decant10Short: 'Décant 10ml',
      packs: 'Packs & Coffrets',
      packBadge: 'Pack Prestige',
      saveAmount: (mad) => `Économisez ${mad} MAD`,
      decantSubtitle: 'Vaporisateur en verre 10ml rempli du flacon original (~140 sprays)',
      fullSubtitle: 'Flacon complet original scellé dans son écrin',
      chooseFormat: 'Choisir le Format',
      includedInPack: 'Contenu de ce Pack',
    },
    hero: {
      kicker: 'MAISON DE PARFUM · KSAR EL KEBIR',
      titlePart1: 'Découvrez Votre',
      titleItalic: 'Signature Olfactive',
      subtitle:
        'Parfums 100% originaux proposés en flacons complets, en décants vaporisateurs 10ml, et en packs découverte avantageux.',
      shopNow: 'DÉCOUVRIR',
      explorePacks: 'VOIR LES PACKS',
      orderWhatsapp: 'COMMANDER SUR WHATSAPP',
      statScents: 'Décants 10ml & Flacons Complets',
      statFormats: 'Packs & Coffrets Exclusifs',
      statDelivery: 'Livraison partout au Maroc',
      bestSeller: 'Best Seller',
      orderNow: 'COMMANDER',
    },
    signatureEdit: {
      kicker: 'FLACONS COMPLETS & DÉCANTS 10ML',
      titlePart1: 'Les parfums choisis',
      titleItalic: 'par la maison',
      subtitle:
        'Choisissez directement sur chaque parfum entre le décant original 10ml pour tester ou le flacon complet original.',
      viewAll: 'VOIR TOUS LES PARFUMS',
    },
    packsSection: {
      kicker: 'COFFRETS & PACKS DÉCOUVERTE',
      titlePart1: 'Nos Packs',
      titleItalic: '& Décants 10ml',
      subtitle:
        'Des coffrets de décants originaux 10ml et des packs flacons complets pensés pour découvrir ou offrir à tarif privilégié.',
      viewAllPacks: 'VOIR TOUS LES PACKS',
    },
    collection: {
      kicker: 'LA COLLECTION',
      titlePart1: 'Flacons Complets, Décants 10ml',
      titleItalic: '& Packs',
      subtitle:
        'Filtrez par flacon complet original, décant original 10ml ou pack découverte — livraison rapide partout au Maroc.',
      all: 'TOUS',
      forHim: 'POUR LUI',
      forHer: 'POUR ELLE',
      unisex: 'UNISEXE',
      bestSellers: 'Meilleures Ventes',
      searchPlaceholder: 'Rechercher un parfum, un pack ou une note...',
      sortFeatured: 'Sélection',
      sortPriceAsc: 'Prix : Croissant',
      sortPriceDesc: 'Prix : Décroissant',
      sortName: 'Alphabétique',
      countLabel: (count) => `${count} ${count === 1 ? 'création' : 'créations'}`,
      emptyState: 'Aucun parfum ou pack ne correspond à votre recherche.',
      resetFilters: 'Réinitialiser',
    },
    card: {
      orderViaWhatsapp: 'COMMANDER VIA WHATSAPP',
      discover: 'DÉCOUVRIR',
      addToBag: 'Ajouter à la sélection',
      added: 'Ajouté',
      newBadge: 'Nouveau',
      bestSellerBadge: 'Best Seller',
    },
    story: {
      kicker: 'NOTRE HISTOIRE',
      titlePart1: 'L’authenticité en décant 10ml,',
      titleItalic: 'flacon complet & pack',
      p1: 'SALIM FRAGRANCE est née à Ksar El Kebir d’une idée claire : permettre à chacun de porter des parfums originaux à longue tenue — que ce soit en décant 10ml pour varier les plaisirs ou en flacon complet.',
      p2: 'Chaque décant de 10ml est prélevé à la commande depuis le flacon original dans un vaporisateur en verre élégant (~140 pulvérisations). Et nos packs réunissent nos meilleures créations à prix réduit.',
      p3: 'Aujourd’hui, plus de cinq cents clients au Maroc nous font confiance pour leurs flacons complets, leurs décants 10ml et leurs coffrets cadeaux, confirmés personnellement sur WhatsApp.',
      cta: 'EXPLORER LA BOUTIQUE',
    },
    conciergeCta: {
      kicker: 'UN PACK SUR MESURE ?',
      titlePart1: 'Dites-nous ce que vous aimez — nous composerons',
      titleItalic: 'votre pack idéal',
      primaryBtn: 'ÉCRIRE AU CONCIERGE',
      secondaryBtn: 'PAGE CONTACT',
    },
    contact: {
      kicker: 'CONTACT',
      titlePart1: 'Nous répondons',
      titleItalic: 'personnellement',
      subtitle:
        'Écrivez-nous sur WhatsApp pour commander un décant 10ml, un flacon complet ou composer votre propre pack.',
      whatsappLabel: 'WhatsApp',
      instagramLabel: 'Instagram',
      formTitle: 'Écrire à la maison',
      nameLabel: 'Nom',
      namePlaceholder: 'Votre nom',
      emailLabel: 'Email',
      emailPlaceholder: 'vous@email.com',
      messageLabel: 'Message',
      messagePlaceholder:
        'Posez votre question sur un décant 10ml, un flacon complet ou un pack.',
      sendBtn: 'ENVOYER LE MESSAGE',
      sentSuccess:
        'Merci. Votre message a bien été transmis à la maison — nous vous répondrons très vite.',
      validationError: 'Veuillez renseigner votre nom, un email valide et votre message.',
    },
    cart: {
      kicker: 'VOTRE SÉLECTION',
      title: (count) => `La Collection (${count})`,
      emptyTitle: 'Votre sélection est vide',
      emptySubtitle:
        'Ajoutez des décants originaux 10ml, des flacons complets ou des packs à votre sélection.',
      browseBtn: 'EXPLORER LA BOUTIQUE',
      total: 'Total',
      conciergeNote:
        'Votre commande (décants 10ml, flacons complets ou packs) est confirmée sur WhatsApp. Livraison partout au Maroc.',
      sendOrderBtn: 'ENVOYER LA COMMANDE SUR WHATSAPP',
      removeAria: 'Retirer de la sélection',
    },
    productDetail: {
      backToCollection: 'RETOUR À LA COLLECTION',
      topNotes: 'Notes de Tête',
      heartNotes: 'Notes de Cœur',
      baseNotes: 'Notes de Fond',
      longevity: 'Tenue',
      sillage: 'Sillage',
      addToCollection: 'AJOUTER À LA SÉLECTION',
      orderDirectWhatsapp: 'COMMANDER SUR WHATSAPP',
      deliveryPromise:
        '100% Original · Confirmation personnelle sur WhatsApp · Livraison partout au Maroc · Paiement à la livraison',
    },
    footer: {
      explore: 'EXPLORER',
      collections: 'FORMATS & COLLECTIONS',
      rights: '© 2026 SALIM FRAGRANCE',
    },
  },
  ar: {
    dir: 'rtl',
    nav: {
      home: 'الرئيسية',
      shop: 'المتجر',
      packs: 'الباكات وتقسيمات 10ml',
      about: 'قصتنا',
      contact: 'تواصل معنا',
      shopAll: 'جميع العطور والباكات',
      aboutUs: 'عن الدار',
    },
    formats: {
      allFormats: 'جميع الخيارات',
      fullBottle: 'عطر كامل (كومبلي)',
      fullBottleShort: 'كومبلي',
      decant10: 'تقسيمات أصلية 10ml',
      decant10Short: 'تقسيمة 10ml',
      packs: 'الباكات والعروض',
      packBadge: 'باك التوفير',
      saveAmount: (mad) => `وفّر ${mad} درهم`,
      decantSubtitle: 'تقسيمة عطر أصلية 100% في بخاخ زجاجي فاخر 10 مل (~140 رشة)',
      fullSubtitle: 'قارورة عطر كاملة أصلية مغلفة (كومبلي)',
      chooseFormat: 'اختر الصيغة المطلوبة',
      includedInPack: 'محتويات هذا الباك',
    },
    hero: {
      kicker: 'دار العطور · القصر الكبير',
      titlePart1: 'اكتشف عطرك',
      titleItalic: 'الأصلي والمميز',
      subtitle:
        'عطور أصلية 100% متوفرة كـ قوارير كاملة (كومبلي)، وتقسيمات عطور أصلية 10 مل، بالإضافة إلى باكات التوفير المختارة.',
      shopNow: 'تسوق الآن',
      explorePacks: 'تصفح الباكات',
      orderWhatsapp: 'اطلب عبر واتساب',
      statScents: 'تقسيمات 10ml وعطور كومبلي',
      statFormats: 'باكات التوفير متوفرة',
      statDelivery: 'توصيل لجميع مدن المغرب',
      bestSeller: 'الأكثر مبيعاً',
      orderNow: 'اطلب الآن',
    },
    signatureEdit: {
      kicker: 'عطور كومبلي وتقسيمات 10ml',
      titlePart1: 'عطور مختارة',
      titleItalic: 'من طرف الدار',
      subtitle:
        'اختر مباشرة على كل عطر بين تقسيمة أصلية 10 مل للتجربة والاستعمال اليومي أو القارورة الكاملة الأصلية (كومبلي).',
      viewAll: 'عرض جميع العطور',
    },
    packsSection: {
      kicker: 'عروض الباكات ومجموعات التقسيمات',
      titlePart1: 'باكات حصرية',
      titleItalic: 'وتقسيمات 10 مل',
      subtitle:
        'باكات مختارة تجمع أفضل تقسيمات العطور الأصلية 10 مل أو القوارير الكاملة (كومبلي) بأسعار تفضيلية مميزة.',
      viewAllPacks: 'عرض جميع الباكات',
    },
    collection: {
      kicker: 'المجموعة الكاملة',
      titlePart1: 'عطور كومبلي، تقسيمات 10ml',
      titleItalic: 'وباكات التوفير',
      subtitle:
        'اختر بين القوارير الكاملة الأصلية (كومبلي)، تقسيمات العطور الأصلية 10 مل، أو الباكات الجاهزة — توصيل سريع لجميع مدن المغرب.',
      all: 'الكل',
      forHim: 'للرجال',
      forHer: 'للنساء',
      unisex: 'للجنسين',
      bestSellers: 'الأكثر مبيعاً',
      searchPlaceholder: 'ابحث عن عطر، تقسيمة 10 مل، أو باك...',
      sortFeatured: 'المميزة',
      sortPriceAsc: 'السعر: من الأقل للأعلى',
      sortPriceDesc: 'السعر: من الأعلى للأقل',
      sortName: 'الترتيب الأبجدي',
      countLabel: (count) => `${count} خيارات متوفرة`,
      emptyState: 'لا توجد عطور أو باكات مطابقة لبحثك.',
      resetFilters: 'إعادة ضبط الفلاتر',
    },
    card: {
      orderViaWhatsapp: 'اطلب عبر واتساب',
      discover: 'التفاصيل والخيارات',
      addToBag: 'أضف إلى السلة',
      added: 'تمت الإضافة',
      newBadge: 'جديد',
      bestSellerBadge: 'الأكثر مبيعاً',
    },
    story: {
      kicker: 'قصتنا',
      titlePart1: 'عطور أصلية بالتقسيمة 10ml،',
      titleItalic: 'القارورة الكاملة والباك',
      p1: 'انطلقت SALIM FRAGRANCE من القصر الكبير بهدف واضح: توفير العطور الأصلية ذات الثبات العالي بكل مرونة — سواء كنت تفضل تقسيمات 10 مل أصلية لتجربة أكثر من عطر، أو قارورة كاملة (كومبلي) لعطرك المفضل.',
      p2: 'يتم تحضير كل تقسيمة 10 مل بعناية فائقة مباشرة من القارورة الأصلية داخل بخاخ زجاجي أنيق يمنحك حوالي 140 رشة، كما صممنا باكات توفير تجمع أروع الروائح للاستعمال الشخصي أو الإهداء.',
      p3: 'اليوم يثق بنا أكثر من 500 عميل في جميع أنحاء المغرب لاقتناء عطورهم الكاملة وتقسيماتهم والباكات الخاصة بهم، مع تأكيد شخصي وسريع لكل طلب عبر واتساب.',
      cta: 'تصفح العطور والباكات',
    },
    conciergeCta: {
      kicker: 'تريد باك خاص على ذوقك؟',
      titlePart1: 'أخبرنا بما تحب — وسنجهز لك',
      titleItalic: 'الباك أو العطر الأنسب',
      primaryBtn: 'تحدث معنا عبر واتساب',
      secondaryBtn: 'صفحة التواصل',
    },
    contact: {
      kicker: 'تواصل معنا',
      titlePart1: 'نجيبك',
      titleItalic: 'بشكل شخصي',
      subtitle:
        'تواصل معنا عبر واتساب لطلب تقسيمات 10 مل، عطر كومبلي، أو تركيب باك خاص يناسب ذوقك.',
      whatsappLabel: 'واتساب',
      instagramLabel: 'إنستغرام',
      formTitle: 'راسل الدار',
      nameLabel: 'الاسم',
      namePlaceholder: 'اسمك الكريم',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'you@email.com',
      messageLabel: 'الرسالة',
      messagePlaceholder:
        'استفسر عن تقسيمة 10 مل، قارورة كاملة (كومبلي)، أو باك مخصص.',
      sendBtn: 'إرسال الرسالة',
      sentSuccess: 'شكراً لك. وصلت رسالتك إلى الدار وسنجيبك قريباً جداً.',
      validationError: 'يرجى إدخال الاسم، بريد إلكتروني صحيح، ونص الرسالة.',
    },
    cart: {
      kicker: 'اختياراتك',
      title: (count) => `المجموعة المختارة (${count})`,
      emptyTitle: 'سلة الاختيارات فارغة',
      emptySubtitle:
        'أضف تقسيمات 10 مل الأصلية، القوارير الكاملة (كومبلي)، أو باكات التوفير إلى سلتك.',
      browseBtn: 'تصفح المتجر',
      total: 'المجموع',
      conciergeNote:
        'يتم تأكيد طلبك (تقسيمات 10 مل، عطور كاملة، أو باكات) شخصياً عبر واتساب. التوصيل لجميع مدن المغرب والدفع عند الاستلام.',
      sendOrderBtn: 'إرسال الطلب عبر واتساب',
      removeAria: 'حذف من السلة',
    },
    productDetail: {
      backToCollection: 'العودة إلى المجموعة',
      topNotes: 'افتتاحية العطر',
      heartNotes: 'قلب العطر',
      baseNotes: 'قاعدة العطر',
      longevity: 'الثبات',
      sillage: 'الفوحان',
      addToCollection: 'أضف إلى اختياراتك',
      orderDirectWhatsapp: 'اطلب عبر واتساب',
      deliveryPromise:
        'أصلي 100% · تأكيد شخصي عبر واتساب · توصيل سريع لجميع مدن المغرب · الدفع عند الاستلام',
    },
    footer: {
      explore: 'استكشف',
      collections: 'الأحجام والمجموعات',
      rights: '© 2026 SALIM FRAGRANCE',
    },
  },
};
