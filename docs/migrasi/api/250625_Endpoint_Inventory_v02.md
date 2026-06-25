# Inventarisasi Endpoint API MaxSales
**Versi:** v02 | **Tanggal:** 2025-06-25 | **Klasifikasi:** Internal

> **Changelog v01 → v02:**
> - Menambahkan endpoint #8: `POST /api/tactical-briefing` (3-chain prompt)
> - Menambahkan modul `src/tactical-briefing.ts` sebagai shared module
> - Menambahkan field DNA baru: `peakHours`, `topConvertingChannel`
> - DailyPulse.tsx berganti dari hardcoded checklist ke AI-generated items
> - Worker.ts diperbarui dengan route #7 (tactical-briefing)

---

## 1. Ringkasan Endpoint

| # | Endpoint | Method | AI Dependency | Chain Calls | Complexity | Priority |
|---|----------|--------|---------------|-------------|------------|----------|
| 1 | `/api/status` | GET | Tidak | 0 | Rendah | P0 |
| 2 | `/api/generate-content-text` | POST | Ya | 1 | Tinggi | P0 |
| 3 | `/api/strategy-forge` | POST | Ya | 1 | Sangat Tinggi | P0 |
| 4 | `/api/daily-pulse` | POST | Ya | 1 (legacy) | Tinggi | P0 |
| 5 | `/api/analyze-competitor` | POST | Ya | 1 | Sedang | P1 |
| 6 | `/api/analyze-segments` | POST | Ya | 1 | Sedang | P1 |
| 7 | `/api/chat` | POST | Ya | 1 | Tinggi | P0 |
| **8** | **`/api/tactical-briefing`** | **POST** | **Ya** | **3 (chain)** | **Sangat Tinggi** | **P0** |

---

## 2. Detail Endpoint

### 2.1 GET `/api/status`

**File referensi:** worker.ts, server.ts  
**Tidak ada perubahan sejak v01.** Direct port, no database needed.

---

### 2.2 POST `/api/generate-content-text`

**File referensi:** worker.ts, server.ts  
**Tidak ada perubahan sejak v01.** Menerima data DNA + promo params, return caption + hashtags.

---

### 2.3 POST `/api/strategy-forge`

**File referensi:** worker.ts, server.ts  
**Tidak ada perubahan sejak v01.** 5-11 pilar strategi dari DNA + kompetitor + customer insight.

---

### 2.4 POST `/api/daily-pulse`

**File referensi:** worker.ts, server.ts  

**Status:** Legacy endpoint — kini telah digantikan oleh `/api/tactical-briefing` untuk output briefing harian. Endpoint ini masih aktif untuk backward compatibility tetapi DailyPulse.tsx frontend sekarang menggunakan tactical-briefing.

---

### 2.5 POST `/api/analyze-competitor`

**File referensi:** worker.ts, server.ts  
**Tidak ada perubahan sejak v01.**

---

### 2.6 POST `/api/analyze-segments`

**File referensi:** worker.ts, server.ts  
**Tidak ada perubahan sejak v01.**

---

### 2.7 POST `/api/chat`

**File referensi:** worker.ts, server.ts  
**Tidak ada perubahan sejak v01.**

---

### 2.8 POST `/api/tactical-briefing` ⭐ NEW

**File referensi:** worker.ts, server.ts, src/tactical-briefing.ts  
**Ditambahkan:** 2025-06-25

```typescript
// Request Body:
interface TacticalBriefingInput {
  dna: {
    brand: string;
    productName: string;
    category: string;
    advantages: string;
    normalPrice: number;
    targetMonthlyRevenue: number;
    activeSocialMedia: string[];
    businessContact: string;
    peakHours: string;              // NEW — jam sibuk transaksi
    topConvertingChannel: string;   // NEW — channel konversi tertinggi
  };
  warRoom: {
    competitors: {
      name: string;
      biggestWeakness: string;
      priceGap: string;
      blindSpot: string;
    }[];
    topMarketThreat: string;
    untappedOpportunity: string;
  };
  customerInsight: {
    topSegment: string;
    topComplaint: string;
    topDesire: string;
    churnRiskSegment: string;
    avgTransactionGap: string;
  };
  daily?: {
    yesterdayRevenue: number;
    todayTarget: number;
    dailyAchievementPct: number;
    activeStrategies: string[];
    pendingItems: string[];
    streakDays: number;
  };
}

// Response:
interface TacticalBriefingOutput {
  markdown: string;   // 3-section Markdown
  meta: {
    model: string;
    temperature: number;     // 0.25 (locked)
    chainLatenciesMs: number[];
    totalTokens: number;
  };
  mode: "live-ai" | "simulated" | "error";
}
```

**3-Chain Prompt Architecture:**

```
Chain 1: GapAnalyzer   (maxTokens: 256, temperature: 0.25)
  Input:  DNA + WarRoom + CustomerInsight + DailyContext
  Output: JSON { gap, revenueImpact, urgency }
  ↓
Chain 2: ExecutionPlan (maxTokens: 256, temperature: 0.25)
  Input:  Gap dari Chain 1 + Channel Aktif + Jam Sibuk
  Output: JSON { steps[], quickWin, expectedOutcome }
  ↓
Chain 3: CommsWriter   (maxTokens: 512, temperature: 0.25)
  Input:  Gap + Plan + Brand + Contact
  Output: Markdown (3 sections)
```

