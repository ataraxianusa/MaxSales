# Inventarisasi Endpoint API MaxSales
**Versi:** v03 | **Tanggal:** 2026-06-30 | **Klasifikasi:** Internal

> **Changelog v02 → v03:**
> - Worker.ts berkembang dari 442 → 986 lines, 8 → 15 endpoint
> - 7 endpoint baru di worker.ts: suggest-content, scrape-competitor, instagram-scrape, facebook-scrape, auto-segment, predict-revenue, cluster-customers
> - Server.ts tetap 8 endpoint (gap 7 endpoint dengan worker.ts)
> - Dependensi baru: Apify API (Instagram & Facebook scraping)
> - Shared module `src/tactical-briefing.ts` tetap digunakan kedua backend

---

## 1. Ringkasan Endpoint

| # | Endpoint | Method | AI Calls | Server.ts | Worker.ts | Complexity | Priority |
|---|----------|--------|----------|-----------|-----------|------------|----------|
| 1 | `/api/status` | GET | 0 | ✅ | ✅ | Rendah | P0 |
| 2 | `/api/generate-content-text` | POST | 1 | ✅ | ✅ | Tinggi | P0 |
| 3 | `/api/suggest-content` | POST | 1 | ❌ | ✅ | Tinggi | P1 |
| 4 | `/api/strategy-forge` | POST | 1 | ✅ | ✅ | Sangat Tinggi | P0 |
| 5 | `/api/daily-pulse` | POST | 1 (legacy) | ✅ | ✅ | Tinggi | P1 |
| 6 | `/api/analyze-competitor` | POST | 1 | ✅ | ✅ | Sedang | P0 |
| 7 | `/api/scrape-competitor` | POST | 0 (external) | ❌ | ✅ | Tinggi | P1 |
| 8 | `/api/instagram-scrape` | POST | 0 (Apify) | ❌ | ✅ | Tinggi | P1 |
| 9 | `/api/facebook-scrape` | POST | 0 (Apify) | ❌ | ✅ | Tinggi | P1 |
| 10 | `/api/analyze-segments` | POST | 1 | ✅ | ✅ | Sedang | P1 |
| 11 | `/api/auto-segment` | POST | 1 | ❌ | ✅ | Sedang | P1 |
| 12 | `/api/predict-revenue` | POST | 1 | ❌ | ✅ | Sedang | P2 |
| 13 | `/api/cluster-customers` | POST | 1 | ❌ | ✅ | Sedang | P2 |
| 14 | `/api/chat` | POST | 1 | ✅ | ✅ | Tinggi | P0 |
| 15 | `/api/tactical-briefing` | POST | 3 (chain) | ✅ | ✅ | Sangat Tinggi | P0 |

**Total AI calls per session:** 1-3 (single endpoint) hingga 12+ (full workflow)
**External dependencies:** OpenRouter API, Apify API (Instagram + Facebook scrapers)

---

## 2. Detail Endpoint Baru (sejak v02)

### 2.1 POST `/api/suggest-content` — Content Hook Generator

**File:** worker.ts:144-216 | **Server.ts:** ❌ Tidak ada

Menerima DNA + targetSegments, return 5 hooks + 5 CTAs + 5 captions. Bedanya dengan `/api/generate-content-text`: endpoint ini menghasilkan variasi konten (brainstorming) sedangkan generate-content-text menghasilkan satu konten final.

**AI call:** 1 (temperature: 0.9 — creative)
**Azure migration:** Port ke Azure Function. Output bisa di-cache dengan TTL pendek (5 menit).

### 2.2 POST `/api/scrape-competitor` — DuckDuckGo Search

**File:** worker.ts:379-441 | **Server.ts:** ❌ Tidak ada

Scraping DuckDuckGo HTML untuk mencari informasi kompetitor. **Tanpa API key** — pure HTML parsing. Mengekstrak search results + social media links (Instagram, TikTok, Shopee).

**Dependencies:** Zero external API. Pure `fetch()` + regex.
**Azure migration:** Port ke Azure Function. Tambahkan rate limiting (mudah di-blok DuckDuckGo). Pertimbangkan Azure Bing Search API sebagai alternatif lebih reliable.
**Risk:** HTML parsing fragile — DuckDuckGo bisa berubah struktur kapan saja.

### 2.3 POST `/api/instagram-scrape` — Apify Instagram Scraper

**File:** worker.ts:443-540 | **Server.ts:** ❌ Tidak ada

Menggunakan Apify actor `apify~instagram-profile-scraper` untuk scraping profil Instagram. Flow: start run → poll status (max 25 attempts × 2 detik = 50 detik) → fetch dataset items.

**Dependencies:** `APIFY_TOKEN` (env secret)
**Azure migration:** Perlu Azure Key Vault untuk `APIFY_TOKEN`. Cold start + 50 detik timeout = perlu Azure Functions timeout config (default 5 menit, cukup). Pertimbangkan Durable Functions untuk long-running pattern.
**Latency:** 5-50 detik (tergantung Apify actor speed).

### 2.4 POST `/api/facebook-scrape` — Apify Facebook Scraper

**File:** worker.ts:542-637 | **Server.ts:** ❌ Tidak ada

Sama dengan Instagram scraper tetapi menggunakan actor `apify~facebook-pages-scraper`. Flow identik: start → poll → fetch.

**Dependencies:** `APIFY_TOKEN`
**Azure migration:** Pooling pattern sama dengan Instagram scraper. Keduanya bisa dijadikan durable function tunggal dengan parameter actor type.

### 2.5 POST `/api/auto-segment` — AI Customer Segment Generator

**File:** worker.ts:718-783 | **Server.ts:** ❌ Tidak ada

