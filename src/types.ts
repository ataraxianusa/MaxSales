export interface BusinessCanvasData {
  // Sub-Tab 1: Produk & Spesifikasi
  productName: string;
  category: string;
  subCategory: string;
  shortDescription: string;
  normalPrice: number;
  priceRange: string;
  quality: string;
  packaging: string;
  brand: string;
  advantages: string;
  logoUrl?: string;
  productImages?: string[];

  // Sub-Tab 2: Target Market
  genders: string[];
  ages: string[];
  maritalStatuses: string[];
  educations: string[];
  jobs: string[];
  economicClasses: string[];
  incomeRanges: string[];
  locations: string[];
  hobbies: string;
  shoppingBehaviors: string[];
  activePlatforms: string[];
  contentPreferences: string[];
  buyTriggers: string[];
  buyFrequency: string[];

  // Sub-Tab 3: Pola Bisnis
  businessType: string;
  salesChannels: string[];
  paymentMethods: string[];
  legalStatus: string[];
  permits: string[];
  foundedYear: number;
  employeeCount: string;
  monthlyRevenueRange: string;
  startingCapitalRange: string;
  targetMonthlyRevenue: number;
  marginRange: string;

  // Sub-Tab 4: Media & Channel
  activeSocialMedia: string[];
  activeMarketplaces: string[];
  favoriteContentFormats: string[];
  monthlyAdBudget: number;
  engagementTarget: string;
  businessContact: string;
  websiteUrl: string;
  customOtherMedia: string;

  // Sub-Tab 6: Performa Real-Time
  peakHours: string;
  topConvertingChannel: string;

  // Sub-Tab 5: Kompetitor Ringkasan
  localCompetitorCount: string;
  biggestCompetitor: string;
  competitorStrengths: string;
  competitorWeaknesses: string;
}

export interface CompetitorIntel {
  id: string;
  name: string;
  location: string;
  averagePrice: string;
  activeChannels: string[];
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
  estimatedRevenue: string;
}

export interface CustomerSegment {
  name: string;
  percentage: number;
  channel: string;
  avgTransaction: number;
  frequency: string;
  risk: 'Low' | 'Medium' | 'High';
}

export interface StrategyArea {
  areaName: string;
  title: string;
  description: string;
  actionSteps: string[];
}

export interface GeneratedContentText {
  headline: string;
  subheadline: string;
  priceDisplay: string;
  promoDisplay: string;
  ctaText: string;
  urgencyText: string;
  caption: string;
  hashtags: string[];
  watermark: string;
}

export interface DailyPulseData {
  date: string;
  leadsCount: number;
  competitorUpdates: string;
  salesPercentage: number;
  morningBriefing: string;
  actionItems: { id: string; text: string; done: boolean; category: string }[];
}

export interface StrategyOutput {
  pillars: StrategyArea[];
  synopsis: string;
}

export interface DailyPulseRecord {
  date: string;
  briefing: string;
  completedCount: number;
  pendingItems: string[];
  activeStrategies: string[];
  streakCount: number;
  yesterdayRevenue: number;
  todayTarget: number;
  dailyAchievement: number;
}

export interface FeedbackLog {
  promptType: "strategy" | "pulse" | "content";
  responseId: string;
  vote: "useful" | "not";
  timestamp: string;
}

