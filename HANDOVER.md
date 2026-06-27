# MaxxSales — Handover Document
**Date:** 27 Juni 2026  
**Author:** MiMo Code Agent  
**Session:** ses_0fe10b2cfffezidfb9nNldcSe2

---

## 1. Project Overview

**MaxxSales** adalah AI-powered business growth OS untuk pengusaha Indonesia. Dikembangkan oleh **PT. Gen Indo Kreatif**, Surabaya-Indonesia.

### Dual-Repo Architecture

| | EXPERIMENT | PRODUCTION |
|---|---|---|
| **Path** | `/home/ics/Projects/EXPERIMENT/MaxSales/` | `/home/ics/Projects/VOXIA/MaxxSales/` |
| **Role** | Source of truth for new features | Target for migration |
| **Stack** | React 19 + Vite + Tailwind v4 + Cloudflare Workers | React 19 + Vite + Tailwind v4 + Azure Functions + Azure SWA |
| **Deploy** | GitHub Pages (`maxsales.qzz.io`) | Azure Static Web Apps + Bicep IaC |
| **AI** | OpenRouter API | Azure OpenAI SDK |
| **Scraping** | Apify (Instagram + Facebook) | TBD |
| **Repo** | `github.com/ataraxianusa/MaxSales` | `github.com:VOXIA-ID/MaxxSales` |

---

## 2. Features Completed (Experiment)

### Landing Page
- Hero: "Ubah Produk Biasa Jadi Luar Biasa"
- Sub: "Sistem Operasi Pertumbuhan Bisnis Berbasis AI Untuk Memaximalkan Penjualan"
- Pricing: **Rp299ribu** (~~Rp499.000~~) + badge HEMAT 40%
- Footer: © 2026 PT. Gen Indo Kreatif

### Legal Pages (React Router URLs)
| URL | Component | Content |
|---|---|---|
| `/about` | AboutPage.tsx | PT. Gen Indo Kreatif, visi, misi, kontak |
| `/terms` | TermsOfService.tsx | 10 pasal S&K |
| `/privacy` | PrivacyPolicy.tsx | 9 pasal privasi data |
| `/risk` | RiskDisclosure.tsx | AI disclaimer + 9 pasal risiko |

**GitHub Pages SPA routing:** `public/404.html` → `index.html` redirect trick

### Content Generator
- **4 layout templates:** Minimal, Bold, Card, Banner
- **3 formats:** Feed (1:1), Story (9:16), WhatsApp (1:1)
- **AI suggestions** untuk hook, CTA, caption (`/api/suggest-content`)
- Photo upload dengan drag-and-drop
- Caption panel: full-width modern card di bawah canvas
- Hashtags sebagai pill badges
- Auto-fill dari DNA business data

### Competitor War Room (v2 — dengan Apify)
- **Input fields:** Nama, Lokasi, Harga, Kanal, Instagram ID, Facebook Page URL
- **3 data sources dalam parallel:**
  1. AI SWOT analysis (`/api/analyze-competitor`)
  2. DuckDuckGo web search (`/api/scrape-competitor`)
  3. Apify Instagram scrape (`/api/instagram-scrape`)
  4. Apify Facebook Pages scrape (`/api/facebook-scrape`)
- **Social Media Intelligence Card** — menampilkan data Instagram, Facebook, Web Presence
- **Status banner** — ✅/❌ indicator setelah analisis selesai
- Radar chart (Recharts) dengan interactive score sliders
- **DNA sync:** `biggestCompetitor` dari DNA auto-create competitor entry dengan badge "DNA"

### Apify Integration Details

#### Instagram Profile Scraper
- **Endpoint:** `POST /api/instagram-scrape`
- **Actor:** `apify~instagram-profile-scraper`
- **Input:** `{ username: "string" }`
- **Output:** `{ username, fullName, biography, followers, following, posts, isBusiness, isVerified, businessCategory, externalUrl, recentPosts[] }`
- **Data:** Followers, posts, engagement rate, recent posts dengan likes/comments

#### Facebook Pages Scraper
- **Endpoint:** `POST /api/facebook-scrape`
- **Actor:** `apify~facebook-pages-scraper`
- **Input:** `{ url: "https://facebook.com/..." }`
- **Output:** `{ name, url, likes, followers, rating, reviewCount, email, phone, website, address, bio, category, recentPosts[] }`
- **Data:** Likes, followers, rating, reviews, contact info

#### Apify Token
- Disimpan sebagai **Cloudflare Worker secret** (`APIFY_TOKEN`)
- Free tier: $5 credit ≈ 2,000 profile scrapes