**System Prompt Constraints:**
- DILARANG terminology "UMKM", "UKM", "Usaha Kecil", "Mikro"
- Wajib gunakan "Pengusaha", "Pelaku Usaha", atau nama brand
- Setiap langkah eksekusi WAJIB diawali KATA KERJA AKTIF
- Temperature dikunci 0.25 untuk menekan halusinasi teori
- Prioritaskan eksekusi di jam sibuk & channel konversi tertinggi

**Output Format (Markdown):**
```markdown
### 1. 🎯 Celah Bisnis Hari Ini
[Celah + dampak omzet]

### 2. ⚡ Langkah Eksekusi Strategis
1. **Verb** langkah konkret...
2. **Verb** langkah konkret...

### 3. 💬 Amunisi Komunikasi (Siap Pakai)
**Template WhatsApp:**
[template chat siap copy-paste]

**Copywriting Media Sosial:**
[caption siap copy-paste + hashtag]
```

**Frontend Integration:**
- DailyPulse.tsx → `buildTacticalInput()` memetakan ChainContext state → payload
- `parseTacticalMarkdown()` memecah Markdown ke 3 seksi
- Seksi 1 → "Morning Briefing Co-Pilot" box
- Seksi 2 → "Daftar Pekerjaan Penjualan Harian" checklist (AI-generated, strip markdown)
- Seksi 3 → Box baru "Amunisi Komunikasi" — WA template + caption, copy-paste ready

**Azure Migration:**
- Simpan history briefing di Cosmos DB container `tactical-briefings`
- 3 panggilan LLM berurutan — total latency ~4-8 detik (OpenRouter)
- Perlu timeout handler untuk chain failure di tengah jalan
- Fallback simulator harus selalu tersedia

---

## 3. Shared Functions Analysis

### 3.1 `callOpenRouter()` - AI Provider Call

| Aspek | v01 | v02 |
|-------|-----|-----|
| **Lokasi** | worker.ts, server.ts | worker.ts, server.ts |
| **Penggunaan** | 7 endpoints | 8 endpoints |
| **Tidak berubah.** | | |

### 3.2 `parseJsonResponse()` - AI Response Parser

| Aspek | v01 | v02 |
|-------|-----|-----|
| **Lokasi** | worker.ts, server.ts | worker.ts, server.ts |
| **Penggunaan** | 6 endpoints (JSON) | 6 endpoints (JSON) + internal chain 1 & 2 |
| **Catatan:** Chain 1 & 2 tactical-briefing menggunakan `extractJson()` terpisah di `src/tactical-briefing.ts`. Perlu konsolidasi ke shared utility. | | |

### 3.3 `generateTacticalBriefing()` ⭐ NEW

| Aspek | Detail |
|-------|--------|
| **Lokasi** | src/tactical-briefing.ts |
| **Parameter** | `(input: TacticalBriefingInput, llm: LlmCaller)` |
| **Return** | `Promise<TacticalBriefingOutput>` |
| **Dependency Injection** | `LlmCaller` interface — tidak terikat provider |

### 3.4 `generateFallbackBriefing()` ⭐ NEW

| Aspek | Detail |
|-------|--------|
| **Lokasi** | src/tactical-briefing.ts |
| **Fungsi** | Simulasi briefing statis saat API key tidak tersedia |
| **Output** | Markdown 3-section dengan data aktual dari input |

---

## 4. Dependency Graph (Updated)

```
/status [tidak ada dependensi]
  → langsung return status

/generate-content-text
  → callOpenRouter() → parseJsonResponse()

/strategy-forge
  → callOpenRouter() → parseJsonResponse()

/daily-pulse (legacy)
  → callOpenRouter() → parseJsonResponse()

/analyze-competitor
  → callOpenRouter() → parseJsonResponse()

/analyze-segments
  → callOpenRouter() → parseJsonResponse()

/chat
  → callOpenRouter()

/tactical-briefing  ⭐ NEW 3-CHAIN
  → Chain 1: callOpenRouter() → extractJson()
      ↓
  → Chain 2: callOpenRouter() → extractJson()
      ↓
  → Chain 3: callOpenRouter() → return Markdown
  → fallback: generateFallbackBriefing()
```

---

## 5. Data Model Updates (v02 vs v01)

| Interface | v01 Fields | v02 Fields | Perubahan |
|-----------|-----------|-----------|-----------|
| `BusinessCanvasData` | 57 | **59** | +`peakHours`, +`topConvertingChannel` |
| `TacticalBriefingInput` | — | **20** (nested) | Interface baru |
| `WarRoomBrief` | — | **5** (nested) | Interface baru |
| `CustomerInsightBrief` | — | **5** | Interface baru |
| `DailyContext` | — | **7** | Interface baru |

---

*Dokumen inventarisasi endpoint — diperbarui untuk mencerminkan arsitektur 8-endpoint dengan 3-chain prompt*
*Source: worker.ts, server.ts, src/types.ts, src/tactical-briefing.ts, src/components/DailyPulse.tsx, src/components/BusinessCanvas.tsx*