// Initial default data for Demo/Onboarding
export const defaultCanvasData = (): BusinessCanvasData => ({
  productName: "Gamis Premium Sutra El-Zahra",
  category: "Fashion",
  subCategory: "Busana Muslimah",
  shortDescription: "Gamis elegan premium dengan bahan sutra asli yang flowy, adem, dan cocok untuk muslimah modern.",
  normalPrice: 399000,
  priceRange: "300-500rb",
  quality: "Premium",
  packaging: "Kardus mewah + tissue wrap + kartu garansi",
  brand: "El-Zahra Boutique",
  advantages: "Bahan sutra premium import, jahitan double-stitch super rapi, motif eksklusif tidak pasaran, adem dan jatuh.",
  genders: ["Perempuan"],
  ages: ["Dewasa Muda (18-25)", "Dewasa (26-35)"],
  maritalStatuses: ["Belum Menikah", "Menikah"],
  educations: ["SMA/SMK", "S1"],
  jobs: ["Karyawan Swasta", "Wiraswasta", "Ibu Rumah Tangga", "Freelancer"],
  economicClasses: ["Sejahtera", "Mampu"],
  incomeRanges: ["3-5jt", "5-10jt"],
  locations: ["Kota Besar", "Metropolitan"],
  hobbies: "Fashion, Arisan, Pengajian Modern, Kuliner, Traveling",
  shoppingBehaviors: ["Online shopping", "COD", "Impulse Buyer"],
  activePlatforms: ["Instagram", "TikTok", "WhatsApp"],
  contentPreferences: ["Video Pendek", "Carousel", "Testimoni"],
  buyTriggers: ["Kualitas", "Rekomendasi", "Diskon"],
  buyFrequency: ["2-3x/Bulan", "Bulanan"],
  businessType: "Campuran",
  salesChannels: ["Online Store", "Social Media", "Reseller"],
  paymentMethods: ["COD", "Transfer", "E-Wallet"],
  legalStatus: ["UMKM", "Perseorangan"],
  permits: ["NIB", "Halal MUI"],
  foundedYear: 2024,
  employeeCount: "1-5",
  monthlyRevenueRange: "10-25jt",
  startingCapitalRange: "10-25jt",
  targetMonthlyRevenue: 50000000,
  marginRange: "30-50%",
  activeSocialMedia: ["Instagram", "TikTok", "WhatsApp"],
  activeMarketplaces: ["Shopee", "Tokopedia"],
  favoriteContentFormats: ["Reels", "Stories", "Carousel"],
  monthlyAdBudget: 1500000,
  engagementTarget: "Conversion",
  businessContact: "08123456789 (Admin Rania)",
  websiteUrl: "www.elzahramuslimah.com",
  customOtherMedia: "Brosur PDF di grup WA premium",
  peakHours: "09:00-11:00 & 19:00-21:00",
  topConvertingChannel: "WhatsApp DM",
  localCompetitorCount: "3-5",
  biggestCompetitor: "Zahra Muslimah Store",
  competitorStrengths: "Harga sedikit lebih murah, stok barang fisik sangat banyak di toko utama.",
  competitorWeaknesses: "Sistem packaging sangat sederhana (kresek hitam), kurang aktif promosi online dan reels."
});

export const defaultCompetitors = (): CompetitorIntel[] => [
  {
    id: "comp-1",
    name: "Zahra Muslimah Store",
    location: "Kawasan Niaga Ps. Baru",
    averagePrice: "Rp 250.000 - Rp 350.000",
    activeChannels: ["Instagram", "Toko Fisik"],
    strengths: "Memiliki keunggulan harga murah, lokasi grosir fisik strategis, dan modal besar untuk tumpukan stok.",
    weaknesses: "Keamanan kemasan rendah (plastik biasa), tidak aktif mendatangkan audiens digital, pelayanan admin lambat.",
    opportunities: "Kita bisa merebut pasar mereka dengan menawarkan packaging box premium dan instant delivery lewat media sosial.",
    threats: "Mereka mendadak melakukan banting harga besar-besaran untuk menghabiskan stok lama mereka.",
    estimatedRevenue: "50-100jt"
  },
  {
    id: "comp-2",
    name: "Syar'i Chic Mall",
    location: "Atrium Plaza Modern",
    averagePrice: "Rp 500.000 - Rp 800.000",
    activeChannels: ["Instagram", "TikTok Live", "Shopee Mall"],
    strengths: "Branding sudah sangat kuat, punya model terkenal, aktif live streaming 12 jam sehari.",
    weaknesses: "Harga sangat tinggi sehingga kurang terjangkau untuk pasar pembeli impulsif menengah ke bawah.",
    opportunities: "Menawarkan gamis kualitas setara premium dengan harga 30% lebih terjangkau lewat penetrasi iklan mikro.",
    threats: "Mereka membuat lini produk sekunder/hijrah series ekonomis yang langsung menarget segmen harga kita.",
    estimatedRevenue: "> 100jt"
  }
];

export const defaultSegments = (): CustomerSegment[] => [
  {
    name: "Ibu Muda Urban (Modern Hijabers)",
    percentage: 35,
    channel: "Instagram DM & WA Chat",
    avgTransaction: 399000,
    frequency: "2.3x / bulan",
    risk: "Low"
  },
  {
    name: "Mahasiswi Trendi (Impulse Buyer)",
    percentage: 28,
    channel: "TikTok Shop & COD",
    avgTransaction: 320000,
    frequency: "1.5x / bulan",
    risk: "Medium"
  },
  {
    name: "Keluarga Modis (Corporate/PNS moms)",
    percentage: 22,
    channel: "Shopee & Website",
    avgTransaction: 798000,
    frequency: "1x / bulan",
    risk: "Low"
  },
  {
    name: "Reseller Arisan Regional",
    percentage: 15,
    channel: "WhatsApp Groups",
    avgTransaction: 1500000,
    frequency: "0.8x / bulan",
    risk: "High"
  }
];
