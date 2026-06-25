# Analisis Arsitektur MaxSales - Current State
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Ringkasan Arsitektur Saat Ini

Platform MaxSales menggunakan arsitektur **dual-backend** dengan dua implementasi server yang identik secara fungsional namun berbeda secara runtime:

| Komponen | Teknologi | Fungsi |
|----------|-----------|--------|
| **Frontend** | React 19 + TypeScript + Vite 6 + Tailwind CSS v4 | UI dashboard 5 modul |
| **Backend Dev** | Express.js (`server.ts`, 621 baris) | Development & local testing |
| **Backend Prod** | Cloudflare Workers + Hono (`worker.ts`, 406 baris) | Edge production deployment |
| **AI Provider** | OpenRouter API (model: openai/gpt-oss-120b:free) | Semua endpoint AI |
| **Storage** | In-memory + localStorage (ephemeral) | Tidak ada database persisten |
| **Domain** | maxsales.qzz.io via GitHub Pages + Cloudflare | Hosting frontend |

---

## 2. Diagram Arsitektur Saat Ini

```
┌─────────────────────────────────────────────────────┐
│                    Browser User                       │
│              (React 19 SPA - Vite)                    │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              GitHub Pages / Cloudflare CDN            │
│              ┌──────────────────────────────┐        │
│              │  Frontend: .next/dist assets  │        │
│              └──────────────────────────────┘        │
└────────────────────────┬────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
┌──────────────────┐    ┌────────────────────────┐
│  Express.js       │    │  Cloudflare Workers     │
│  (server.ts)      │    │  (worker.ts - Hono)     │
│  - Port 3001      │    │  - Edge Runtime         │
│  - Local Dev      │    │  - Global CDN           │
│  - All 7 Endpoint │    │  - All 7 Endpoint       │
└──────┬───────────┘    └────────┬───────────────┘
       │                         │
       └──────────┬──────────────┘
                  ▼
┌─────────────────────────────────────┐
│        OpenRouter API                │
│  openai/gpt-oss-120b:free (default) │
│  Fallback: Local Simulation Mode    │
└─────────────────────────────────────┘
```

---

## 3. Analisis Setiap Endpoint

### 3.1 GET `/api/status`
| Aspek | Detail |
|-------|--------|
| **Deskripsi** | Health check, mengembalikan status server + mode AI |
| **Respon** | `{ status, aiMode, message, version }` |
| **Kompleksitas** | Rendah (tanpa AI call) |
| **Dependencies** | Tidak ada |

### 3.2 POST `/api/generate-content-text`
| Aspek | Detail |
|-------|--------|
| **Deskripsi** | Generate konten promosi (headline, caption, hashtag) |
| **Input** | `{ productDescription, targetAudience, contentGoals }` |
| **Respon** | `{ headlines[], captions[], hashtags[], variations[] }` |
| **Kompleksitas** | Tinggi (3 template prompt AI berbeda) |
| **Dependencies** | OpenRouter / Simulation |

### 3.3 POST `/api/strategy-forge`
| Aspek | Detail |
|-------|--------|
| **Deskripsi** | Generate strategi marketing 5-11 pillar |
| **Input** | `{ businessData, competitors[], segments[], ... }` |
| **Respon** | `{ strategies: StrategyArea[] }` (11 area) |
| **Kompleksitas** | Sangat Tinggi (data aggregation + AI generation) |
| **Dependencies** | OpenRouter + data canvas + competitor + segment |

### 3.4 POST `/api/daily-pulse`
| Aspek | Detail |
|-------|--------|
| **Deskripsi** | Morning briefing AI - leads, KPI tracker, insight |
| **Input** | `{ businessData, dailyActivities, ... }` |
| **Respon** | `{ leadUpdates, kpiTracker, dailyBrief, weatherForecast }` |
| **Kompleksitas** | Tinggi (multi-template AI generation) |
| **Dependencies** | OpenRouter |

### 3.5 POST `/api/analyze-competitor`
| Aspek | Detail |
|-------|--------|
| **Deskripsi** | Analisis SWOT kompetitor |
| **Input** | `{ businessData, competitors[] }` |
| **Respon** | `{ strengths, weaknesses, opportunities, threats }` |
| **Kompleksitas** | Sedang (analisis per kompetitor) |
| **Dependencies** | OpenRouter |

### 3.6 POST `/api/analyze-segments`
| Aspek | Detail |
|-------|--------|
| **Deskripsi** | Segmentasi pelanggan - LTV, churn risk |
| **Input** | `{ businessData, segments[] }` |
| **Respon** | `{ segments[], recommendations }` |
| **Kompleksitas** | Sedang |
| **Dependencies** | OpenRouter |