#### Known Bug Fixes (2026-06-27)
| Bug | Root Cause | Fix |
|---|---|---|
| Apify selalu return error | `"SUCCEEDED"` vs `"succeeded"` case mismatch | Uppercase comparison + terminal statuses |
| Dataset ID null | Ambil dari run response awal | Ambil dari `lastPollData` setelah run selesai |
| Timeout Cloudflare | 60 iterasi × 2s = 120s melebihi limit | 25 iterasi × 2s = max 50s |
| User tidak tahu status | Tidak ada feedback | Status banner ✅/❌ setelah analisis |

### Other Features
- BusinessCanvas / DNA wizard
- StrategyForge (strategy pillars)
- CustomerInsight (segments)
- DailyPulse (streak, XP, checklist)
- ChainContext (centralized state)
- useDNAAutoUpdate hook
- AIFeedback component

### Terminology Rules
- ❌ NO "UKM" / "UMKM"
- ✅ "pemilik usaha", "pengusaha", "pengusaha digital mandiri"

---

## 3. Migration Status

### What's Been Copied to Production

| Component | Status |
|---|---|
| ContentGenerator.tsx | ✅ |
| CompetitorWarRoom.tsx | ✅ |
| DailyPulse.tsx | ✅ |
| BusinessCanvas.tsx | ✅ |
| StrategyForge.tsx | ✅ |
| CustomerInsight.tsx | ✅ |
| AIFeedback.tsx | ✅ |
| AboutPage.tsx | ✅ |
| TermsOfService.tsx | ✅ |
| PrivacyPolicy.tsx | ✅ |
| RiskDisclosure.tsx | ✅ |
| ChainContext.tsx | ✅ |
| hooks/ | ✅ |
| types.ts (merged) | ✅ |
| api.ts (API_BASE) | ✅ |
| main.tsx (BrowserRouter) | ✅ |
| react-router-dom | ✅ installed |

### Production Branch
- **Branch:** `feat/migrate-experiment-features`
- **Base:** `main`

### What Still Needs Work

#### 1. App.tsx Refactor (Type Errors)
- `theme` prop not accepted by BrandingView, StrategyView, CrmView, CompetitorView
- `UnifiedChatSession` missing `id` property
- New components need to be imported and wired to sidebar/routing

#### 2. Azure Functions Backend (6 New Endpoints)
| Endpoint | Purpose |
|---|---|
| `/api/suggest-content` | AI hook, CTA, caption suggestions |
| `/api/generate-content-text` | AI content generation |
| `/api/strategy-forge` | AI strategy pillars |
| `/api/daily-pulse` | AI daily briefing |
| `/api/analyze-segments` | AI customer segments |
| `/api/tactical-briefing` | AI tactical briefing |
| `/api/instagram-scrape` | Apify Instagram scrape |
| `/api/facebook-scrape` | Apify Facebook Pages scrape |

**Pattern:** Copy from `worker.ts`, adapt to Azure OpenAI SDK (`api/src/shared/ai-client.ts`)

#### 3. Build Verification
- `npm run build` belum sukses karena type errors
- Azure Functions `api/` directory has separate `node_modules`

#### 4. Auth Improvements
- `auth-register` function incomplete (only `function.json`, no `index.ts`)
- No persistent database (in-memory Map, lost on cold start)
- Need Cosmos DB or Azure Table Storage

#### 5. Apify Secret
- Need to add `APIFY_TOKEN` to Azure Functions environment

---

## 4. Architecture Details

### Experiment Backend (worker.ts)
- **Framework:** Hono on Cloudflare Workers
- **AI:** OpenRouter (`OPENROUTER_API_KEY`)
- **Model:** `openai/gpt-oss-120b:free`
- **Scraping:** Apify (`APIFY_TOKEN`)
- **Endpoints:**
  - `/api/status` — health check
  - `/api/analyze-competitor` — AI SWOT analysis
  - `/api/scrape-competitor` — DuckDuckGo web search
  - `/api/instagram-scrape` — Apify Instagram Profile Scraper
  - `/api/facebook-scrape` — Apify Facebook Pages Scraper
  - `/api/suggest-content` — AI hook, CTA, caption suggestions
  - `/api/generate-content-text` — AI content generation
  - `/api/strategy-forge` — AI strategy pillars
  - `/api/daily-pulse` — AI daily briefing
  - `/api/analyze-segments` — AI customer segments
  - `/api/tactical-briefing` — AI tactical briefing
  - `/api/chat` — AI chatbot
