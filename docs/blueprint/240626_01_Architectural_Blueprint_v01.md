# Architectural Blueprint & Data Lineage

**Versi:** v01 — 24 Juni 2026  
**Modul:** 01 of 04

---

## 1. Ringkasan Arsitektur Saat Ini

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         App.tsx (Root)                              │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────────────────────┐  │
│  │ Landing  │ │  Login   │ │            Dashboard               │  │
│  │  Page    │ │          │ │  ┌──────────┐ ┌───────────────┐    │  │
│  └──────────┘ └──────────┘ │  │ Sidebar  │ │  Content Area │    │  │
│                            │  │ ┌──────┐ │ │ ┌─────────────┐│    │  │
│  ┌──────────┐              │  │ │User  │ │ │ │Competitor   ││    │  │
│  │ Floating │              │  │ │Menu  │ │ │ │WarRoom      ││    │  │
│  │ Chatbot  │              │  │ ├──────┤ │ │ ├─────────────┤│    │  │
│  └──────────┘              │  │ │Streak│ │ │ │Customer     ││    │  │
│                            │  │ │Card  │ │ │ │Insight      ││    │  │
│  ┌──────────┐              │  │ ├──────┤ │ │ ├─────────────┤│    │  │
│  │  Footer  │              │  │ │Tab   │ │ │ │Strategy     ││    │  │
│  └──────────┘              │  │ │Nav   │ │ │ │Forge        ││    │  │
│                            │  │ └──────┘ │ │ ├─────────────┤│    │  │
│                            │  └──────────┘ │ │Content      ││    │  │
│                            │               │ │Generator    ││    │  │
│                            │               │ ├─────────────┤│    │  │
│                            │               │ │DailyPulse   ││    │  │
│                            │               │ └─────────────┘│    │  │
│                            │               └────────────────┘    │  │
│                            └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.1 Routing Strategy

**Tidak menggunakan React Router / Next.js Router.**  
Routing diimplementasikan dengan state `currentTab` + conditional rendering di `App.tsx`:

```typescript
const [currentTab, setTab] = useState<"landing" | "login" | "dashboard" | "docs">("landing");

// Render:
{currentTab === "landing" && <LandingPage .../>}
{currentTab === "login" && <Login .../>}
{currentTab === "dashboard" && isLoggedIn && (...)}
```

Dashboard internal navigation menggunakan `dashTab`:

```typescript
const [dashTab, setDashTab] = useState<"competitor" | "customer" | "strategy" | "content" | "pulse">("competitor");
```

**Keputusan:** Simple dan efektif untuk MVP, tetapi tidak mendukung URL-based routing (tidak bisa bookmark halaman tertentu, tidak ada browser back/forward).

---

## 2. Global State Topology

Semua state hidup di `App.tsx` sebagai `useState` hooks, tanpa Context API, Redux, atau Zustand.

### 2.1 State Registry Lengkap

| ID | State Variable | Tipe | Default | Ditulis Oleh | Dibaca Oleh | Persisted |
|----|---------------|------|---------|-------------|-------------|-----------|
| S1 | `darkMode` | `boolean` | `true` | Header, LandingPage | Global (class `dark` di `<html>`) | ❌ |
| S2 | `currentTab` | enum routing | `"landing"` | App, Header, LandingPage, Footer | App (render conditional) | ❌ |
| S3 | `isLoggedIn` | `boolean` | localStorage check | Login | App, Header | ✅ `maxx_sales_logged_in` |
| S4 | `isDnaFilled` | `boolean` | localStorage check | BusinessCanvas (wizard save) | App | ✅ `maxx_sales_dna_filled` |
| S5 | `dashTab` | enum features | `"competitor"` | Sidebar, UserTour | App | ❌ |
| S6 | `canvas` | `BusinessCanvasData` | `defaultCanvasData()` | BusinessCanvas wizard | ALL 5 modules + FloatingChatbot | ✅ `maxx_sales_dna` |
| S7 | `competitors` | `CompetitorIntel[]` | `defaultCompetitors()` | CompetitorWarRoom | App (engagement auto-detect) | ✅ `maxx_sales_competitors` |
| S8 | `segments` | `CustomerSegment[]` | `defaultSegments()` | CustomerInsight | App (engagement auto-detect) | ✅ `maxx_sales_segments` |
| S9 | `featureEngagement` | object | all false | App (auto-detect), Sidebar checkbox | Sidebar (progress bar) | ✅ `maxx_sales_feature_engagement_v2` |
| S10 | `streak` | object | `{count:3, ...}` | App (auto-increment), DailyPulse | Sidebar (streak card) | ✅ `maxx_sales_streak_info_v2` |