### 3.7 POST `/api/chat`
| Aspek | Detail |
|-------|--------|
| **Deskripsi** | AI co-pilot chatbot dengan full context bisnis |
| **Input** | `{ message, businessData, competitors[], segments[] }` |
| **Respon** | `{ reply: string }` |
| **Kompleksitas** | Tinggi (context-aware conversation) |
| **Dependencies** | OpenRouter + full business data |

---

## 4. Analisis Kode

### 4.1 Fungsi Utama yang Dikonsolidasi

| Fungsi | Lokasi | Digunakan Oleh | Baris |
|--------|--------|----------------|-------|
| `callOpenRouter()` | worker.ts:28-59, server.ts:30-63 | Semua endpoint AI | ~35 |
| `parseJsonResponse()` | worker.ts:61-95, server.ts:65-99 | Semua endpoint AI | ~35 |
| `generateContentText()` | worker.ts:97-147, server.ts:101-160 | Endpoint content | ~50 |
| `strategyForge()` | worker.ts:149-225, server.ts:162-260 | Endpoint strategy | ~75 |
| `dailyPulse()` | worker.ts:227-290, server.ts:262-325 | Endpoint daily | ~65 |
| `analyzeCompetitor()` | worker.ts:292-330, server.ts:327-365 | Endpoint competitor | ~40 |
| `analyzeSegments()` | worker.ts:332-365, server.ts:367-400 | Endpoint segments | ~35 |
| `chatHandler()` | worker.ts:367-406, server.ts:402-441 | Endpoint chat | ~40 |

### 4.2 Duplikasi Kode

Terdapat **duplikasi hampir 100%** antara worker.ts dan server.ts:
- Kedua file memiliki fungsi helper yang identik (`callOpenRouter`, `parseJsonResponse`)
- Semua handler endpoint diimplementasikan dua kali
- Perbedaan utama: import (Hono vs Express), konfigurasi CORS, cara serve static files

**Potensi masalah:** Setiap perubahan API harus dilakukan di dua file, meningkatkan risiko inkonsistensi.

---

## 5. Analisis Data & State

### 5.1 Model Data Utama

| Interface | Field | Source | Deskripsi |
|-----------|-------|--------|-----------|
| `BusinessCanvasData` | 56 fields | `src/types.ts` | Profil bisnis lengkap |
| `CompetitorIntel` | 11 fields | `src/types.ts` | Data kompetitor |
| `CustomerSegment` | 8 fields | `src/types.ts` | Segmen pelanggan |
| `StrategyArea` | 5 fields | `src/types.ts` | Area strategi |
| `GeneratedContentText` | 11 fields | `src/types.ts` | Konten generated |
| `DailyPulseData` | 12 fields | `src/types.ts` | Daily metrics |

### 5.2 Masalah Storage Saat Ini

| Masalah | Dampak |
|---------|--------|
| **In-memory storage** | Data hilang saat server restart |
| **localStorage browser** | Data tidak bisa di-share antar session/user |
| **Tidak ada persistensi** | Tidak ada history, analytics, atau personalisasi |
| **Backup zero** | Risiko kehilangan data total |

---

## 6. Identifikasi Risiko Arsitektur Saat Ini

| Risiko | Level | Deskripsi | Mitigasi |
|--------|-------|-----------|----------|
| Code Duplikasi | 🔴 Tinggi | worker.ts vs server.ts | Konsolidasi ke adapter pattern |
| Zero Database | 🔴 Tinggi | Semua data ephemeral | Migrasi ke Cosmos DB |
| Runtime Mismatch | 🟡 Sedang | Workers berbeda dengan Node.js | Gunakan Azure Functions |
| OpenRouter Single Point | 🟡 Sedang | Satu provider AI | Multi-provider fallback |
| No CI/CD Azure | 🟡 Sedang | Hanya GitHub Pages | GitHub Actions ke Azure |
| No Monitoring | 🟡 Sedang | Tidak ada telemetry | Azure Monitor + App Insights |

---

## 7. Rekomendasi Awal

1. **Konsolidasi Backend**: Satukan worker.ts + server.ts menjadi satu Azure Function codebase
2. **Adapter Pattern**: Buat AI adapter yang mendukung multi-provider
3. **Migrasi Database**: Implementasi Cosmos DB dengan schema untuk business canvas, competitors, segments
4. **Frontend Update**: Update axios calls ke base URL endpoint baru
5. **CI/CD Pipeline**: GitHub Actions deploy ke Azure Functions + Static Web Apps

---

*Dokumen ini adalah bagian dari rencana migrasi MaxSales ke Azure*
*Referensi: worker.ts, server.ts, src/types.ts, package.json*
