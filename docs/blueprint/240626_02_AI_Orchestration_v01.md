# AI Orchestration & Prompt Chaining Strategy

**Versi:** v01 — 24 Juni 2026  
**Modul:** 02 of 04

---

## 1. Status AI Integration Saat Ini

### 1.1 Inventory of AI Call Points

| Modul | Endpoint | Trigger | Frekuensi | Context yang Dikirim |
|-------|----------|---------|-----------|---------------------|
| StrategyForge | `POST /api/strategy-forge` | Mount component + user change optimismLevel | Setiap tab switch | `{ dna, optimismLevel }` |
| ContentGenerator | `POST /api/generate-content-text` | User klik "Generate AI Text" | On demand | `{ dna, headline, promoPrice, normalPrice, hook, cta, urgency, contentVariant }` |
| DailyPulse | `POST /api/daily-pulse` | Mount component | Setiap tab switch | `{ dna, completedCount }` |

### 1.2 Analisis Prompt Flow — Saat Ini

```text
StrategyForge:
  Request:  { dna: { brand, productName, advantages, ... }, optimismLevel: "Moderat" }
  Response: { pillars: [...], synopsis: "..." }
  → Ditampilkan di UI, TIDAK disimpan

ContentGenerator:
  Request:  { dna: { brand, productName, ... }, headline: "...", promoPrice: ... }
  Response: { headline, subheadline, caption, hashtags, overlayText, ... }
  → Ditampilkan di canvas, TIDAK disimpan

DailyPulse:
  Request:  { dna: { brand, productName, ... }, completedCount: 3 }
  Response: { briefing: "..." }
  → Ditampilkan di UI, TIDAK disimpan
```

### 1.3 Masalah Utama

1. **Context redundancy** — DNA object (30+ field) dikirim ulang di setiap request. Field-field seperti `productName`, `brand`, `advantages` berulang di semua request.
2. **No prompt chaining** — Output dari satu AI call tidak pernah menjadi input AI call berikutnya. Ini adalah missed opportunity terbesar.
3. **StrategyForge tidak tahu tentang kompetitor** — padahal data kompetitor sudah ada di state.
4. **DailyPulse tidak tahu tentang strategi** — AI briefing tidak mempertimbangkan pillars dari StrategyForge.
5. **Tidak ada session/chat history** — AI call bersifat stateless, tidak ada konteks percakapan.

---

## 2. Target: Prompt Chaining Architecture

### 2.1 Diagram Alur Prompt Chain (Target)

```text
┌─────────────────────────────────────────────────────┐
│  Step 0: System Prompt (context foundation)          │
│  "Anda adalah AI Business Strategist untuk Pengusaha       │
│   Indonesia. Fokus pada actionable, low-cost,        │
│   high-impact strategies untuk {dna.brand}."         │
│  → Context ini di-cache dan digunakan ulang           │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Step 1: Competitor Intel Analysis                   │
│  Prompt: "Analisis SWOT kompetitor untuk             │
│           {dna.productName}. Kompetitor:             │
│           {competitors.map(c => `- ${c.name}:        │
│            S=${c.strengths}, W={c.weaknesses}`)}"    │
│  Output: SWOTSummary + GapAnalysis                   │
└─────────────────────┬───────────────────────────────┘
                      │ SWOTSummary
                      ▼
┌─────────────────────────────────────────────────────┐
│  Step 2: Strategy Generation                         │
│  Prompt: "Berdasarkan SWOT: {swot},                  │
│           target market: {dna.targetMarket},         │
│           Tingkat optimisme: {optimismLevel}.         │
│           Generate 11 strategi pillar."               │
│  Output: StrategyArea[] + PriorityActions[]          │
└─────────────────────┬───────────────────────────────┘
                      │ StrategyOutput
                      ├──────────────────────┐
                      ▼                      ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│  Step 3a: Content Gen   │  │  Step 3b: Daily Pulse   │
│  Prompt: "Buat caption  │  │  Prompt: "Buat checklist │
│   promosi untuk         │  │   harian dari strategi: │
│   {dna.productName}.    │  │   {actions}.             │
│   Strategi: {strategi}. │  │   Segmentasi: {segments} │
│   Segmen target:        │  │   Progress kemarin:      │
│   {segments.filter(     │  │   {dailyRecords.slice(-1)}│
│     s => s.churnRisk)   │  │   Beri prioritas pada    │
│   } — fokus retensi."   │  │   tindakan yang belum     │
│  Output: Content + Hashtag│  │   selesai."              │
└─────────────────────────┘  └─────────────────────────┘
                                    │
                                    ▼
                      ┌─────────────────────────────────┐
                      │  Step 4: Weekly Review           │
                      │  (Trigger: streak.count % 7 === 0)│
                      │  Prompt: "Review 7 hari terakhir:│
                      │   {dailyRecords}.                │
                      │   Tindakan mana yang paling      │
                      │   efektif? Adjust optimism?      │
                      │   Sarankan strategi baru."       │
                      │  Output: WeeklyReview            │
                      └─────────────────────────────────┘
```

