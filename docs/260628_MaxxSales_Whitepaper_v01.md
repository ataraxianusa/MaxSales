# MaxxSales — AI-Powered Sales Growth Operating System
## Whitepaper untuk Tim Sales & Operasional

**Versi Dokumen:** v01  
**Tanggal Rilis:** 28 Juni 2026  
**Target Audience:** Tim Sales, Tim Operasional, Partner Distribusi  
**Status:** Experiment Phase (MVP v1.2)  

---

## Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Overview Produk](#overview-produk)
3. [6 Modul Intinya](#6-modul-intinya)
4. [Arsitektur AI 3-Chain](#arsitektur-ai-3-chain)
5. [DNA Business Canvas](#dna-business-canvas)
6. [Stack Teknologi](#stack-teknologi)
7. [Model Pricing & Revenue](#model-pricing--revenue)
8. [Target Audience](#target-audience)
9. [Keunggulan Kompetitif](#keunggulan-kompetitif)
10. [Strategi Deployment](#strategi-deployment)
11. [Roadmap Pengembangan](#roadmap-pengembangan)
12. [Terminologi & Kebijakan](#terminologi--kebijakan)
13. [API Endpoints](#api-endpoints)
14. [Kontak & Support](#kontak--support)

---

## Ringkasan Eksekutif

**MaxxSales** adalah **Sistem Operasi Pertumbuhan Bisnis** berbasis AI pertama di Indonesia yang dirancang khusus untuk **Pengusaha**. Platform ini mentransformasikan data bisnis mentah menjadi **strategi taktis harian** yang siap dieksekusi, dengan integrasi penuh antara **intelijen kompetitor, wawasan pelanggan, dan generasi konten otomatis**.

### Value Proposition Utama

- **✅ Satu Platform, Semua Kebutuhan Sales**: Dari analisis pasar hingga eksekusi harian
- **✅ AI yang Memahami Bisnis Anda**: Sistem belajar dari DNA Business Canvas untuk memberikan rekomendasi yang personal
- **✅ Eksekusi, Bukan Teori**: Setiap output dirancang untuk tindakan langsung, bukan analisis yang bertele-tele
- **✅ Siap Pakai dalam 5 Menit**: Tidak memerlukan keahlian teknis

### KPI Utama (Target MVP)

| Metrik | Target | Status |
|--------|--------|--------|
| User Onboarding | 100+ pengusaha | 📈 In Progress |
| Retention Rate | 70%+ (30 hari) | 🎯 On Track |
| Revenue/User | Rp 299,000 (lifetime) | ✅ Achieved |
| AI Response Time | < 5 detik | ✅ Achieved |

---

## Overview Produk

### Definisi Produk

MaxxSales adalah **AI-Powered Business Growth OS** yang menggabungkan:
1. **8 API Endpoint** (server.ts) / **11 API Endpoint** (worker.ts) dengan arsitektur 3-chain prompt pipeline
2. **React 19 Dashboard** dengan 6 modul inti + modul pendukung
3. **Dual-Backend Architecture** (Express.js untuk development, Cloudflare Workers + Hono untuk production)

### Arsitektur High-Level

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19 + TS)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Landing    │  │   Login     │  │  Dashboard  │           │
│  │   Page      │  │   Gate      │  │   (6 Core   │           │
│  └─────────────┘  └─────────────┘  │   Modules)   │           │
│                                       └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Dual Architecture)                  │
│                                                          │
│  ┌─────────────────┐         ┌─────────────────┐          │
│  │  Express.js      │         │  Cloudflare      │          │
│  │  (Development)   │◄───────►│  Workers + Hono  │          │
│  │  server.ts:3000  │         │  worker.ts      │          │
│  └─────────────────┘         └─────────────────┘          │
│                              │                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI PROVIDER                                  │
│  ┌─────────────────┐                                          │
│  │  OpenRouter API │  (Default: openai/gpt-oss-120b:free)      │
│  └─────────────────┘                                          │
│   - 3-chain tactical briefing                                  │
│   - Dynamic Temperature per chain (0.2 / 0.35 / 0.7)          │
│   - Fallback simulator untuk offline mode                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 6 Modul Intinya

### 📊 1. Daily Sales Pulse (Tactical Briefing)

**Deskripsi:** Briefing harian yang dihasilkan AI menggunakan 3-chain prompt pipeline untuk memberikan strategi siap eksekusi.

**Fitur Utama:**
- 3-chain architecture: GapAnalyzer → ExecutionPlan → CommsWriter
- Template WhatsApp & Social Media siap copy-paste
- Revenue tracking dengan bar charts
- Competitor radar visualization
- Dynamic checklist harian

**Output Contoh:**
```markdown
### 1. 🎯 Celah Bisnis Hari Ini
Kompetitor utama memiliki kelemahan di [area tertentu], potensi omzet Rp X/bulan

### 2. ⚡ Langkah Eksekusi Strategis
1. **Cek** [tindakan spesifik]
2. **Hubungi** [target spesifik]
3. **Foto** [konten yang diperlukan]

### 3. 💬 Amunisi Komunikasi (Siap Pakai)
**Template WhatsApp:** [copy-paste ready]
**Copywriting Media Sosial:** [caption + hashtags]
```

**Technology Stack:**
- React 19 + TypeScript + Recharts
- Motion untuk animasi
- Tailwind CSS v4 untuk styling

---

### 🎯 2. Competitor War Room

**Deskripsi:** Modul intelijen kompetitor dengan analisis SWOT otomatis dan perbandingan head-to-head.

**Fitur Utama:**
- Add/Manage competitor profiles
- AI-powered SWOT analysis
- Radar charts untuk perbandingan kompetitor
- Identifikasi ancaman pasar (topMarketThreat)
- Peluang tak tergarap (untappedOpportunity)

**Data Structure:**
```typescript
interface CompetitorIntel {
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
```

---

### 👥 3. Customer Insight

**Deskripsi:** Analisis pelanggan dengan segmentasi psikografis dan prediksi LTV.

**Fitur Utama:**
- 4 customer segments dengan kalkulator Lifetime Value
- Churn risk analysis (Low/Medium/High)
- AI-generated retention recommendations
- Avg transaction value tracking
- Frequency & behavior analysis

**Segment Data:**
```typescript
interface CustomerSegment {
  name: string;
  percentage: number;
  channel: string;
  avgTransaction: number;
  frequency: string;
  risk: 'Low' | 'Medium' | 'High';
}
```

---

### 📈 4. Strategy Forge

**Deskripsi:** Generator blueprint strategi pemasaran multi-pillar berbasis DNA Business Canvas.

**Fitur Utama:**
- 5–11 pilar strategi promosi
- 3 tingkatan optimisme: Konservatif / Moderat / Agresif
- AI-generated strategy blueprint
- Actionable steps untuk setiap pilar
- Channel-specific recommendations

**Optimism Levels:**
| Level | Deskripsi | Jmlah Pilar |
|-------|-----------|-------------|
| Konservatif | Strategi aman, terukur | 5–7 pilar |
| Moderat | Balance antara risiko & reward | 7–9 pilar |
| Agresif | Strategi disruptif, pertumbuhan cepat | 9–11 pilar |

---

### ✨ 5. Content Generator

**Deskripsi:** Generator konten promosi otomatis untuk berbagai platform.

**Fitur Utama:**
- Headlines & subheadlines
- Price displays & promo text
- Hashtag recommendations
- Platform-specific formatting (IG, WA, Story)
- Urgency text generation

**Output Format:**
```typescript
interface GeneratedContentText {
  headline: string;
  subheadline: string;
  priceDisplay: string;
  promoDisplay: string;
  ctaText: string;
  hashtags: string[];
}
```

---

### 💬 6. Floating AI Chatbot

**Deskripsi:** AI copilot yang kontekstual dan memahami DNA bisnis pengguna.

**Fitur Utama:**
- Context-aware responses
- Answers questions about all features
- Uses stored Business DNA for personalized advice
- Floating UI untuk akses mudah
- Instant strategy suggestions

**Capabilities:**
- Menjawab pertanyaan tentang fitur-fitur
- Memberikan saran strategi instan
- Memahami konteks bisnis pengguna
- Siap pakai 24/7

---

## Arsitektur AI 3-Chain

### Overview

MaxxSales menggunakan **3-chain sequential prompt pipeline** dengan **Dynamic Temperature** per chain — GapAnalyzer (0.2) untuk analisis JSON yang konsisten, ExecutionPlan (0.35) untuk instruksi dengan variasi kata kerja, dan CommsWriter (0.7) untuk copywriting natural.

### Chain Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    3-CHAIN PROMPT PIPELINE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CHAIN 1: GapAnalyzer                                           │
│  ├─ Temperature: 0.2                                           │
│  ├─ Max Tokens: 256                                           │
│  ├─ Input: DNA + WarRoom + CustomerInsight + DailyContext    │
│  └─ Output: JSON { gap, revenueImpact, urgency }              │
│                                                              │
│  CHAIN 2: ExecutionPlan                                        │
│  ├─ Temperature: 0.35                                          │
│  ├─ Max Tokens: 256                                           │
│  ├─ Input: Gap + PeakHours + TopConvertingChannel             │
│  └─ Output: JSON { steps[], quickWin, expectedOutcome }      │
│                                                              │
│  CHAIN 3: CommsWriter                                          │
│  ├─ Temperature: 0.7                                           │
│  ├─ Max Tokens: 512                                           │
│  ├─ Input: Gap + Plan + Brand + Contact                       │
│  └─ Output: Markdown (3 sections: Celah + Eksekusi + Amunisi)│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### System Prompts

Setiap chain memiliki **system prompt** yang ketat untuk memastikan output berkualitas:

1. **GapAnalyzer**: "Anda adalah Analis Bisnis Tajam untuk Pengusaha"
2. **ExecutionPlan**: "Anda adalah Pelatih Bisnis Lapangan untuk Pengusaha"
3. **CommsWriter**: "Anda adalah Penulis Konten Bisnis untuk Pengusaha"

### Key Principles

- **No Theory, Only Execution**: Setiap output harus actionable
- **Action-Oriented Language**: Setiap langkah dimulai dengan kata kerja aktif
- **Revenue-Focused**: Setiap analisis menghitung dampak ke omset
- **Indonesian-Specific**: Menggunakan bahasa dan konteks lokal

### Fallback Mechanism

Ketika OpenRouter API tidak tersedia, sistem otomatis menggunakan **smart local simulator** dengan output yang仍然 berkualitas.

---

## DNA Business Canvas

### Overview

DNA Business Canvas adalah **6-tab business profile wizard** yang harus diisi pengguna untuk membuka semua fitur AI. Data ini menjadi fondasi untuk semua analisis dan rekomendasi.

### 6 Tabs DNA Canvas

| # | Tab | Fields | Purpose |
|---|-----|--------|---------|
| 1 | **Produk & Spesifikasi** | 16 | Product identity & specifications |
| 2 | **Target Market** | 14 | Customer demographics & behavior |
| 3 | **Pola & Finansial** | 13 | Business type & financial data |
| 4 | **Media & Channel** | 10 | Digital presence & marketing |
| 5 | **Performa Real-Time** ⭐ | 2 | Operational performance data |
| 6 | **Kompetitor** | 4 | Competitive landscape |

### Data Structure (59 Fields Total)

```typescript
interface BusinessCanvasData {
  // Tab 1: Product & Specification
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
  
  // Tab 2: Target Market
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
  
  // Tab 3: Business Pattern
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
  
  // Tab 4: Media & Channel
  activeSocialMedia: string[];
  activeMarketplaces: string[];
  favoriteContentFormats: string[];
  monthlyAdBudget: number;
  engagementTarget: string;
  businessContact: string;
  websiteUrl: string;
  customOtherMedia: string;
  
  // Tab 5: Real-Time Performance ⭐
  peakHours: string;           // e.g., "09:00-11:00 & 19:00-21:00"
  topConvertingChannel: string; // e.g., "WhatsApp DM"
  
  // Tab 6: Competitor Summary
  localCompetitorCount: string;
  biggestCompetitor: string;
  competitorStrengths: string;
  competitorWeaknesses: string;
}
```

### Why DNA Canvas Matters

1. **Personalization**: Semua rekomendasi AI berbasis data bisnis yang sebenarnya
2. **Accuracy**: Analisis kompetitor & pelanggan menjadi lebih relevan
3. **Consistency**: Strategi yang dihasilkan selalu aligned dengan bisnis
4. **Growth Tracking**: Data performa real-time membantu pengambilan keputusan

---

## Stack Teknologi

### Frontend Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 19 | Modern web application |
| **Language** | TypeScript 5.8 | Type safety & developer experience |
| **Styling** | Tailwind CSS v4 | Utility-first styling |
| **Animation** | Motion | Smooth transitions & micro-interactions |
| **Charts** | Recharts | Data visualization |
| **Icons** | Lucide React | Consistent icon system |
| **Build Tool** | Vite 6 | Fast development & HMR |

### Backend Stack (Development)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Express.js | REST API server |
| **Runtime** | Node.js | JavaScript runtime |
| **Dev Runner** | `tsx` | TypeScript execution |
| **Bundler** | `esbuild` | Production bundle |

### Backend Stack (Production)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Platform** | Cloudflare Workers | Edge computing |
| **Framework** | Hono | Lightweight web framework |
| **AI Provider** | OpenRouter API | Multi-model AI access |

### AI Configuration

```typescript
// Default AI Settings
const AI_CONFIG = {
  provider: "OpenRouter",
  model: "openai/gpt-oss-120b:free",
  temperature: 0.7,   // Dynamic: GapAnalyzer=0.2, ExecutionPlan=0.35, CommsWriter=0.7
  maxTokens: {
    gapAnalyzer: 256,
    executionPlan: 256,
    commsWriter: 512
  },
  fallback: "local-simulator"  // Graceful degradation
};
```

### Deployment Infrastructure

| Environment | Platform | URL |
|-------------|----------|-----|
| Development | Local | http://localhost:3000 |
| Production | GitHub Pages | https://maxsales.qzz.io |
| AI Backend | Cloudflare Workers | [worker URL] |

### CI/CD Pipeline

- **GitHub Actions** → **GitHub Pages** (auto-deploy on `main` push)
- **Custom Domain**: `maxsales.qzz.io` (CNAME)
- **Environment Variables**: `VITE_API_URL`, `OPENROUTER_API_KEY`

---

## Model Pricing & Revenue

### Pricing Structure

**Current Model:** One-time lifetime access

| Plan | Price | Features | Status |
|------|-------|----------|--------|
| **Paket Founder** | **Rp 299,000** | Full access to all features | ✅ Available |
| Harga Normal | ~~Rp 499,000~~ | - | ❌ Strikethrough |

### Discount & Urgency

- **40% Discount**: Early adopter pricing
- **Limited Time**: Countdown timer (5:47:12 on landing page)
- **47 Users**: Already joined this week
- **Rating**: ⭐⭐⭐⭐⭐ 4.9/5

### Payment Methods

10+ Metode Pembayaran yang didukung:

- **QRIS** (Quick Response Indonesian Standard)
- **E-Wallet**: GoPay, OVO, DANA
- **Virtual Account**: Various banks
- **Credit Card**: Visa, MasterCard
- **Retail Outlets**: Alfamart, Indomaret

### Revenue Model Analysis

| Metric | Value | Notes |
|--------|-------|-------|
| Price Point | Rp 299,000 | Competitive for Indonesian market |
| Target Users | 100+ | MVP phase target |
| Estimated Revenue | Rp 29,900,000 | At 100 users |
| Model | Lifetime Access | No subscription, no hidden fees |

### Competitive Pricing Comparison

| Competitor | Price | Features | Our Advantage |
|------------|-------|----------|---------------|
| Tool A | Rp 500,000+/mo | Basic analytics | 40% cheaper, lifetime access |
| Tool B | Rp 350,000/mo | Limited features | More features, one-time payment |
| Tool C | Free | Basic features | Advanced AI, professional support |

---

## Target Audience

### Primary Audience: Pengusaha Indonesia

**Definition:**
- **Who**: Pemilik bisnis mikro, kecil, dan menengah di Indonesia
- **Business Size**: 1–50 karyawan
- **Revenue Range**: Rp 10M – Rp 500M/bulan
- **Digital Maturity**: Sedang berkembang (using WhatsApp, social media)

### Audience Segmentation

| Segment | Percentage | Characteristics |
|---------|------------|----------------|
| **Starter** | 40% | New businesses, <1 year old |
| **Growth** | 35% | Established, looking to scale |
| **Mature** | 25% | Stable, optimization focus |

### Industry Focus

**Priority Industries:**
1. **F&B (Food & Beverage)**: Warung, katering, produk makanan
2. **Fashion**: Baju, aksesoris, sepatu
3. **Retail**: Toko kelontong, minimarket
4. **Jasa**: Service-based businesses
5. **Handmade/Craft**: Kerajinan, produk lokal

### Pain Points yang Dipecahkan

1. **Lack of Strategy**: Tidak punya strategi pemasaran yang jelas
2. **Competitor Pressure**: Kesulitan bersaing dengan kompetitor
3. **Content Creation**: Sulit membuat konten promosi yang menarik
4. **Customer Retention**: Kesulitan mempertahankan pelanggan
5. **Time Management**: Terlalu sibuk dengan operasional harian

### User Persona

**Persona: Pak Budi (45, Pemilik Warung Makan)**
- **Goals**: Meningkatkan omset 30% dalam 3 bulan
- **Challenges**: Tidak punya waktu untuk analisis kompetitor
- **Tech Usage**: WhatsApp, Instagram, Facebook
- **Success Metric**: Lebih banyak pelanggan, omset naik

---

## Keunggulan Kompetitif

### Unique Selling Propositions (USPs)

| # | USP | Description | Impact |
|---|-----|-------------|--------|
| 1 | **AI-Powered Tactical Briefing** | 3-chain AI memberikan strategi siap eksekusi harian | ✅ Game-changer |
| 2 | **DNA Business Canvas** | Personalisasi penuh berdasarkan data bisnis pengguna | ✅ Differentiator |
| 3 | **Indonesian-Specific** | Bahasa, konteks, dan kultur Indonesia | ✅ Market fit |
| 4 | **Action-Oriented** | Setiap output dirancang untuk tindakan, bukan teori | ✅ Practical |
| 5 | **5-Minute Setup** | Siap pakai tanpa keahlian teknis | ✅ Accessibility |
| 6 | **Lifetime Access** | Pembayaran sekali, tidak ada biaya tersembunyi | ✅ Value |

### Competitive Matrix

```
MaxxSales vs Competitors
├─────────────────────────────────────────────────────────────┤
│ Feature                  │ MaxxSales │ Competitor A │ Competitor B │
├─────────────────────────────────────────────────────────────┤
│ AI Tactical Briefing     │ ✅        │ ❌          │ ❌          │
│ DNA Personalization      │ ✅        │ ❌          │ ❌          │
│ Competitor Intelligence  │ ✅        │ ✅          │ ❌          │
│ Customer LTV Analysis    │ ✅        │ ❌          │ ❌          │
│ Content Generator        │ ✅        │ ✅          │ ✅          │
│ Indonesian Context       │ ✅        │ ❌          │ ❌          │
│ 5-Minute Setup           │ ✅        │ ❌          │ ❌          │
│ Lifetime Access          │ ✅        │ ❌          │ ❌          │
│ Affordable Pricing       │ ✅        │ ❌          │ ❌          │
└─────────────────────────────────────────────────────────────┘
```

### SWOT Analysis

**Strengths:**
- AI architecture yang canggih (3-chain)
- Personalisasi berdasarkan DNA Business Canvas
- Interface yang user-friendly
- Harga kompetitif
- Lifetime access model

**Weaknesses:**
- Masih dalam fase experiment (MVP v1.2)
- Brand awareness yang terbatas
- Tim yang kecil
- Fitur-fitur advanced masih dalam pengembangan

**Opportunities:**
- Pasar digital marketing di Indonesia yang besar
- Minimnya kompetitor dengan AI integration
- Tren adopsi AI di kalangan UMKM
- Potensi partnership dengan platform e-commerce

**Threats:**
- Kompetitor asing yang masuk ke Indonesia
- Perubahan regulasi AI
- Ketergantungan pada AI provider (OpenRouter)
- Resistensi pengguna terhadap teknologi baru

---

## Strategi Deployment

### Current Deployment Status

| Component | Status | Platform | URL |
|-----------|--------|----------|-----|
| Frontend | ✅ Deployed | GitHub Pages | https://maxsales.qzz.io |
| AI Backend | ✅ Ready | Cloudflare Workers | [worker URL] |
| Database | ❌ Not yet | - | - |

### Deployment Options

#### Option 1: GitHub Pages (Frontend Only)
**Status:** ✅ Currently Active

**Steps:**
```bash
# Auto-deploy on push to main
# Requires VITE_API_URL secret for AI features
```

**Pros:**
- Gratis
- Otomatis deploy
- SSL otomatis

**Cons:**
- AI backend harus terpisah
- Limited custom domain options

#### Option 2: Cloudflare Workers (Full Stack)
**Status:** ✅ Ready for Deployment

**Steps:**
```bash
# Set OpenRouter API key
npx wrangler secret put OPENROUTER_API_KEY

# Deploy
npx wrangler deploy
```

**Pros:**
- Edge computing (low latency)
- Serverless (no server management)
- Scalable

**Cons:**
- Requires Cloudflare account
- Limited free tier

#### Option 3: Full-Stack Node.js Server
**Status:** ✅ Ready for Deployment

**Platform Options:**
- Railway
- Render
- Fly.io
- VPS (DigitalOcean, Linode, etc.)

**Steps:**
```bash
npm run build
npm start  # Express server at PORT (default 3000)
```

**Pros:**
- Full control
- Easy to customize
- Multiple hosting options

**Cons:**
- Requires server management
- Higher costs

### Azure Migration Plan (Future)

MaxxSales sedang dalam proses migrasi ke **Microsoft Azure** untuk infrastruktur yang lebih robust.

**Target Architecture:**
- **Frontend**: Azure Static Web Apps
- **Backend**: Azure Functions
- **Database**: Cosmos DB
- **AI**: Azure OpenAI Service
- **CDN**: Azure Front Door
- **API Management**: Azure API Management

**Timeline:** 12 weeks (Fase 0: Pre-migration sudah selesai)

**Budget Estimate:** $43–64/month

**See:** `docs/migrasi/` untuk dokumentasi lengkap migrasi Azure

---

## Roadmap Pengembangan

### Phase 1: MVP Stabilization (Q2 2026) ✅ Current

- [x] Core 6 modules implementation
- [x] 3-chain AI architecture
- [x] DNA Business Canvas
- [x] React 19 + Tailwind v4 UI
- [x] Dual-backend (Express + Cloudflare)
- [x] GitHub Pages deployment
- [x] Pricing page & payment integration
- [ ] User feedback collection
- [ ] Bug fixes & performance optimization
- [ ] Documentation completion

### Phase 2: Growth Features (Q3 2026)

- [ ] Multi-user accounts (team collaboration)
- [ ] Advanced analytics dashboard
- [ ] Automated social media posting
- [ ] WhatsApp Business API integration
- [ ] E-commerce platform integrations
- [ ] Mobile app (React Native)
- [ ] Subscription model (optional)
- [ ] Partner/affiliate program

### Phase 3: Scale & Expansion (Q4 2026)

- [ ] Enterprise features (multiple businesses)
- [ ] AI model fine-tuning
- [ ] Advanced reporting
- [ ] API for third-party integrations
- [ ] White-label solution
- [ ] International expansion
- [ ] Premium support options

### Phase 4: AI Enhancement (2027)

- [ ] Voice-based interface
- [ ] Video content generation
- [ ] Predictive analytics
- [ ] Automated ad optimization
- [ ] Chatbot for customer service
- [ ] Market trend prediction

---

## Terminologi & Kebijakan

### Terminology Policy (HARD RULE)

**❌ DILARANG:**
- UMKM
- UKM
- Usaha Kecil
- Mikro
- Segala istilah yang mengerdilkan bisnis

**✅ DIPERBOLEHKAN:**
- Pengusaha
- Pelaku Usaha
- Bisnis Anda
- Nama brand langsung
- Pelanggan
- Konsumen

### Implementation Scope

Terminology policy berlaku di:
- `server.ts` (Express backend)
- `worker.ts` (Cloudflare Workers backend)
- `src/tactical-briefing.ts` (3-chain module)
- Semua UI components
- Dokumentasi ini

### Rationale

Kebijakan ini dibuat untuk:
1. **Respect**: Menghormati pengusaha sebagai profesional
2. **Professionalism**: Mencerminkan image yang profesional
3. **Market Positioning**: Menempatkan MaxxSales sebagai solusi premium
4. **Consistency**: Memastikan branding yang konsisten

---

## API Endpoints

### Overview

MaxxSales menyediakan **8 API endpoints** di Express.js (development) dan **11 API endpoints** di Cloudflare Workers (production).

### Endpoint Inventory

| # | Method | Endpoint | AI Calls | Description | Status |
|---|--------|----------|----------|-------------|--------|
| 1 | `GET` | `/api/status` | 0 | Health check + AI mode status | ✅ Active |
| 2 | `POST` | `/api/generate-content-text` | 1 | Generate promo content (headlines, captions, hashtags) | ✅ Active |
| 3 | `POST` | `/api/strategy-forge` | 1 | Generate 5–11 pillar strategy blueprint | ✅ Active |
| 4 | `POST` | `/api/daily-pulse` | 1 | Morning briefing (legacy — replaced by tactical-briefing) | ⚠️ Legacy |
| 5 | `POST` | `/api/analyze-competitor` | 1 | SWOT analysis for a specific competitor | ✅ Active |
| 6 | `POST` | `/api/analyze-segments` | 1 | AI-powered customer segment analysis with LTV & churn risk | ✅ Active |
| 7 | `POST` | `/api/chat` | 1 | Conversational AI copilot (context-aware with Business DNA) | ✅ Active |
| 8 | `POST` | `/api/tactical-briefing` | **3 (chain)** | ⭐ 3-chain tactical briefing: GapAnalyzer → ExecutionPlan → CommsWriter | ✅ Active |

### API Configuration

**Base URL:**
- Development: `http://localhost:3000`
- Production: [Cloudflare Worker URL]

**Headers:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": `Bearer ${OPENROUTER_API_KEY}` // Optional
}
```

### Example Request/Response

**Request:** `/api/tactical-briefing`
```json
{
  "dna": {
    "brand": "MaxxSales",
    "productName": "AI Growth OS",
    "category": "SaaS",
    "advantages": "AI-powered, tactical, action-oriented",
    "normalPrice": 299000,
    "targetMonthlyRevenue": 10000000,
    "activeSocialMedia": ["WhatsApp", "Instagram"],
    "businessContact": "support@maxsales.id",
    "peakHours": "09:00-11:00 & 19:00-21:00",
    "topConvertingChannel": "WhatsApp"
  },
  "warRoom": {
    "competitors": [{
      "name": "Competitor A",
      "biggestWeakness": "Slow response",
      "priceGap": "More expensive",
      "blindSpot": "No AI integration"
    }],
    "topMarketThreat": "Price war",
    "untappedOpportunity": "AI-powered features"
  },
  "customerInsight": {
    "topSegment": "SMEs",
    "topComplaint": "Complex interface",
    "topDesire": "Simplicity",
    "churnRiskSegment": "New users",
    "avgTransactionGap": "Rp 50,000"
  },
  "daily": {
    "yesterdayRevenue": 5000000,
    "todayTarget": 6000000,
    "dailyAchievementPct": 83.3,
    "activeStrategies": ["Social media", "Email"],
    "pendingItems": ["Follow up leads"],
    "streakDays": 7
  }
}
```

**Response:**
```json
{
  "markdown": "### 1. 🎯 Celah Bisnis Hari Ini\n...",
  "meta": {
    "model": "prompt-chain-3-step",
    "temperature": 0.7,
    "chainLatenciesMs": [120, 150, 200],
    "totalTokens": 1024
  }
}
```

### Error Handling

**Standard Error Format:**
```json
{
  "error": true,
  "message": "Deskripsi error",
  "code": "ERROR_CODE",
  "timestamp": "2026-06-28T12:00:00Z"
}
```

### Rate Limiting

- **Current**: No rate limiting (development phase)
- **Future**: 100 requests/hour per user (planned)

---

## Kontak & Support

### Official Contact

| Purpose | Contact | Response Time |
|---------|---------|---------------|
| **Sales Inquiry** | ics@voxia.id | < 24 hours |
| **Technical Support** | ics@voxia.id | < 48 hours |
| **Partnership** | ics@voxia.id | < 72 hours |
| **General Inquiry** | ics@voxia.id | < 48 hours |

### Support Channels

1. **WhatsApp**: +62 [number] (Coming Soon)
2. **Email**: ics@voxia.id
3. **Website**: https://maxsales.qzz.io
4. **Documentation**: https://github.com/ataraxianusa/MaxSales

### Team Structure

| Role | Name | Responsibility |
|------|------|----------------|
| **Product Lead** | VOXIA Team | Overall product vision |
| **Technical Lead** | VOXIA Team | Architecture & development |
| **AI Specialist** | VOXIA Team | AI models & prompts |
| **Sales Lead** | TBD | Go-to-market strategy |
| **Support Lead** | TBD | Customer success |

### Repository Information

- **Organization**: ataraxianusa
- **Repository**: MaxSales
- **License**: Custom Permission Required
- **Primary Branch**: main
- **Live Demo**: https://maxsales.qzz.io

---

## Lampiran (Appendix)

### A. Glossary

| Term | Definition |
|------|------------|
| **3-Chain AI** | Arsitektur AI dengan 3 tahap sequential prompt |
| **DNA Business Canvas** | 6-tab business profile untuk personalisasi |
| **Tactical Briefing** | Briefing harian yang dihasilkan AI |
| **Pengusaha** | Target audience utama MaxxSales |
| **SWOT** | Strengths, Weaknesses, Opportunities, Threats |
| **LTV** | Lifetime Value (Nilai pelanggan sepanjang masa) |
| **Churn Risk** | Risiko pelanggan berhenti berlangganan |

### B. Color Palette (Tailwind CSS v4)

**Primary Colors:**
- Indigo: `#6366f1` (primary-500)
- Violet: `#8b5cf6` (violet-500)
- Cyan: `#06b6d4` (cyan-500)
- Emerald: `#10b981` (emerald-500)

**Neutral Colors:**
- Black: `#000000`
- Neutral-900: `#171717`
- Neutral-800: `#27272a`
- Neutral-700: `#404040`

### C. Typography

**Font Stack:**
- Primary: `Inter, system-ui, sans-serif`
- Monospace: `JetBrains Mono, monospace`

**Type Scale:**
- `text-xs`: 12px
- `text-sm`: 14px
- `text-base`: 16px
- `text-lg`: 18px
- `text-xl`: 20px
- `text-2xl`: 24px
- `text-3xl`: 30px

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v01 | 2026-06-28 | Initial whitepaper release | VOXIA Team |

---

## Legal & Disclaimer

### Copyright

© 2026 VOXIA. All rights reserved.

### License

This project is licensed under a **Custom Permission License**. Use, modification, and distribution require prior written permission from the copyright holder.

**Contact for permission:** ics@voxia.id

### Disclaimer

MaxxSales is currently in **experiment phase (MVP v1.2)**. While we strive for accuracy and reliability, the AI-generated content should be used as **guidance, not absolute truth**. Always verify critical business decisions with proper analysis.

**AI Model Disclaimer:**
- Uses OpenRouter API with various models
- Default: `openai/gpt-oss-120b:free`
- Dynamic Temperature per chain: GapAnalyzer=0.2, ExecutionPlan=0.35, CommsWriter=0.7
- Fallback to local simulator when API unavailable

### Liability

VOXIA and the MaxxSales team are **not liable** for any losses or damages resulting from the use of this software. Users are solely responsible for their business decisions.

---

## Next Steps

### Bagi Tim Sales:

1. **Pelajari whitepaper** ini untuk memahami value proposition MaxxSales
2. **Coba demo live** di https://maxsales.qzz.io
3. **Siapkan pitch deck** menggunakan informasi dari dokumen ini
4. **Identifikasi prospek** yang sesuai dengan target audience
5. **Feedback collection** dari early adopters

### Bagi Tim Operasional:

1. **Setup infrastructure** untuk deployment
2. **Monitor performance** sistem
3. **Feedback loop** dengan tim development
4. **User support** untuk pengusaha
5. **Data collection** untuk improvement

### Bagi Developer:

1. **Review codebase** di repository
2. **Understand architecture** (lihat `docs/blueprint/`)
3. **Contribute** ke pengembangan fitur baru
4. **Bug fixing** dan optimization
5. **Documentation** updates

---

**Document Version:** 260628_MaxxSales_Whitepaper_v01.md  
**Last Updated:** 28 Juni 2026  
**Next Review:** 28 Juli 2026  

---

<div align="center">
  <sub>Built with ❤️ by <a href="mailto:ics@voxia.id">VOXIA Team</a> · © 2026 VOXIA. All rights reserved.</sub>
  <br>
  <sub>AI by <a href="https://openrouter.ai">OpenRouter</a> · Deployed on <a href="https://pages.cloudflare.com">Cloudflare Workers</a> & <a href="https://pages.github.com">GitHub Pages</a></sub>
</div>