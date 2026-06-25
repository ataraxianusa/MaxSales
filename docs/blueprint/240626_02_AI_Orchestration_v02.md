# AI Orchestration & Prompt Chaining Strategy

**Versi:** v02 — 24 Juni 2026  
**Modul:** 02 of 04  
**Perubahan:** Restrukturasi berdasarkan 5 tusukan — user feedback loop, DNA closed-loop, backend cache di-PHP-in, prioritas chain War Room → Strategy → DailyPulse.

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

1. **No prompt chaining** — Output dari satu AI call tidak pernah menjadi input AI call berikutnya.
2. **StrategyForge tidak tahu tentang kompetitor** — padahal data kompetitor sudah ada di state.
3. **DailyPulse tidak tahu tentang strategi** — AI briefing tidak mempertimbangkan pillars dari StrategyForge.
4. **Tidak ada feedback loop** — User tidak bisa bilang "ini tidak relevan", AI tidak belajar dari rejection.
5. **DNA buntu** — Data real dari DailyPulse tidak pernah feed back ke Business Canvas.

---

## 2. Arsitektur Chain + Feedback Loop

### 2.1 Diagram Chain — 48 Jam Pertama

```text
WAR ROOM                          STRATEGY FORGE                     DAILY PULSE
┌──────────────┐                  ┌──────────────┐                  ┌──────────────┐
│ SWOT         │ ──competitors──▶ │ 11 Pillars    │ ──strategies──▶ │ Daily        │
│ Kompetitor   │                  │ + Prioritas   │                  │ Briefing     │
│ Gap Analysis │                  │ + Quick Wins  │                  │ + Checklist  │
└──────────────┘                  └──────┬───────┘                  └──────┬───────┘
                                         │                                │
                                         │                                │
                                         ▼                                ▼
                                  ┌──────────────┐                 ┌──────────────┐
                                  │ CONTENT GEN  │                 │ DNA FEEDBACK │
                                  │ Caption       │                 │ Notif 7 hari │
                                  │ per segmen   │                 │ Update Canvas│
                                  └──────────────┘                 └──────┬───────┘
                                                                         │
                                                                         ▼
                                                                  ┌──────────────┐
                                                                  │ USER         │
                                                                  │ FEEDBACK     │
                                                                  │ ↑ ↓ tombol   │
                                                                  │ rasio berguna │
                                                                  └──────────────┘
```

### 2.2 Context Session — Frontend-Only (via useRef)

**Keputusan:** Tidak ada backend session cache. Kirim full state tiap request sampai >100 pengguna.

```typescript
// ✅ Frontend cache — useRef, bukan Map backend
const cachedContext = useRef<{
  dnaHash: string;
  dna: BusinessCanvasData;
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  strategyOutput: StrategyOutput | null;
  dailyHistory: DailyPulseRecord[];
} | null>(null);
```

**Alasan:**
- DNA jarang berubah — hash via `useRef` cukup cegah re-fetch saat tab switch
- Belum ada beban 100+ user, premature optimization
- Simpan token cost nanti setelah chain sudah jalan dan user sudah protes lambat

### 2.3 — BARU: User Feedback Loop

Setiap output AI wajib punya feedback tombol:

```tsx
// ✅ Tombol feedback — di setiap AI output card
<AIFeedbackButtons
  sessionId={sessionId}
  promptType="strategy"  // | "pulse" | "content"
  responseId={response.id}
  onFeedback={(vote: "useful" | "not") => {
    logFeedback({ promptType, responseId, vote });
  }}
/>
```

Backend menyimpan rasio useful/tidak per prompt type + per user:

```typescript
interface FeedbackLog {
  userId: string;
  sessionId: string;
  promptType: "strategy" | "pulse" | "content";
  responseId: string;
  vote: "useful" | "not";
  responseSnippet: string;    // ringkasan 100 char untuk konteks
  timestamp: string;
}

// 🔮 Nanti: Prompt bias dari rejection ratio
// Jika promptType "strategy" punya rejection > 40%,
// → bias system prompt: "User cenderung tolak saran mahal,
//   prioritaskan low-cost strategies."
```

**Implementasi:** Cukup `POST /api/feedback` endpoint sederhana + localStorage sementara.

### 2.4 — BARU: DNA Closed-Loop (DailyPulse → Business Canvas)

Setiap 7 hari, system mengecek data real vs data yang diinput user di DNA:

```typescript
// Deteksi: "Data real tidak cocok dengan canvas"
const analysis = {
  // Apakah targetMarket yang diinput user terbukti dari segmen?
  marketMisalignment: dna.targetMarket !== mostActiveSegment.name,
  
  // Apakah sosial proof yang diinput user tidak pernah dipakai konten?
  spMismatch: dna.socialProof && !konsistenDipakaidiContent,
  
  // Apakah ada insight baru dari DailyPulse yang contradict DNA?
  contradictory: dailyRecords.some(r => r.insight?.includes("beda")),
};

if (analysis.marketMisalignment || analysis.spMismatch || analysis.contradictory) {
  showNotification({
    type: "dna_update_suggestion",
    message: `Data 7 hari terakhir menunjukkan ${insight}. 
              Update Business Canvas?`,
    action: {
      label: "Update Sekali Klik",
      handler: () => autoUpdateCanvas(analysis),
    },
    dismiss: "Nanti"
  });
}
```

**Prinsip:** Satu klik update. Jangan bikin user berpikir.

---

## 3. Prompt Design — Production-Ready Templates

### 3.1 System Prompt

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

### 3.2 Strategy Generation Prompt

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

Feedback History (dari rejection user sebelumnya):
{feedbackSummary || "- Belum ada data feedback"}

INSTRUKSI:
Hasilkan 11 strategi pillar untuk {dna.productName}.
Tiap pillar harus mencakup: nama strategi, target audiens, 
biaya estimasi, langkah konkret, dan KPI.

Berikan prioritas pada area yang kompetitor lemah.
Sesuaikan tingkat agresivitas dengan {optimismLevel}.
```

### 3.3 Daily Briefing Prompt (Dengan Context Chain dari Strategy)

```text
Konteks:
- Produk: {dna.productName}
- Strategi aktif: {activeStrategies.map(s => `- ${s}`).join("\n")}
- Progress kemarin: {completedCount}/5 item selesai
- Streak saat ini: {streak.count} hari
- Item yang belum selesai: {pendingItems.join(", ")}

INSTRUKSI:
Buat briefing harian yang:
1. Prioritaskan item yang BELUM selesai dari hari sebelumnya
2. Beri semangat untuk melanjutkan streak
3. Ingatkan strategi prioritas hari ini
4. Beri 1 "quick win" actionable tip (referensi strategi aktif)
```

### 3.4 Content Generator Prompt (Dengan Segment Context)

```text
Buat caption promosi untuk {dna.productName}.

Informasi Promo:
- Headline: {headline}
- Harga Promo: Rp{promoPrice} (Normal: Rp{normalPrice})
- Hook: {hook}
- CTA: {cta}
- Urgensi: {urgency}

Strategi Aktif: {strategi}
Segmen Target (prioritas retensi): {segments.filter(s => s.churnRisk === "High")
  .map(s => `- ${s.name}: ${s.behavior}`)}

INSTRUKSI:
Buat caption yang fokus retensi untuk segmen high churn risk.
Gaya bahasa sesuai segmen yang ditarget.
Sertakan hashtag relevan.
```

---

## 4. Caching — Frontend-Only

### 4.1 Masalah

Setiap API call mengirim DNA **lengkap** (30+ field). Ini boros token dan bandwidth.

### 4.2 Solusi Minimal: useRef + Hash Checker

```typescript
// ✅ Cukup: hash-based skipping via useRef
const aiCacheRef = useRef<{
  dnaHash: string;
  competitorsHash: string;
  lastStrategyResponse: StrategyOutput | null;
  lastPulseResponse: DailyPulseData | null;
  feedbackQueue: FeedbackLog[];
}>({
  dnaHash: "",
  competitorsHash: "",
  lastStrategyResponse: null,
  lastPulseResponse: null,
  feedbackQueue: [],
});