### 2.2 Data Flow Diagram — Saat Ini (Siloed)

```text
                         ┌──────────────────┐
                         │   App.tsx State   │
                         │                   │
                         │  ┌──────────────┐ │
                         │  │ Canvas (DNA) │ │
                         │  └──────┬───────┘ │
                         │         │         │
                         │  ┌──────┴───────┐ │
                         │  │ Competitors  │ │
                         │  └──────┬───────┘ │
                         │         │         │
                         │  ┌──────┴───────┐ │
                         │  │  Segments    │ │
                         │  └──────┬───────┘ │
                         │         │         │
                         │  ┌──────┴───────┐ │
                         │  │ Engagement   │ │
                         │  │  & Streak    │ │
                         │  └──────────────┘ │
                         └────────┬──────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
     │  Strategy    │    │   Content    │    │  DailyPulse  │
     │  Forge       │    │  Generator   │    │              │
     │              │    │              │    │              │
     │ ✓ reads DNA  │    │ ✓ reads DNA  │    │ ✓ reads DNA  │
     │ ✗ reads comp │    │ ✗ reads seg  │    │ ✗ reads strat│
     │ ✗ writes out │    │ ✗ saves hist │    │ ✗ writes back│
     └──────────────┘    └──────────────┘    └──────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
     │  API Call    │    │  API Call    │    │  API Call    │
     │  (ephemeral) │    │  (ephemeral) │    │  (ephemeral) │
     └──────────────┘    └──────────────┘    └──────────────┘
```

### 2.3 Critical Finding — Data Lineage Terputus

Tidak ada satupun output dari modul terdaftar di global state:

| Modul | Output | Ke Mana? | Problem |
|-------|--------|----------|---------|
| StrategyForge | `pillars: StrategyArea[]`, `synopsis: string` | Hanya di-render di UI | Hilang saat tab switch |
| ContentGenerator | `headline, caption, hashtags, overlay text` | Hanya di-render di canvas | Hilang saat tab switch |
| DailyPulse | `briefing: string` + checklist completion | Hanya di-render di UI | Hilang saat tab switch |

**Dampak:** Sistem tidak bisa belajar dari output sendiri. Tidak mungkin membuat "growth dashboard" yang menampilkan ringkasan sejarah aktivitas.

---

## 3. Dependency Mapping per Modul

### 3.1 CompetitorWarRoom

```typescript
interface Props {
  dna: BusinessCanvasData;          // read-only — untuk referensi produk
  competitors: CompetitorIntel[];   // read-write — mutable
  setCompetitors: Dispatch<...>;    // write back ke App.tsx
}
```

**Dependency:** `competitors` array — user dapat add/remove/edit competitor entries.  
**Side Effect:** `App.tsx` auto-detect `competitors.length > 2` → set `featureEngagement.competitor = true`.  
**No API call** — fully client-side.

### 3.2 CustomerInsight

```typescript
interface Props {
  dna: BusinessCanvasData;          // read-only
  segments: CustomerSegment[];      // read-write — mutable
  setSegments: Dispatch<...>;       // write back ke App.tsx
}
```

**Dependency:** `segments` array — user dapat add/remove/edit segment entries.  
**Side Effect:** `App.tsx` auto-detect `segments.length > 4` → set `featureEngagement.customer = true`.  
**AI segment analysis:** API call untuk analisis segmen (read-only, output tidak disimpan).

### 3.3 StrategyForge

```typescript
interface Props {
  dna: BusinessCanvasData;          // read-only
}
```

**Dependency:** Hanya DNA — tidak membaca `competitors` atau `segments`.  
**API Call:** `POST /api/strategy-forge` dengan body `{ dna, optimismLevel }`.  
**Output:** `StrategyArea[]` + `synopsis` — hanya di-render, tidak disimpan.

### 3.4 ContentGenerator

```typescript
interface Props {
  dna: BusinessCanvasData;          // read-only
}
```

**Dependency:** Hanya DNA.  
**API Call:** `POST /api/generate-content-text` untuk generate caption + hashtags.  
**Rendering:** Canvas 2D overlay dengan promo text + background gradient/filter.  
**Output:** Tidak ada persistence.

### 3.5 DailyPulse

```typescript
interface Props {
  dna: BusinessCanvasData;          // read-only
}
```

**Dependency:** Hanya DNA + lokal state (`completedItems`).  
**API Call:** `POST /api/daily-pulse` dengan body `{ dna, completedCount }`.  
**Side Effect:** Menambah `streak.count` setiap visit + XP reward.

