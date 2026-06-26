# MaxxSales — Handover Document
**Date:** 26 Juni 2026  
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

### Competitor War Room
- Radar chart (Recharts)
- Interactive score sliders
- SWOT matrix
- AI-powered SWOT generation
- **DNA sync:** `biggestCompetitor` dari DNA auto-create competitor entry dengan badge "DNA"

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

**Pattern:** Copy from `worker.ts`, adapt to Azure OpenAI SDK (`api/src/shared/ai-client.ts`)

#### 3. Build Verification
- `npm run build` belum sukses karena type errors
- Azure Functions `api/` directory has separate `node_modules`

#### 4. Auth Improvements
- `auth-register` function incomplete (only `function.json`, no `index.ts`)
- No persistent database (in-memory Map, lost on cold start)
- Need Cosmos DB or Azure Table Storage

---

## 4. Architecture Details

### Experiment Backend (worker.ts)
- **Framework:** Hono on Cloudflare Workers
- **AI:** OpenRouter (`OPENROUTER_API_KEY`)
- **Model:** `openai/gpt-oss-120b:free`
- **Endpoints:** `/api/status`, `/api/generate-content-text`, `/api/suggest-content`, `/api/strategy-forge`, `/api/daily-pulse`, `/api/analyze-segments`, `/api/tactical-briefing`
- **Pattern:** `callOpenRouter()` → `parseJsonResponse()` → fallback to static data

### Production Backend (api/)
- **Framework:** Azure Functions v2 (`@azure/functions` 4.6.0)
- **AI:** Azure OpenAI SDK (`openai` 4.86.0)
- **Client:** `api/src/shared/ai-client.ts`
- **Existing:** `auth-login`, `auth-me`, `generate-assets`, `generate-strategy`, `evaluate-lead-score`, `help-chat`
- **Missing:** `suggest-content`, `generate-content-text`, `strategy-forge`, `daily-pulse`, `analyze-segments`, `tactical-briefing`

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
  ├──→ CompetitorWarRoom (auto-sync biggestCompetitor)
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

---

## 6. Key Files Reference

### Experiment
| File | Purpose |
|---|---|
| `src/components/ContentGenerator.tsx` | Canvas + AI suggestions |
| `src/components/CompetitorWarRoom.tsx` | Radar + SWOT |
| `src/store/ChainContext.tsx` | Centralized state |
| `src/types.ts` | All data models |
| `worker.ts` | Backend (Hono/Cloudflare) |
| `src/App.tsx` | Main routing (696 lines) |
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
1. Verify all features stable
2. Run `npx vite build` + manual QA
3. Create release tag

### Phase 2: Production Migration
1. Fix production App.tsx type errors
2. Add Azure Functions endpoints (6 new)
3. Update `staticwebapp.config.json` for new routes
4. Run `npm run build` in production
5. Deploy to staging, QA
6. Merge to main, deploy to prod

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

*Document generated by MiMo Code Agent — 26 Juni 2026*