### 2.2 Context Session ID

Setiap user session mendapat `sessionId` unik:

```typescript
interface AISessionContext {
  sessionId: string;
  dna: BusinessCanvasData;
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  strategyOutput: StrategyOutput | null;
  dailyHistory: DailyPulseRecord[];
  lastSyncAt: string;
}
```

**Manfaat:**
- Backend bisa cache context per session — kirim hanya `sessionId` + delta data
- Hindari kirim DNA (30+ field) setiap request
- Backend bisa maintain conversation history

---

## 3. Prompt Design — Production-Ready Templates

### 3.1 System Prompt (Dibundel sekali per session)

```text
Anda adalah AI Business Growth Strategist untuk platform MaxxSales.
Anda membantu para Pengusaha di Indonesia 
mengembangkan strategi penjualan yang konkret dan actionable.

KARAKTER:
- Bahasa: Indonesia informal namun profesional
- Fokus: Actionable, low-cost, high-impact
- Gaya: Langsung, to the point, dengan contoh konkret
- Output: Selalu dalam format terstruktur (JSON atau bullet)

PEDOMAN:
1. Prioritaskan strategi dengan modal minimal
2. Berikan contoh eksekusi yang spesifik (bukan generic)
3. Sesuaikan dengan konteks Pengusaha Indonesia (WhatsApp, Instagram, pasar lokal)
4. Jika ada data kompetitor, gunakan untuk gap analysis
5. Jika ada data segmen, sesuaikan rekomendasi dengan profil pelanggan
```

### 3.2 Strategy Generation Prompt (Dengan Context Chaining)

```text
Konteks Bisnis:
- Nama Brand: {dna.brand}
- Produk: {dna.productName} — Harga Normal: Rp{dna.normalPrice}
- Keunggulan: {dna.advantages}
- Target Market: {dna.targetMarket}
- Lokasi: {dna.location}

Intel Kompetitor:
{competitors.map(c => `- ${c.name}: Harga Rp${c.price}, 
   Kekuatan: ${c.strengths}, Kelemahan: ${c.weaknesses}`)}

Segmentasi Pelanggan:
{segments.map(s => `- ${s.name}: ${s.count} org, LTV Rp${s.ltv}, 
   Churn Risk: ${s.churnRisk}`)}

Tingkat Optimisme: {optimismLevel}
(Konservatif = fokus efisiensi biaya, Moderat = seimbang, 
 Agresif = ekspansi penuh)

Progress Harian Terakhir:
{lastPulse ? `- Checklist terselesaikan: ${lastPulse.completedCount}/5
   - Briefing kemarin: ${lastPulse.briefing}` : '- Belum ada data'}

INSTRUKSI:
Hasilkan 11 strategi pillar untuk {dna.productName}.
Tiap pillar harus mencakup: nama strategi, target audiens, 
biaya estimasi, langkah konkret, dan KPI.

Berikan prioritas pada area yang kompetitor lemah.
Sesuaikan tingkat agresivitas dengan {optimismLevel}.
```

### 3.3 Daily Briefing Prompt (Dengan Context Strategy)

```text
Konteks:
- Produk: {dna.productName}
- Strategi aktif: {activePillars?.map(p => p.name)}
- Progress kemarin: {completedCount}/5 item selesai
- Streak saat ini: {streak.count} hari

INSTRUKSI:
Buat briefing harian yang:
1. Memberi semangat untuk melanjutkan streak
2. Mengingatkan strategi prioritas hari ini
3. Memberikan 1 "quick win" actionable tip
4. Sesuaikan nada dengan progress kemarin
```

### 3.4 Weekly Review Prompt (Auto-trigger)

```text
Data 7 Hari Terakhir:
{dailyRecords.slice(-7).map(r => `- Hari ${r.date}: 
   ${r.completedCount}/5, Mood: ${r.mood}`)}

Strategi yang Aktif:
{activePillars.map(p => `- ${p.name}: ${p.status}`)}

INSTRUKSI:
1. Evaluasi efektivitas strategi minggu ini
2. Identifikasi pola: hari apa performa terbaik?
3. Sarankan 1 strategi baru untuk minggu depan
4. Apakah perlu adjust optimism level?
5. Berikan score performa mingguan (0-100)
```

---

## 4. Context Window Caching Strategy

### 4.1 Masalah Saat Ini

Setiap API call mengirim DNA **lengkap** (30+ field):

```json
{
  "dna": {
    "brand": "...",
    "productName": "...",
    "normalPrice": "...",
    "promoPrice": "...",
    "advantages": ["..."],
    "targetMarket": "Siswa SMA",
    "location": "...",
    "instagram": "...",
    "whatsapp": "...",
    "socialProof": "...",
    "usp": "...",
    ...  (20+ field lainnya)
  }
}
```

DNA hanya berubah saat user edit melalui wizard (jarang).  
Mengirim ulang setiap kali = **waste bandwidth** dan **token cost**.

