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
  productName: "",
  category: "",
  subCategory: "",
  shortDescription: "",
  normalPrice: 0,
  priceRange: "",
  quality: "",
  packaging: "",
  brand: "",
  advantages: "",
  genders: [],
  ages: [],
  maritalStatuses: [],
  educations: [],
  jobs: [],
  economicClasses: [],
  incomeRanges: [],
  locations: [],
  hobbies: "",
  shoppingBehaviors: [],
  activePlatforms: [],
  contentPreferences: [],
  buyTriggers: [],
  buyFrequency: [],
  businessType: "",
  salesChannels: [],
  paymentMethods: [],
  legalStatus: [],
  permits: [],
  foundedYear: 0,
  employeeCount: "",
  monthlyRevenueRange: "",
  startingCapitalRange: "",
  targetMonthlyRevenue: 0,
  marginRange: "",
  activeSocialMedia: [],
  activeMarketplaces: [],
  favoriteContentFormats: [],
  monthlyAdBudget: 0,
  engagementTarget: "",
  businessContact: "",
  websiteUrl: "",
  customOtherMedia: "",
  peakHours: "",
  topConvertingChannel: "",
  localCompetitorCount: "",
  biggestCompetitor: "",
  competitorStrengths: "",
  competitorWeaknesses: ""
});

export const defaultCompetitors = (): CompetitorIntel[] => [
  {
    id: "comp-1",
    name: "",
    location: "",
    averagePrice: "",
    activeChannels: [],
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
    estimatedRevenue: ""
  },
  {
    id: "comp-2",
    name: "",
    location: "",
    averagePrice: "",
    activeChannels: [],
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
    estimatedRevenue: ""
  }
];

export const defaultSegments = (): CustomerSegment[] => [
  {
    name: "Segmen Utama",
    percentage: 40,
    channel: "-",
    avgTransaction: 0,
    frequency: "-",
    risk: "Low"
  },
  {
    name: "Segmen Potensial",
    percentage: 30,
    channel: "-",
    avgTransaction: 0,
    frequency: "-",
    risk: "Medium"
  },
  {
    name: "Segmen Niche",
    percentage: 20,
    channel: "-",
    avgTransaction: 0,
    frequency: "-",
    risk: "Low"
  },
  {
    name: "Segmen Tambahan",
    percentage: 10,
    channel: "-",
    avgTransaction: 0,
    frequency: "-",
    risk: "High"
  }
];

// ── Payment & Promo Types ──

export interface PromoCode {
  id: string;
  code: string;
  influencer: string;
  type: "internal" | "partner";
  discount: number;
  discountType: "percent" | "nominal";
  commissionRate: number;
  partnerName?: string;
  partnerContact?: string;
  maxUsage: number;
  currentUsage: number;
  totalRevenue: number;
  totalPartnerPayout: number;
  expiresAt?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface PartnerPayout {
  id: string;
  partnerName: string;
  partnerContact: string;
  promoCode: string;
  amount: number;
  status: "pending" | "paid" | "processing";
  paidAt?: string;
  paidBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  originalAmount: number;
  promoCode?: string;
  discount?: number;
  status: "pending" | "paid" | "expired" | "failed";
  xenditInvoiceId: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro";
  planExpiresAt?: string;
  promoCodesUsed: string[];
  createdAt: string;
  updatedAt: string;
}