// Fungsi helper
function shouldRefetch(
  currentDna: BusinessCanvasData,
  currentCompetitors: CompetitorIntel[]
): boolean {
  const newDnaHash = JSON.stringify(currentDna);
  const newCompHash = JSON.stringify(currentCompetitors);
  
  const changed = newDnaHash !== aiCacheRef.current.dnaHash 
    || newCompHash !== aiCacheRef.current.competitorsHash;
  
  if (changed) {
    aiCacheRef.current.dnaHash = newDnaHash;
    aiCacheRef.current.competitorsHash = newCompHash;
  }
  return changed;
}
```

**Alasan simpel:**
- DNA berubah hanya saat user edit wizard (jarang) → hash check mencegah re-fetch
- Cache di memory, ilang saat refresh → acceptable untuk MVP
- Tidak perlu Redis, tidak perlu backend state — nanti kalau scale

---

## 5. Alur End-to-End — 48 Jam First

### 5.1 Chain: War Room → Strategy → DailyPulse

```text
Step 1: [War Room] User input kompetitor → SWOT analysis
         → competitors[] tersimpan di global state

Step 2: [StrategyForge — MOUNT]
         1. Cek useRef cache: dna & competitors berubah?
         2. Jika berubah → POST /api/strategy-forge
            Body: { dna, optimismLevel, competitors, segments }
         3. Simpan strategyOutput ke context + cacheRef
         4. Tampilkan pillars + synopsis

Step 3: [DailyPulse — MOUNT]
         1. Ambil strategyOutput dari context
         2. POST /api/daily-pulse
            Body: { dna, completedCount, activeStrategies, pendingItems }
         3. Briefing prioritaskan strategi + item belum selesai

Step 4: [User Action] User klik checklist items
         → completedCount update live di UI

Step 5: [Feedback] User klik "Ini tidak relevan" pada briefing
         → POST /api/feedback { promptType: "pulse", vote: "not" }
         → Tampilkan reason popup (optional)
```

### 5.2 Content Generator Flow

```text
Step 1: User pilih segmen (default: churn risk tinggi)
Step 2: ContentGenerator ambil DNA + segmen + strategi aktif dari context
Step 3: POST /api/generate-content-text
         Body: { dna, headline, promoPrice, ... , targetSegments,
                 activeStrategies }
Step 4: Output caption + hashtag spesifik segmen
```

---

## 6. Error Handling — Minimal, Tidak Prematur

```typescript
// ✅ Cukup: try-catch + fallback message
async function callAI<T>(endpoint: string, body: object): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Fallback: tampilkan data kosong dengan retry button
    console.error(`[AI] ${endpoint} gagal:`, err);
    return null;
  }
}
```

**Tidak perlu:** exponential backoff, retry logic, graceful degradation pattern — nanti saja kalau sudah ada user yang complain.

---

## 7. Prioritas — Berdasarkan 5 Tusukan

| # | Item | Dampak | Effort | Kapan |
|---|------|--------|--------|-------|
| 1 | **Chain CompetitorIntel → StrategyForge** | 🔴 Strategi berdasarkan data real | Rendah | **48 Jam** |
| 2 | **Chain StrategyOutput → DailyPulse** | 🔴 Briefing relevan dengan strategi | Rendah | **48 Jam** |
| 3 | **User feedback button (↑↓)** | 🟠 AI belajar dari rejection | Rendah | **48 Jam** |
| 4 | **Simpan output ke global state** | 🔴 Foundation chaining | Rendah | **48 Jam** |
| 5 | **DNA closed-loop notif** | 🟠 Canvas auto-update dari real data | Sedang | Minggu Ini |
| 6 | **Chain CustomerInsight → ContentGenerator** | 🟠 Caption sesuai segmen | Rendah | Minggu Ini |
| 7 | **Frontend useRef cache** | 🟢 Hemat bandwidth | Rendah | Selingan |
| 8 | ~~Session context cache (backend)~~ | ~~Kurang token cost~~ | ~~Sedang~~ | ~~**TUNDA**~~ |
| 9 | ~~Weekly auto-review~~ | ~~Self-optimizing~~ | ~~Tinggi~~ | ~~**TUNDA**~~ |
| 10 | ~~Exponential backoff / retry~~ | ~~Graceful degradation~~ | ~~Rendah~~ | ~~**TUNDA**~~ |

---

## Lampiran: Apa yang DIHAPUS dari v01

| Item v01 | Alasan Hapus |
|----------|-------------|
| Backend session cache (Redis/in-memory) | Prematur, belum 100+ user. Cukup useRef frontend selama MVP |
| Weekly auto-review loop | Tidak bikin user "Wow" dalam 2 menit. Tunda ke fase belakang |
| Exponential backoff retry | Belum ada user yang complain error. Cukup try-catch sederhana |
| Backend conversation history | Storage cost tidak sebanding dengan value untuk MVP |
