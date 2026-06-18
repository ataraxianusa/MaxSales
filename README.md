# VOXIA MaxSales — AI-Powered Sales Flow Platform

> **MVP Release** · Full-stack SaaS platform for digital marketing automation, CRM intelligence, and multi-branch sales management — powered by Google Gemini AI.

[![Deploy to GitHub Pages](https://github.com/ataraxianusa/MaxSales/actions/workflows/deploy.yml/badge.svg)](https://github.com/ataraxianusa/MaxSales/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-ataraxianusa.github.io%2FMaxSales-blue)](https://ataraxianusa.github.io/MaxSales/)
[![License](https://img.shields.io/badge/License-Custom%20Permission%20Required-orange)](./LICENSE)

---

## Overview

**VOXIA MaxSales** is a one-stop digital sales platform built for Indonesian SMEs and enterprise teams. It combines AI-generated marketing assets, intelligent CRM scoring, strategy blueprint automation, competitor intelligence, and multi-branch synchronization into a single unified dashboard.

The platform runs as a **React + TypeScript** SPA on the frontend, backed by an **Express.js** API server that orchestrates calls to Google Gemini AI. When a `GEMINI_API_KEY` is not available, all modules fall back gracefully to a smart local simulator so the UI remains fully functional.

---

## Features

| Module | Description |
|---|---|
| 🎨 **Branding** | Generate ad copy and visual campaign assets for any product/persona via Gemini AI |
| 📊 **Strategy** | AI-powered marketing blueprint wizard with budget allocation charts |
| 👥 **CRM** | Lead database with AI lead scoring (1–100) and automated follow-up triggers |
| 🔍 **Competitor Intel** | Analyze competitor channel mix, pricing, and ad samples |
| 🤖 **AI Chatbot** | Context-aware VOXIA Sales-Flow advisor powered by Gemini |
| 🏢 **Multi-Branch** | Sync campaigns across multiple business locations via interactive map |

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Recharts, D3, Motion
- **Backend:** Express.js, Node.js, `tsx` (dev), `esbuild` (prod build)
- **AI:** `@google/genai` SDK — Gemini 2.5 Flash
- **Build Tool:** Vite 6
- **CI/CD:** GitHub Actions → GitHub Pages

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) (free tier works)

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/ataraxianusa/MaxSales.git
cd MaxSales

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and set your GEMINI_API_KEY

# 4. Start the dev server (Express + Vite HMR)
npm run dev
```

App runs at **http://localhost:3000**

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional* | Gemini API key from Google AI Studio. Without it, app runs in simulation mode. |
| `APP_URL` | Optional | Hosting URL for self-referential links and OAuth callbacks |

> *All AI features fall back to a built-in smart simulator if the key is not provided.

### Build for Production

```bash
# Build frontend (Vite) + backend (esbuild)
npm run build

# Start production server
npm start
```

---

## Deployment

### GitHub Pages (Frontend Only)

This repo is configured for automatic deployment to GitHub Pages via `.github/workflows/deploy.yml`. Every push to `main` triggers a Vite build and deploys the static frontend.

> **Note:** GitHub Pages serves static files only. Backend API routes (`/api/*`) and live Gemini AI features require a Node.js server (see below). The static build runs in **simulation mode** automatically.

**Live URL:** [https://ataraxianusa.github.io/MaxSales/](https://ataraxianusa.github.io/MaxSales/)

### Full-Stack Server (Recommended for production)

Deploy to any Node.js-compatible host (Railway, Render, Fly.io, VPS):

```bash
npm run build
npm start  # Runs Express server serving both API + static frontend
```

Set `GEMINI_API_KEY` as an environment variable on your hosting platform to enable live AI features.

---

## Project Structure

```
MaxSales/
├── src/                  # React frontend source
│   ├── components/       # UI components per module
│   ├── pages/            # Module views (Branding, CRM, Strategy, etc.)
│   └── main.tsx          # App entry point
├── server.ts             # Express backend + Gemini AI API routes
├── vite.config.ts        # Vite config (base: /MaxSales/ for GitHub Pages)
├── .github/workflows/
│   └── deploy.yml        # GitHub Pages CI/CD pipeline
├── .env.example          # Environment variable template
└── index.html            # HTML entry point
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Health check + AI mode status |
| `POST` | `/api/generate-assets` | Generate branding campaign assets |
| `POST` | `/api/generate-strategy` | Generate marketing strategy blueprint |
| `POST` | `/api/evaluate-lead-score` | AI lead scoring for CRM contacts |
| `POST` | `/api/analyze-competitor` | Competitor channel and pricing analysis |
| `POST` | `/api/help-chat` | AI chatbot conversation |

---

## License

This project is licensed under a **Custom Permission License**.
Use, modification, and distribution require prior written permission from the copyright holder.

See [LICENSE](./LICENSE) for full terms.

**Contact for permission:** [ics@voxia.id](mailto:ics@voxia.id)

---

<div align="center">
  <sub>Built with ❤️ by <a href="mailto:ics@voxia.id">VOXIA Team</a> · © 2026 VOXIA. All rights reserved.</sub>
</div>
