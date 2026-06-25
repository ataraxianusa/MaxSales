# Analisis Arsitektur MaxSales — Current State
**Versi:** v02 | **Tanggal:** 2025-06-25 | **Klasifikasi:** Internal

> **Changelog v01 → v02:**
> - Arsitektur endpoint: 7 → 8 (`/api/tactical-briefing` ditambahkan)
> - Prompt architecture: single-call → 3-chain pipeline (GapAnalyzer → ExecutionPlan → CommsWriter)
> - Module baru: `src/tactical-briefing.ts` (387 lines, 6 interfaces, 3 system prompts)
> - DNA fields: 57 → 59 (`peakHours`, `topConvertingChannel`)
> - DailyPulse.tsx: hardcoded checklist → AI-generated, 3-section markdown parser
> - Worker.ts: 406 → 442 lines (route #7 ditambahkan)
> - Frontend route: GitHub Actions auto-deploy ke GitHub Pages via `gh-pages` branch

---

## 1. Ringkasan Arsitektur Saat Ini

Platform MaxSales menggunakan arsitektur **dual-backend** dengan dua implementasi server:

| Komponen | Teknologi | Fungsi | v02 Changes |
|----------|-----------|--------|-------------|
| **Frontend** | React 19 + TypeScript + Vite 6 + Tailwind CSS v4 | UI dashboard 6 modul | +Performa Real-Time tab di DNA |
| **Backend Dev** | Express.js (`server.ts`, ~654 lines) | Development & local testing | +route tactical-briefing |
| **Backend Prod** | Cloudflare Workers + Hono (`worker.ts`, ~442 lines) | Edge production deployment | +route tactical-briefing |
| **AI Provider** | OpenRouter API (openai/gpt-oss-120b:free) | Semua endpoint AI | +3-chain sequential calls |
| **Shared Module** | `src/tactical-briefing.ts` (387 lines) | Prompt chain logic | **NEW** |
| **Storage** | In-memory + localStorage (ephemeral) | Tidak ada database persisten | Unchanged |
| **Domain** | maxsales.qzz.io via GitHub Pages + Cloudflare | Hosting frontend | Unchanged |

---

## 2. Diagram Arsitektur Saat Ini (v02)

```
┌──────────────────────────────────────────────────────────┐
│                     Browser User                          │
│                (React 19 SPA — Vite)                       │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │  DailyPulse.tsx (613 → 624 lines)                 │    │
│  │  • buildTacticalInput() — map ChainContext → API  │    │
│  │  • parseTacticalMarkdown() — split 3 sections     │    │
│  │  • 3-section UI: Celah + Eksekusi + Amunisi      │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  BusinessCanvas.tsx (616 → 660 lines)             │    │
│  │  • 6 tabs (+"Performa Real-Time")                 │    │
│  │  • peakHours input + topConvertingChannel select  │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│              GitHub Pages / Cloudflare CDN                 │
│              ┌──────────────────────────────────┐        │
│              │  Frontend: dist/ via gh-pages     │        │
│              └──────────────────────────────────┘        │
└─────────────────────┬────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐    ┌────────────────────────────┐
│ Express Dev   │    │ Cloudflare Worker (Prod)    │
│ server.ts     │    │ worker.ts                   │
│ (localhost)   │    │ (voxia-api.workers.dev)     │
│               │    │                             │
│ 8 endpoints   │    │ 8 endpoints                 │
│ + route #5    │    │ + route #7 (tactical)       │
└───────┬───────┘    └──────────┬─────────────────┘
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │   src/tactical-briefing │  ← SHARED MODULE
        │        .ts              │
        │  • generateTactical     │
        │    Briefing()           │
        │  • generateFallback     │
        │    Briefing()           │
        │  • 3 system prompts     │
        │  • extractJson()        │
        └───────────┬─────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │   OpenRouter API         │
        │   openai/gpt-oss-120b   │
        │                         │
        │   Chain 1: GapAnalyzer  │
        │      ↓                  │
        │   Chain 2: ExecPlan     │
        │      ↓                  │
        │   Chain 3: CommsWriter  │
        └─────────────────────────┘
```

---

## 3. 3-Chain Prompt Architecture (NEW)

Tactical briefing menggunakan arsitektur **sequential prompt chaining** berbeda dengan endpoint lain yang single-call:

| Chain | System Prompt | Temperature | Max Tokens | Output |
|-------|--------------|-------------|------------|--------|
| **1. GapAnalyzer** | Analis Bisnis Tajam untuk Pengusaha | 0.25 | 256 | JSON `{gap, revenueImpact}` |
| **2. ExecutionPlan** | Pelatih Bisnis Lapangan | 0.25 | 256 | JSON `{steps[]}` |
| **3. CommsWriter** | Penulis Konten Bisnis | 0.25 | 512 | Markdown (3 sections) |

**Terminology Constraint:** SELURUH system prompt dan user prompt DILARANG menggunakan "UMKM", "UKM", "Usaha Kecil", "Mikro". Wajib menggunakan "Pengusaha", "Pelaku Usaha", atau nama brand.

**Performance:** 3 sequential API calls → estimated 4-8 detik total latency via OpenRouter.

**Fallback:** `generateFallbackBriefing()` menyediakan briefing statis dengan data aktual saat API key tidak tersedia.

---

## 4. Data Flow: User Click → AI Output

```
User klik "Acak Tips Baru" di DailyPulse
  │
  ▼
DailyPulse.tsx: fetchBriefing()
  │
  ├─ buildTacticalInput()
  │   ├─ dna (dari ChainContext + localStorage)
  │   │   ├─ brand, productName, category, advantages
  │   │   ├─ normalPrice, targetMonthlyRevenue
  │   │   ├─ activeSocialMedia, businessContact
  │   │   ├─ peakHours ⭐ NEW
  │   │   └─ topConvertingChannel ⭐ NEW
  │   ├─ warRoom (dari CompetitorWarRoom state)
  │   │   └─ competitors[], threats, opportunities
  │   ├─ customerInsight (dari CustomerInsight state)
  │   │   └─ topSegment, complaints, desires
  │   └─ daily (dari revenue tracker + strategy)
  │       └─ revenue, target, achievement, strategies
  │
  ▼
POST /api/tactical-briefing
  │
  ├─ [API Key Tersedia?]
  │   ├─ YES → generateTacticalBriefing(input, llmAdapter)
  │   │   ├─ Chain 1: callOpenRouter(GAP_ANALYZER_SYSTEM, ...)
  │   │   ├─ Chain 2: callOpenRouter(EXECUTION_PLANNER_SYSTEM, ...)
  │   │   └─ Chain 3: callOpenRouter(COMMS_WRITER_SYSTEM, ...)
  │   └─ NO  → generateFallbackBriefing(input)
  │
  ▼
Response: { markdown, meta, mode }
  │
  ▼
DailyPulse.tsx: parseTacticalMarkdown(markdown)
  ├─ Section 1 → setTacticalGap() → Morning Briefing box
  ├─ Section 2 → setTacticalSteps() → Checklist items
  └─ Section 3 → setWaTemplate() + setSocialCopy() → Amunisi Komunikasi box
```

---

## 5. Perubahan Signifikan dari v01

| Aspek | v01 (23 Juni) | v02 (25 Juni) | Dampak Migrasi |
|-------|--------------|--------------|----------------|
| **Endpoint** | 7 | 8 | +1 endpoint untuk test & Cosmos DB |
| **Prompt calls** | Single | Single + 3-chain | 3x latency, perlu retry logic |
| **Module count** | — | +1 shared module | Konsolidasi ke `src/tactical-briefing.ts` |
| **DNA fields** | 57 | 59 | Cosmos DB schema update |
| **UI tabs** | 5 | 6 | +"Performa Real-Time" tab |
| **Checklist source** | Hardcoded | AI-generated | Parser markdown di frontend |
| **Worker lines** | 406 | 442 | +36 lines (import + route handler) |
| **Temperature** | 0.7-0.8 (creative) | 0.25 (tactical) | Prompt parameterization di config |
| **Terminology** | Mixed | Strict: zero "UMKM/UKM" | System prompt audit needed |

---

## 6. Code Duplication Status

| Fungsi | worker.ts | server.ts | src/tactical-briefing.ts | Duplikasi? |
|--------|-----------|-----------|-------------------------|------------|
| `callOpenRouter()` | ✅ | ✅ | — | **Ya (2x)** |
| `parseJsonResponse()` | ✅ | ✅ | — | **Ya (2x)** |
| `extractJson()` | — | — | ✅ | Tidak |
| `generateTacticalBriefing()` | — | — | ✅ | Tidak |
| `generateFallbackBriefing()` | — | — | ✅ | Tidak |
| System prompts | — | — | ✅ (3 prompts) | Tidak |

**Rekomendasi:** Saat migrasi ke Azure, gabungkan `callOpenRouter()` dan `parseJsonResponse()` ke shared utility module untuk menghilangkan duplikasi worker.ts ↔ server.ts. `src/tactical-briefing.ts` adalah contoh sukses shared module pattern.

---

*Dokumen analisis arsitektur — diperbarui untuk mencerminkan 8-endpoint, 3-chain prompt, dan 2 field DNA baru*
*Source: worker.ts, server.ts, src/tactical-briefing.ts, src/types.ts, src/components/DailyPulse.tsx*