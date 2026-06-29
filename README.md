# MaxxSales — AI-Powered Sales Growth OS

> **MVP v1.2** · Sistem Operasi Pertumbuhan Bisnis berbasis AI untuk Pengusaha Indonesia — 3-chain tactical briefing, competitor intelligence, customer segmentation, content generation, dan daily strategy execution.

[![Deploy to GitHub Pages](https://github.com/ataraxianusa/MaxSales/actions/workflows/deploy.yml/badge.svg)](https://github.com/ataraxianusa/MaxSales/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Live%20Site-maxsales.qzz.io-blue)](https://maxsales.qzz.io)
[![License](https://img.shields.io/badge/License-Custom%20Permission%20Required-orange)](./LICENSE)

---

## Overview

**MaxxSales** is an AI-powered business growth operating system that transforms raw business data into daily tactical strategies for Pengusaha. It combines an 8-endpoint AI backend (3-chain prompt pipeline, SWOT analysis, customer segmentation, content generation) with a React dashboard for execution-ready daily briefings.

The platform runs as a **React 19 + TypeScript** SPA with a dual-backend architecture:
- **Express.js** (`server.ts`) for local development
- **Cloudflare Workers + Hono** (`worker.ts`) for edge production deployment

All AI features are powered by **OpenRouter** (default model: `openai/gpt-oss-120b:free`). When `OPENROUTER_API_KEY` is not set, every module falls back gracefully to a smart local simulator so the UI remains fully functional.

**Live Demo:** [https://maxsales.qzz.io](https://maxsales.qzz.io)

---

## Features

### 6 Core Dashboard Modules

| # | Module | Description |
|---|---|---|
| 1 | **Daily Sales Pulse** | AI-generated tactical briefing (3-chain: GapAnalyzer → ExecutionPlan → CommsWriter), dynamic checklist, copy-paste WhatsApp & social templates, revenue tracking with bar charts, competitor radar |
| 2 | **Competitor War Room** | Add competitor profiles, AI-powered SWOT analysis, compare brands with radar charts |
| 3 | **Customer Insight** | Customer segment management with estimated LTV calculation, churn risk analysis, and AI-generated retention recommendations |
| 4 | **Strategy Forge** | AI-generated 5–11 pillar marketing strategy blueprint based on your Business DNA and optimism level (Konservatif / Moderat / Agresif) |
| 5 | **Content Generator** | AI-generated promo content: headlines, captions, hashtags, price displays, and urgency text for feed/story/WhatsApp formats |
| 6 | **Floating AI Chatbot** | Context-aware MaxxSales copilot — answers questions about all features using the stored Business DNA |

### Supporting Modules

| Module | Description |
|---|---|
| 🧬 **DNA Business Canvas** | 6-tab business profile wizard — Product, Target Market, Business Patterns, Media Channels, **Performa Real-Time**, Competitor Summary. Filled once to unlock all AI features. Re-edit anytime via sidebar. |
| 🎓 **User Tour** | Interactive onboarding guide and glossary matching all core features |
| 📘 **Technical Docs** | In-app reference panel showing architecture, API endpoints, and deployment instructions |
| 🔐 **Login** | Simple local-storage–based login gate |
| 🌗 **Dark/Light Theme** | Toggle between dark and light mode (persisted to localStorage) |

### Gamification

- **Daily Streak**: Check in daily via "Acak Tips Baru" in Daily Sales Pulse — earn +50 XP per day, track streak count
- **Progress Tracking**: Visual progress bar across the 6 core modules with checkbox-based engagement tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 5.8, Tailwind CSS v4, Recharts, Motion |
| **Backend (Dev)** | Express.js, Node.js, `tsx` (dev runner), `esbuild` (production bundle) |
| **Backend (Edge)** | Cloudflare Workers + Hono (`worker.ts`) |
| **AI** | OpenRouter API (OpenAI-compatible, default: `openai/gpt-oss-120b:free`) |
| **AI Architecture** | 3-chain sequential prompt pipeline (GapAnalyzer → ExecutionPlan → CommsWriter), Dynamic Temperature per chain (0.2 / 0.35 / 0.7) |
| **Build Tool** | Vite 6 + `@tailwindcss/vite` + `@vitejs/plugin-react` |
| **Icons** | Lucide React |
| **CI/CD** | GitHub Actions → GitHub Pages (`gh-pages` branch) |
| **Custom Domain** | `maxsales.qzz.io` (CNAME) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- An OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys) (free tier works)

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/ataraxianusa/MaxSales.git
cd MaxSales

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and set your OPENROUTER_API_KEY

# 4. Start the dev server (Express + Vite HMR)
npm run dev
```

The app runs at **http://localhost:3000**.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Optional* | OpenRouter API key. Without it, app runs in simulation mode. |
| `OPENROUTER_MODEL` | Optional | OpenRouter model slug (default: `openai/gpt-oss-120b:free`) |
| `VITE_API_URL` | Optional | Cloudflare Worker URL for production — sets `API_BASE` at build time |

> *All 8 AI endpoints fall back to built-in smart simulators if no API key is provided. The 3-chain tactical briefing has its own dedicated fallback generator.

### Build for Production

```bash
# Build frontend (Vite) + bundle backend (esbuild)
npm run build

# Start production Express server (serves API + static frontend)
npm start
```

---

## Deployment

### GitHub Pages (Frontend Only)

The repo deploys to GitHub Pages automatically via `.github/workflows/deploy.yml` on every push to `main`. The `VITE_API_URL` secret must be set in the GitHub repo to point at your Cloudflare Worker for live AI features.

**Live URL:** [https://maxsales.qzz.io](https://maxsales.qzz.io)

### Cloudflare Worker (AI Backend)

The `worker.ts` file exports a Hono app with all 11 endpoints ready for Cloudflare Workers deployment:

```bash
# Set your OpenRouter API key as a secret
npx wrangler secret put OPENROUTER_API_KEY

# Deploy
npx wrangler deploy
```

See `wrangler.toml` for configuration.

### Full-Stack Node.js Server

Deploy to any Node.js-compatible host (Railway, Render, Fly.io, VPS):

```bash
npm run build
npm start  # Express server at PORT (default 3000)
```

---

## Project Structure

```
MaxSales/
├── src/
│   ├── components/               # 13 React components
│   │   ├── App.tsx               # Root app: routing, state, theme, DNA edit gate
│   │   ├── BusinessCanvas.tsx    # 6-tab DNA wizard (660 lines)
│   │   ├── CompetitorWarRoom.tsx # Competitor SWOT + radar charts
│   │   ├── ContentGenerator.tsx  # AI promo content generator
│   │   ├── CustomerInsight.tsx   # Customer segmentation & LTV
│   │   ├── DailyPulse.tsx        # Daily tactical briefing dashboard (624 lines)
│   │   ├── FloatingChatbot.tsx   # AI copilot floating chat
│   │   ├── Header.tsx            # Navigation header
│   │   ├── LandingPage.tsx       # Public landing page
│   │   ├── Login.tsx             # Auth gate
│   │   ├── StrategyForge.tsx     # Multi-pillar strategy generator
│   │   ├── TechnicalDocs.tsx     # In-app architecture & API docs
│   │   └── UserTour.tsx          # Onboarding tour & glossary
│   ├── hooks/
│   │   └── useDNAAutoUpdate.ts   # DNA auto-suggestion hook
│   ├── store/
│   │   └── ChainContext.tsx      # Global state: DNA, competitors, segments, streak
│   ├── api.ts                    # API_BASE utility
│   ├── index.css                 # Tailwind import
│   ├── main.tsx                  # React entry point
│   ├── tactical-briefing.ts      # ⭐ 3-chain prompt module (387 lines)
│   └── types.ts                  # 6 TypeScript interfaces (59 DNA fields) + defaults
├── server.ts                     # Express backend — 8 API endpoints (654 lines)
├── worker.ts                     # Cloudflare Worker (Hono) — 11 API endpoints (986 lines)
├── docs/                         # Documentation
│   ├── blueprint/                # Architecture blueprints (v01–v02)
│   ├── migrasi/                  # Azure migration docs (18 files, v01–v02)
│   │   ├── api/                  #   Endpoint inventory, AI adapter, refactoring plan
│   │   ├── arsitektur/           #   Architecture analysis, target design, strategy
│   │   ├── biaya/                #   Cost analysis & optimization
│   │   ├── implementasi/         #   Timeline, rollback, testing plans
│   │   ├── infrastruktur/        #   Network, CI/CD, DR design
│   │   ├── keamanan/             #   Security baseline & compliance
│   │   └── laporan/              #   Executive reports & recommendations
│   └── azure-migration-plan/     # Migration executive brief
├── vite.config.ts
├── wrangler.toml
├── tsconfig.json
├── index.html
├── CNAME                         # Custom domain
└── .github/workflows/
    └── deploy.yml                # GitHub Actions → GitHub Pages
```

---

## API Endpoints

server.ts exposes 8 core endpoints; worker.ts exposes all 8 plus 3 additional endpoints (suggest-content, scrape-competitor, instagram-scrape, facebook-scrape, auto-segment, predict-revenue, cluster-customers).

| # | Method | Endpoint | AI Calls | Description |
|---|--------|----------|----------|-------------|
| 1 | `GET` | `/api/status` | 0 | Health check + AI mode status |
| 2 | `POST` | `/api/generate-content-text` | 1 | Generate promo content (headlines, captions, hashtags) |
| 3 | `POST` | `/api/strategy-forge` | 1 | Generate 5–11 pillar strategy blueprint |
| 4 | `POST` | `/api/daily-pulse` | 1 | Morning briefing (legacy — now replaced by tactical-briefing in UI) |
| 5 | `POST` | `/api/analyze-competitor` | 1 | SWOT analysis for a specific competitor |
| 6 | `POST` | `/api/analyze-segments` | 1 | AI-powered customer segment analysis with LTV & churn risk |
| 7 | `POST` | `/api/chat` | 1 | Conversational AI copilot (context-aware with Business DNA) |
| 8 | `POST` | `/api/tactical-briefing` | **3 (chain)** | ⭐ 3-chain tactical briefing: GapAnalyzer → ExecutionPlan → CommsWriter |

### Tactical Briefing — 3-Chain Architecture

```
Chain 1: GapAnalyzer          (temp: 0.2, tokens: 256)
  Input:  DNA + WarRoom + CustomerInsight + DailyContext
  Output: JSON { gap, revenueImpact }
    ↓
Chain 2: ExecutionPlan        (temp: 0.35, tokens: 256)
  Input:  Gap + PeakHours + TopConvertingChannel
  Output: JSON { steps[], quickWin }
    ↓
Chain 3: CommsWriter          (temp: 0.7, tokens: 512)
  Input:  Gap + Plan + Brand + Contact
  Output: Markdown (3 sections: Celah + Eksekusi + Amunisi)
```

**Terminology Policy:** All system prompts strictly prohibit "UMKM", "UKM", "Usaha Kecil", "Mikro". Use "Pengusaha", "Pelaku Usaha", or brand name.

---

## DNA Business Canvas — 59 Fields Across 6 Tabs

| Tab | Fields | Purpose |
|---|---|---|
| Produk & Spesifikasi | 16 | Product name, price, quality, packaging, advantages |
| Target Market | 14 | Demographics, behavior, platforms, triggers |
| Pola & Finansial | 13 | Business type, revenue, margin, capital |
| Media & Channel | 10 | Social media, marketplaces, ad budget |
| **Performa Real-Time** ⭐ | **2** | Peak sales hours, top converting channel |
| Kompetitor | 4 | Competitor count, biggest rival, strengths, weaknesses |

---

## Terminology Policy

> **Hard rule:** Semua system prompt, user prompt, dan output ke pengguna TIDAK BOLEH menggunakan "UMKM", "UKM", "Usaha Kecil", atau "Mikro". Gunakan "Pengusaha", "Pelaku Usaha", "Bisnis Anda", atau nama brand langsung.

Enforced across: `server.ts`, `worker.ts`, `src/tactical-briefing.ts`, dan seluruh UI components.

---

## Azure Migration

MaxSales is migrating from Cloudflare Workers to Microsoft Azure. See `docs/migrasi/` for comprehensive documentation:

- **Endpoint Inventory v02** — 11 endpoints mapped to Azure Functions
- **Architecture Analysis v02** — Current state + target state with Cosmos DB, Front Door, API Management
- **Implementation Timeline v02** — 12-week plan with pre-migration Fase 0 already completed
- **Executive Report v02** — Budget $43-64/month, risk matrix, next steps

---

## License

This project is licensed under a **Custom Permission License**.
Use, modification, and distribution require prior written permission from the copyright holder.

See [LICENSE](./LICENSE) for full terms.

**Contact for permission:** [ics@voxia.id](mailto:ics@voxia.id)

---

<div align="center">
  <sub>Built with ❤️ by <a href="mailto:ics@voxia.id">VOXIA Team</a> · © 2026 VOXIA. All rights reserved.</sub>
  <br>
  <sub>AI by <a href="https://openrouter.ai">OpenRouter</a> · Deployed on <a href="https://pages.cloudflare.com">Cloudflare Workers</a> & <a href="https://pages.github.com">GitHub Pages</a></sub>
</div>