Generate 4-6 segmen pelanggan dari DNA bisnis. Menerima full DNA object, return array segmen dengan percentage + channel + avgTransaction + frequency + risk.

**AI call:** 1 (temperature: 0.8, maxTokens: 1024)
**Azure migration:** Port ke Azure Function. Output bisa disimpan ke Cosmos DB container `segments`.

### 2.6 POST `/api/predict-revenue` — Revenue Prediction Per Segment

**File:** worker.ts:785-855 | **Server.ts:** ❌ Tidak ada

Prediksi revenue per segmen + total bulanan. Input: DNA + segments array. Output: predictions array + totalMonthly + recommendation.

**AI call:** 1 (temperature: 0.7, maxTokens: 1024)
**Azure migration:** Port ke Azure Function.

### 2.7 POST `/api/cluster-customers` — Behavioral Customer Clustering

**File:** worker.ts:857-926 | **Server.ts:** ❌ Tidak ada

Klusterisasi pelanggan berdasarkan perilaku beli (4-5 clusters). Input: DNA + segments. Output: clusters array dengan name, description, percentage, channel, strategy.

**AI call:** 1 (temperature: 0.8, maxTokens: 1024)
**Azure migration:** Port ke Azure Function.

---

## 3. Dependency Graph (v03)

```
/status [0 deps]
  → return JSON status

/generate-content-text [1 AI call]
  → callOpenRouter() → parseJsonResponse()

/suggest-content [1 AI call] ⭐ NEW
  → callOpenRouter() → parseJsonResponse()

/strategy-forge [1 AI call]
  → callOpenRouter() → parseJsonResponse()

/daily-pulse [1 AI call, legacy]
  → callOpenRouter() → parseJsonResponse()

/analyze-competitor [1 AI call]
  → callOpenRouter() → parseJsonResponse()

/scrape-competitor [0 AI, external fetch] ⭐ NEW
  → fetch(DuckDuckGo) → regex parsing

/instagram-scrape [0 AI, external API] ⭐ NEW
  → fetch(Apify) → poll → fetch(dataset)

/facebook-scrape [0 AI, external API] ⭐ NEW
  → fetch(Apify) → poll → fetch(dataset)

/analyze-segments [1 AI call]
  → callOpenRouter() → parseJsonResponse()

/auto-segment [1 AI call] ⭐ NEW
  → callOpenRouter() → parseJsonResponse()

/predict-revenue [1 AI call] ⭐ NEW
  → callOpenRouter() → parseJsonResponse()

/cluster-customers [1 AI call] ⭐ NEW
  → callOpenRouter() → parseJsonResponse()

/chat [1 AI call]
  → callOpenRouter()

/tactical-briefing [3 AI calls, chain]
  → Chain 1: callOpenRouter() → extractJson()
      ↓
  → Chain 2: callOpenRouter() → extractJson()
      ↓
  → Chain 3: callOpenRouter() → return Markdown
  → fallback: generateFallbackBriefing()
```

---

## 4. Shared Functions — Duplication Analysis

| Fungsi | worker.ts | server.ts | src/tactical-briefing.ts | Duplikasi? |
|--------|-----------|-----------|-------------------------|------------|
| `callOpenRouter()` | ✅ (lines 21-50) | ✅ (lines 38-65) | — | **Ya (2x) — 29 lines each** |
| `parseJsonResponse()` | ✅ (lines 53-69) | ✅ (lines 68-95) | — | **Ya (2x) — 17/28 lines** |
| `extractJson()` | — | — | ✅ (lines 247-259) | Tidak |
| `generateTacticalBriefing()` | — | — | ✅ (lines 316-389) | Tidak |
| `generateFallbackBriefing()` | — | — | ✅ (lines 265-303) | Tidak |
| System prompts (3) | — | — | ✅ (lines 103-161) | Tidak |
| `JSON_SYSTEM` constant | ✅ (line 71) | ✅ (line 98) | — | **Ya (2x)** |

**Total duplicated lines:** ~80 lines di worker.ts + ~80 lines di server.ts = **160 duplicated lines**
**Resolution:** Konsolidasi ke `src/shared/ai-client.ts` + `src/shared/json-parser.ts`

---

## 5. AI Call Latency Profile

| Endpoint Type | AI Calls | Est. Latency (OpenRouter) | Timeout Risk |
|---------------|----------|---------------------------|--------------|
| Status | 0 | <10ms | None |
| Single-call AI | 1 | 2-4s | Low |
| Tactical briefing (3-chain) | 3 | 6-12s | **Medium** — chain failure mid-way |
| Apify scraper (IG/FB) | 0 (external) | 5-50s | **High** — polling timeout |
| DuckDuckGo scrape | 0 (external) | 1-3s | Low |

---

## 6. Data Model — Cosmos DB Container Mapping

| Container | Partition Key | Documents | Endpoint Producer |
|-----------|--------------|-----------|-------------------|
| `business-dna` | `/userId` | 1 per user | BusinessCanvas UI → save |
| `competitors` | `/userId` | 1-N per user | analyze-competitor, scrape-competitor, instagram-scrape, facebook-scrape |
| `segments` | `/userId` | 4-6 per user | auto-segment, analyze-segments |
| `tactical-briefings` | `/userId` | 1 per day | tactical-briefing |
| `revenue-predictions` | `/userId` | 1 per session | predict-revenue |
| `customer-clusters` | `/userId` | 1 per session | cluster-customers |
| `chat-history` | `/userId` | N per user | chat |
| `content-library` | `/userId` | N per user | generate-content-text, suggest-content |

---

*Dokumen inventarisasi endpoint v03 — mencakup 15 endpoint worker.ts + 8 endpoint server.ts*
*Source: worker.ts (986 lines), server.ts (654 lines), src/tactical-briefing.ts (389 lines)*