---

## 4. Data Lineage — Target Closed-Loop

### 4.1 Proposed Dependency Graph

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       BusinessCanvas (DNA)                          │
│  brand, productName, advantages, targetMarket, priceRange, etc.    │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CompetitorWarRoom                               │
│  ──► CompetitorIntel[]                                              │
│      { name, strengths, weaknesses, price, marketShare }            │
└────────────────┬────────────────────────────────────────────────────┘
                 │ competitors[]
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CustomerInsight                                 │
│  ──► CustomerSegment[]                                              │
│      { name, count, ltv, churnRisk, behavior }                      │
└────────────────┬────────────────────────────────────────────────────┘
                 │ segments[]
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        StrategyForge                                │
│  Input:  dna + competitors[] + segments[] + optimismLevel           │
│  Output: StrategyArea[] + synopsis + priorityActions[]              │
│  ──► strategyOutput                                                 │
└────────────────┬────────────────────────────────────────────────────┘
                 │ strategyOutput (new state)
                 ├────────────────────────────────────┐
                 ▼                                    ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│      ContentGenerator        │    │        DailyPulse            │
│  Input: dna + strategyOutput │    │  Input: dna + strategyOutput │
│         + segment context    │    │         + past completions   │
│  Output: ContentHistory[]    │    │  Output: PulseRecord[]       │
│  ──► GeneratedContent[]      │    │  ──► dailyRecords[]          │
└──────────────────────────────┘    └──────────────┬───────────────┘
                                                    │ dailyRecords[]
                                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     GrowthDashboard (NEW)                           │
│  Menampilkan closed-loop metrics:                                   │
│  - Weekly performance score (0-100)                                 │
│  - Strategy effectiveness (by completion rate)                      │
│  - Content engagement correlation                                   │
│  - Competitor response tracking                                     │
│  - AI-suggested next actions                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 State Additions Required

| State Baru | Tipe | Diisi Oleh | Digunakan Oleh |
|------------|------|-----------|----------------|
| `strategyOutput` | `StrategyOutput \| null` | StrategyForge | ContentGenerator, DailyPulse |
| `contentHistory` | `ContentHistoryItem[]` | ContentGenerator | GrowthDashboard |
| `dailyRecords` | `DailyPulseRecord[]` | DailyPulse | StrategyForge (progress feedback), GrowthDashboard |
| `growthMetrics` | `GrowthMetrics` | GrowthDashboard | AI auto-review |

---

## 5. API Contract Analysis

### 5.1 Endpoint yang Ada

| Endpoint | Method | Payload | Response | Error Handling |
|----------|--------|---------|----------|---------------|
| `/api/strategy-forge` | POST | `{ dna, optimismLevel }` | `{ pillars, synopsis }` | `console.error` + `alert()` — tidak graceful |
| `/api/generate-content-text` | POST | `{ dna, headline, ... }` | `GeneratedContentText` | Tidak ada error handling |
| `/api/daily-pulse` | POST | `{ dna, completedCount }` | `{ briefing }` | `console.error` — tidak graceful |

### 5.2 Konsistensi

- ✅ Semua endpoint menerima `dna` sebagai parameter — konsisten
- ✅ Semua endpoint menggunakan POST — sesuai untuk operasi yang memicu AI computation
- ❌ Tidak ada response type validation — response langsung digunakan tanpa type guard
- ❌ Tidak ada timeout handling — request bisa hang indefinitely
- ❌ Tidak ada retry logic — network error langsung menampilkan error ke user

---

## 6. Rekomendasi Arsitektur

### 6.1 Jangka Pendek (Fase 1)

1. **Extract global state ke Context API** — buat `GrowthStateContext` dengan provider di `App.tsx`
2. **Simpan output AI ke state** — strategyOutput, contentHistory, dailyRecords
3. **Implement simple error boundary** untuk mencegah crash global

### 6.2 Jangka Menengah (Fase 2-3)

1. **Migration ke Zustand** jika Context API terbukti lambat
2. **API response caching** — jangan panggil ulang endpoint jika data DNA tidak berubah
3. **Implement data lineage validator** — pastikan tiap edge graph memiliki handler

### 6.3 Jangka Panjang (Fase 4)

1. **Circular intelligence engine** — sistem yang membaca output historis dan memberikan insight lintas-modul
2. **Growth state export/import** — user bisa backup dan restore seluruh state
3. **Offline-first architecture** — semua AI call bisa di-cache dan sync saat online