- **Pattern:** `callOpenRouter()` → `parseJsonResponse()` → fallback to static data

### Production Backend (api/)
- **Framework:** Azure Functions v2 (`@azure/functions` 4.6.0)
- **AI:** Azure OpenAI SDK (`openai` 4.86.0)
- **Client:** `api/src/shared/ai-client.ts`
- **Existing:** `auth-login`, `auth-me`, `generate-assets`, `generate-strategy`, `evaluate-lead-score`, `help-chat`
- **Missing:** All experiment endpoints + Apify scraping

### State Management
```
App.tsx (tab state)
  └── ChainContext (centralized)
        ├── dna (BusinessCanvasData)
        ├── competitors (CompetitorIntel[])
        ├── segments (CustomerSegment[])
        ├── strategyOutput (StrategyOutput)
        ├── dailyRecords (DailyPulseRecord[])
        └── feedbackLog (FeedbackLog[])
```

### Data Flow
```
DNA Business
  ├──→ ContentGenerator (auto-fill hook, CTA, caption)
  ├──→ CompetitorWarRoom (auto-sync biggestCompetitor + Apify scrape)
  ├──→ StrategyForge (product, target market)
  ├──→ DailyPulse (brand, revenue target)
  └──→ CustomerInsight (segments, channels)
```

---

## 5. Deployment

### Experiment (GitHub Pages)
- Push to `main` → GitHub Actions → `vite build` → `dist/` → `gh-pages` branch
- Custom domain: `maxsales.qzz.io`
- SPA routing: `public/404.html` redirect trick
- Worker: `wrangler deploy` → `voxia-api.thebehavioralhacks.workers.dev`

### Production (Azure)
- Push to `main` → GitHub Actions:
  1. `build-frontend` → `vite build` → `dist/`
  2. `build-functions` → `tsc` in `api/` → `api/dist/`
  3. `deploy-swa` → Azure Static Web Apps
  4. `deploy-functions` → Azure Functions
  5. `deploy-infra` → Bicep (main only)

### Secrets Required
| Secret | Purpose |
|---|---|
| `AZURE_SWA_TOKEN_PROD/STAGING/DEV` | SWA deployment |
| `AZURE_FUNCTIONS_PUBLISH_PROFILE` | Functions deploy |
| `AZURE_CREDENTIALS` | Service principal |
| `AZURE_SUBSCRIPTION_ID` | Azure sub |
| `AZURE_OPENAI_ENDPOINT/KEY` | AI backend |
| `GOOGLE_CLIENT_ID/SECRET` | SWA Google auth |
| `APIFY_TOKEN` | Instagram/Facebook scraping |

---

## 6. Key Files Reference

### Experiment
| File | Purpose |
|---|---|
| `worker.ts` | Backend — Hono/Cloudflare + Apify scraping |
| `src/App.tsx` | Main routing + DNA sync |
| `src/components/ContentGenerator.tsx` | Canvas + AI suggestions |
| `src/components/CompetitorWarRoom.tsx` | Radar + SWOT + Apify scrape UI |
| `src/store/ChainContext.tsx` | Centralized state |
| `src/types.ts` | All data models |
| `public/404.html` | SPA routing for GitHub Pages |

### Production
| File | Purpose |
|---|---|
| `src/App.tsx` | Main routing (970 lines, needs refactor) |
| `api/src/functions/` | Azure Functions backend |
| `api/src/shared/ai-client.ts` | Azure OpenAI SDK wrapper |
| `infra/main.bicep` | Azure IaC |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `staticwebapp.config.json` | SWA routing + security headers |

---

## 7. Next Steps

### Phase 1: Complete Experiment
1. Verify all Apify scraping working end-to-end
2. Run `npx vite build` + manual QA
3. Create release tag

### Phase 2: Production Migration
1. Fix production App.tsx type errors
2. Add Azure Functions endpoints (8 new: 6 AI + 2 scraping)
3. Add `APIFY_TOKEN` to Azure Functions environment
4. Update `staticwebapp.config.json` for new routes
5. Run `npm run build` in production
6. Deploy to staging, QA
7. Merge to main, deploy to prod

### Phase 3: Production Enhancements
1. Persistent database (Cosmos DB) for auth
2. Complete `auth-register` function
3. Xendit payment integration
4. Multi-environment CI/CD (already set up)

---

## 8. Contact

- **Company:** PT. Gen Indo Kreatif
- **Location:** Surabaya, Indonesia
- **Email:** support@maxxsales.id
- **Website:** www.maxxsales.id

---

*Document updated by MiMo Code Agent — 27 Juni 2026*