### 4.2 Solusi: Session Cache

```typescript
// Frontend → Backend protocol
interface AIRequest {
  sessionId: string;           // → Backend lookup cache
  contextDelta?: object;       // → Hanya kirim field yang berubah
  promptType: "strategy" | "content" | "pulse" | "review";
  promptParams: object;        // → Parameter spesifik prompt
}

// Backend cache store (in-memory / Redis)
interface AICacheEntry {
  sessionId: string;
  dna: BusinessCanvasData;     // Cached dari request pertama
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  strategyOutput: StrategyOutput | null;
  conversationHistory: { role: string; content: string }[];
  expiresAt: number;
}
```

**Alur:**
1. Request pertama: kirim `{ sessionId: "...", dna: {...} }` → backend cache
2. Request berikutnya: kirim `{ sessionId: "...", promptType: "strategy", promptParams: {...} }` → backend pakai cache
3. Jika DNA berubah: kirim `{ sessionId: "...", contextDelta: { dna: {...} } }` → backend update cache

### 4.3 Client-Side Caching

```typescript
const aiCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

function getCachedAIResponse(key: string): any | null {
  const cached = aiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }
  return null;
}
```

---

## 5. Example AI Flows — End to End

### 5.1 Daily Sales Pulse Flow (Dengan Chaining)

```text
Step 1: [Trigger] User membuka tab DailyPulse pukul 08:00
Step 2: [Client] Cek cache context session. DNA + strategyOutput + competitors.
Step 3: [API] POST /api/daily-pulse
         Body: {
           sessionId: "abc123",
           promptType: "daily",
           context: {
             completedCount: 4,  // dari kemarin
             streakCount: 5,
             activeStrategy: ["Harga Bundling", "Social Proof"]
           }
         }
Step 4: [Backend] Ambil DNA dari cache session. Build prompt dengan context.
Step 5: [LLM] Generate personalized briefing.
Step 6: [Backend] Return briefing + suggested checklist items.
Step 7: [Client] Simpan response ke state → dailyRecords[]
Step 8: [Auto] Jika streak % 7 === 0, trigger weekly review.
```

### 5.2 Content Generator Flow (Dengan Segment Context)

```text
Step 1: User pilih segmen "Siswa SMA (High Churn Risk)"
Step 2: [Client] ContentGenerator mengambil:
         - DNA (productName, promoPrice)
         - Segmen spesifik (behavior, churnRisk)
         - StrategyOutput (pillars yang relevan)
Step 3: [API] POST /api/generate-content-text
         Body: {
           sessionId: "abc123",
           promptType: "content",
           context: {
             segment: { name: "Siswa SMA", churnRisk: "High" },
             strategy: "FOMO Bundling",
             promoInfo: { headline, promoPrice, normalPrice }
           }
         }
Step 4: [Backend] Build prompt dengan segment-specific language.
Step 5: [LLM] Generate caption yang fokus retensi + FOMO.
Step 6: [Client] Simpan ke contentHistory[] + tampilkan di canvas.
```

---

## 6. Error Handling & Observability

### 6.1 Saat Ini

```typescript
// ❌ Pattern saat ini — tidak ada fallback
try {
  const res = await fetch(url, { ... });
  const data = await res.json();
  // langsung pakai data
} catch (err) {
  console.error("Error:", err);
  alert("Gagal memuat data");  // UX buruk
}
```

### 6.2 Target Pattern

```typescript
// ✅ Target pattern — graceful degradation
async function callAI<T>(
  endpoint: string,
  body: object,
  options?: { retry?: number; timeout?: number; fallback?: T }
): Promise<AIResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 15000);
  
  for (let attempt = 1; attempt <= (options?.retry ?? 2); attempt++) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, timestamp: Date.now() }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { success: true, data: await res.json() };
    } catch (err) {
      if (attempt === (options?.retry ?? 2)) {
        return { 
          success: false, 
          data: options?.fallback ?? null,
          error: err.message 
        };
      }
      await new Promise(r => setTimeout(r, 1000 * attempt)); // exponential backoff
    }
  }
}
```

---

## 7. Rekomendasi Prioritas

| # | Item | Dampak | Effort | Fase |
|---|------|--------|--------|------|
| 1 | Implement session context caching | 🟢 Kurangi token cost 60% | Sedang | Fase 2 |
| 2 | Chain StrategyForge → DailyPulse | 🟠 Strategi relevan dengan daily task | Rendah | Fase 2 |
| 3 | Chain CustomerInsight → ContentGenerator | 🟠 Caption sesuai segmen | Rendah | Fase 2 |
| 4 | Implement error handling pattern | 🔴 Graceful degradation | Rendah | Fase 1 |
| 5 | Weekly auto-review loop | 🟠 Self-optimizing system | Tinggi | Fase 4 |
| 6 | Chain CompetitorWarRoom → StrategyForge | 🔴 Strategi berdasarkan gap kompetitor | Rendah | Fase 2 |
