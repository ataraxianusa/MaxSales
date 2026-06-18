/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppTab = 'dashboard' | 'branding' | 'strategy' | 'crm' | 'competitor' | 'branches';

export interface MarketingAsset {
  id: string;
  productName: string;
  persona: string;
  targetMarket: string;
  mediaSpecs: string;
  title: string;
  copy: string;
  ctaText: string;
  type: 'image' | 'video' | 'copy' | 'social-post';
  styleTheme: {
    bgGradient: string;
    primaryColor: string;
    accentColor: string;
    textStyle: string;
  };
  timestamp: string;
  version: number;
}

export interface BlueprintRow {
  channel: string;
  targetAudience: string;
  message: string;
  kpi: string;
  cta: string;
  details?: string;
  isExpanded?: boolean;
}

export interface RecommendationStrategy {
  id: string;
  businessName: string;
  industry: string;
  painPoints: string[];
  funnelSteps: { id: string; label: string; active: boolean; details: string }[];
  budget: number;
  timeline: string;
  blueprint: BlueprintRow[];
  budgetAllocation: { name: string; value: number; color: string }[];
  aiReasoning: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Lead' | 'Qualified' | 'Won' | 'Lost' | 'Customer' | 'Churn Risk';
  lastInteraction: string;
  score: number;
  scoreExplanation: string;
  segment: string;
  tags: string[];
  notes: string;
  activityHistory: { date: string; title: string; desc: string; type: string }[];
  scoreHistory?: number[];
}

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  label: string;
  color: string;
  config: Record<string, any>;
  icon: string;
}

export interface CompetitorData {
  id: string;
  name: string;
  url: string;
  channelMix: { name: string; spend: number; color: string }[];
  pricingSnapshot: { tier: string; price: string }[];
  metrics: { engagementRate: string; adSpendEst: string; likesTrend: number[] };
  socialAdSamples: { headline: string; channels: string[]; copy: string; imgPrompt: string }[];
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  sales: number;
  leads: number;
  usageCount: number;
  status: 'excellent' | 'warning' | 'critical';
  coords: { x: number; y: number }; // Percentage coords on mock display map
  customSettings: {
    syncWithHQ: boolean;
    localPromosEnabled: boolean;
  };
}

export interface UnifiedChatSession {
  role: 'user' | 'model';
  parts: string;
}
