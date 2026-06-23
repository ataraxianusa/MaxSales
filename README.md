# MaxxSales — AI-Powered Sales Flow Platform

> **MVP** · AI Business Brain for Indonesian SMEs / UKM — OpenRouter-powered sales intelligence, competitor analysis, customer segmentation, content generation, and daily strategy briefings.

[![Deploy to GitHub Pages](https://github.com/ataraxianusa/MaxSales/actions/workflows/deploy.yml/badge.svg)](https://github.com/ataraxianusa/MaxSales/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Live%20Site-maxsales.qzz.io-blue)](https://maxsales.qzz.io)
[![License](https://img.shields.io/badge/License-Custom%20Permission%20Required-orange)](./LICENSE)

---

## Overview

**MaxxSales** (also referred to as *VOXIA Sales-Flow*) is a one-stop digital sales platform built for Indonesian SMEs and enterprise teams. It combines AI-generated marketing assets, intelligent CRM scoring, strategy blueprint automation, competitor intelligence, and multi-branch synchronization into a single unified dashboard.

The platform runs as a **React + TypeScript** SPA with a dual-backend architecture:
- **Express.js** server for local development / full-stack Node.js hosting
- **Cloudflare Workers** (Hono) for edge production deployment

All AI features are powered by **OpenRouter** (default model: `openai/gpt-oss-120b:free`). When `OPENROUTER_API_KEY` is not set, every module falls back gracefully to a smart local simulator so the UI remains fully functional.

**Live Demo:** [https://maxsales.qzz.io](https://maxsales.qzz.io)

---

## Features

### 5 Core Dashboard Modules

| # | Module | Description |
|---|---|---|
| 1 | **Competitor War Room** | Add competitor profiles, run AI-powered SWOT analysis, compare brands with radar charts |
| 2 | **Customer Insight** | Customer segment management with estimated LTV calculation, churn risk analysis, and AI-generated retention recommendations |
| 3 | **Strategy Fusion** | AI-generated multi-pillar marketing strategy blueprint based on your Business DNA and optimism level (Konservatif / Moderat / Agresif) |
| 4 | **Content Generator** | AI-generated promo content: headlines, captions, hashtags, price displays, and urgency text for feed/story/WhatsApp formats |
| 5 | **Daily Sales Pulse** | Morning briefing, daily KPI tracker, revenue radar, competitor activity alerts, and gamified streak system (+50 XP per check-in) |

### Supporting Modules

| Module | Description |
|---|---|
| 🧬 **DNA Business Canvas** | 5-tab business profile wizard (Product, Target Market, Business Patterns, Media Channels, Competitor Summary) — filled once to unlock all AI features |
| 🤖 **AI Chatbot (FloatingChatbot)** | Context-aware MaxxSales copilot — answers questions about all features using the stored Business DNA |
| 🎓 **User Tour** | Interactive onboarding guide and glossary matching the 5 core features |
| 📘 **Technical Docs** | In-app reference panel showing Cloudflare Worker code, API endpoint docs, and deployment instructions |
| 🔐 **Login** | Simple local-storage–based login gate |
| 🌗 **Dark/Light Theme** | Toggle between dark and light mode (persisted to localStorage) |

### Gamification

- **Daily Streak**: Check in daily via the sidebar panel or by visiting Daily Sales Pulse — earn +50 XP per day, track streak count, level up every 3 days
- **Progress Tracking**: Visual progress bar across the 5 core modules with checkbox-based engagement tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Recharts, D3, Motion |
| **Backend (Dev / Full-stack)** | Express.js, Node.js, `tsx` (dev runner), `esbuild` (production bundle) |
| **Backend (Edge)** | Cloudflare Workers + Hono (`worker.ts`) |
| **AI** | OpenRouter API (OpenAI-compatible, default model `openai/gpt-oss-120b:free`) |
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
| `APP_URL` | Optional | Hosting URL for self-referential links and OpenRouter `HTTP-Referer` header |
| `VITE_API_URL` | Optional | Cloudflare Worker URL for production — sets `API_BASE` at build time |

> *All AI features fall back to a built-in smart simulator if no API key is provided.

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

The repo deploys to GitHub Pages automatically via `.github/workflows/deploy.yml` on every push to `main`. The `VITE_API_URL` secret must be set in the GitHub repo to point at your Cloudflare Worker for live AI features. Without it, the static build runs in **simulation mode**.

**Live URL:** [https://maxsales.qzz.io](https://maxsales.qzz.io)

### Cloudflare Worker (AI Backend)

The `worker.ts` file exports a Hono app ready for Cloudflare Workers deployment. Set up via wrangler:

```bash
# Set your OpenRouter API key as a secret
npx wrangler secret put OPENROUTER_API_KEY

# Optionally override the model
npx wrangler secret put OPENROUTER_MODEL

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

Set `OPENROUTER_API_KEY` as an environment variable on your hosting platform.

---

## Project Structure

```
MaxSales/
├── src/                          # React frontend source
│   ├── components/               # All UI components (12 files)
│   │   ├── App.tsx               # Root app with routing, state, theme
│   │   ├── BusinessCanvas.tsx    # DNA Business Canvas wizard
│   │   ├── CompetitorWarRoom.tsx # Competitor SWOT + radar charts
│   │   ├── ContentGenerator.tsx  # AI promo content generator
│   │   ├── CustomerInsight.tsx   # Customer segmentation & LTV
│   │   ├── DailyPulse.tsx        # Daily sales dashboard + streak
│   │   ├── FloatingChatbot.tsx   # AI copilot floating chat
│   │   ├── Header.tsx            # Navigation header
│   │   ├── LandingPage.tsx       # Public landing page
│   │   ├── Login.tsx             # Auth gate
│   │   ├── StrategyForge.tsx     # Multi-pillar strategy generator
│   │   ├── TechnicalDocs.tsx     # In-app API & deployment docs
│   │   └── UserTour.tsx          # Onboarding tour & glossary
│   ├── api.ts                    # API_BASE utility
│   ├── index.css                 # Tailwind import
│   ├── main.tsx                  # React entry point
│   └── types.ts                  # TypeScript interfaces + default data
├── server.ts                     # Express backend (all API routes)
├── worker.ts                     # Cloudflare Worker (Hono) — same API
├── vite.config.ts                # Vite configuration
├── wrangler.toml                 # Cloudflare Workers config
├── tsconfig.json                 # TypeScript configuration
├── index.html                    # HTML entry point
├── CNAME                         # Custom domain (maxsales.qzz.io)
├── metadata.json                 # Play Store–style capability metadata
├── .env.example                  # Environment variable template
└── .github/workflows/
    └── deploy.yml                # GitHub Actions → GitHub Pages
```

---

## API Endpoints

All endpoints are available both in the Express server (`server.ts`) and the Cloudflare Worker (`worker.ts`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Health check + AI mode status |
| `POST` | `/api/generate-content-text` | Generate promo content (headlines, captions, hashtags) |
| `POST` | `/api/strategy-forge` | Generate 5–11 pillar marketing strategy blueprint |
| `POST` | `/api/daily-pulse` | Morning briefing with leads count, competitor update, sales % |
| `POST` | `/api/analyze-competitor` | SWOT analysis for a specific competitor |
| `POST` | `/api/analyze-segments` | AI-powered customer segment analysis with LTV & churn risk |
| `POST` | `/api/chat` | Conversational AI copilot (context-aware with Business DNA) |

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
  <sub>AI by <a href="https://openrouter.ai">OpenRouter</a> · Deployed on <a href="https://pages.cloudflare.com">Cloudflare</a> & <a href="https://pages.github.com">GitHub Pages</a></sub>
</div>