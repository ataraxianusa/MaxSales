# Phased Implementation Roadmap — Closed-Loop Growth OS

**Versi:** v02 — 24 Juni 2026  
**Modul:** 04 of 04  
**Perubahan:** Restrukturasi berdasarkan 5 tusukan — Fase 1 = chain War Room → Strategy → DailyPulse dalam 48 jam. Semua task non-essential di-PHP-in.

---

## ⚠️ Prinsip Dasar

> **Jika tidak membuat user bilang "Wow, ini beda!" dalam 2 menit pertama, tunda.**

Dokumen ini hanya berisi apa yang **benar-benar perlu** dikerjakan sekarang.  
Task yang sifatnya "clean code", "best practice", "infrastructure optimization" → tunda hingga user >100 atau secara eksplisit dikeluhkan.

---

## Ringkasan Fase

| Fase | Jangka Waktu | Fokus | Total Task |
|------|-------------|-------|-----------|
| **Fase 1** | **48 Jam** | **Chain: War Room → Strategy → DailyPulse + User Feedback** | **5 task** |
| **Fase 2** | Minggu Ini | Content Chain + DNA Loop + Refinement | 4 task |
| **Fase 3** | Nanti | Deferred — semua yang tidak darurat | (lihat lampiran) |

---

## Fase 1 — 48 Jam: Core Chain

**Tujuan:** User lihat data kompetitor → otomatis strategi relevan → briefing harian terpersonalisasi. Semua dalam 48 jam.

**Prinsip:** Kirim full state tiap request. Belum perlu cache backend. Belum perlu error handling fancy. Yang penting chain NYAMBUNG dulu.

### Task 1.1 — Minimal Context (Hanya untuk Chain)

Buat context minimal yang dibutuhkan chain:

```typescript
// src/store/ChainContext.tsx
interface ChainState {
  // Input
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  dna: BusinessCanvasData;
  
  // Output (baru)
  strategyOutput: StrategyOutput | null;
  dailyRecords: DailyPulseRecord[];
  feedbackLog: FeedbackLog[];
}

// ✅ TIDAK perlu: semua state growth dipindahkan ke context
// ✅ HANYA: state yang diperlukan chain
```

**File affected:**
- `src/store/ChainContext.tsx` — file baru
- `CompetitorWarRoom.tsx` — simpan competitors ke context setelah input
- `StrategyForge.tsx` — baca competitors dari context
- `DailyPulse.tsx` — baca strategyOutput dari context

**Acceptance Criteria:**
- ✅ Competitors dari War Room tersedia di StrategyForge
- ✅ StrategyOutput tersedia di DailyPulse
- ✅ Input berubah → re-fetch terpicu (via useEffect dependency)

---

### Task 1.2 — Chain: CompetitorIntel → StrategyForge

**Apa yang berubah:**
- StrategyForge prompt sekarang mengandung data competitors
- Prioritaskan weaknesses kompetitor sebagai celah strategi

```typescript
// StrategyForge.tsx — perubahan
const { competitors, dna } = useContext(ChainContext);

const body = {
  dna,
  optimismLevel: level,
  competitors: competitors.filter(c => c.name.trim()),
  // 🔥 BARU: Kirim kelemahan kompetitor sebagai celah
  gaps: competitors
    .filter(c => c.weaknesses?.length > 0)
    .map(c => `${c.name}: ${c.weaknesses}`),
};
```

**No backend change needed.** Cukup tambah field ke request body yang sudah ada.

**Acceptance Criteria:**
- ✅ SWOT otomatis berdasarkan data real kompetitor
- ✅ Strategi pillar mencerminkan gap kompetitor
- ✅ Loading state basic (spinner, bukan skeleton)

---

### Task 1.3 — Chain: StrategyOutput → DailyPulse

**Apa yang berubah:**
- DailyPulse briefing sekarang tahu strategi apa yang aktif
- Prioritaskan item yang belum selesai kemarin

```typescript
// DailyPulse.tsx — perubahan
const { strategyOutput, dailyRecords } = useContext(ChainContext);
const yesterday = dailyRecords[dailyRecords.length - 1];

const body = {
  dna,
  completedCount: yesterday?.completedCount ?? 0,
  pendingItems: yesterday?.pendingItems ?? [],
  activeStrategies: strategyOutput?.pillars?.map(p => p.name) ?? [],
};
```

**No backend change needed.**

**Acceptance Criteria:**
- ✅ Briefing menyebut strategi yang sedang aktif
- ✅ Item belum selesai muncul sebagai prioritas
- ✅ Streak counter tetap jalan

---

### Task 1.4 — Simpan Output ke Global State

```typescript
// StrategyForge — setelah fetch sukses
const { setStrategyOutput } = useContext(ChainContext);

const fetchStrategy = async (level: string) => {
  setLoading(true);
  const result = await callAI("/api/strategy-forge", { dna, optimismLevel: level, competitors });
  if (result) {
    setData(result);
    setStrategyOutput(result); // → context → DailyPulse otomatis pake
  }
  setLoading(false);
};
```

```typescript
// DailyPulse — setelah fetch sukses
const { addPulseRecord } = useContext(ChainContext);

const fetchBriefing = async () => {
  const result = await callAI("/api/daily-pulse", { ... });
  if (result) {
    setBriefing(result);
    addPulseRecord({
      date: new Date().toISOString().split("T")[0],
      briefing: result.briefing,
      completedCount: completedItems.length,
      pendingItems: pendingItems,
      streakCount: streak.count,
    });
  }
};
```

---

### Task 1.5 — User Feedback Button

Setiap output AI punya tombol "👍 Berguna" / "👎 Tidak Relevan":

```tsx
// components/AIFeedback.tsx — file baru
function AIFeedback({ promptType, responseId }: Props) {
  const [voted, setVoted] = useState<"useful" | "not" | null>(null);
  
  const sendFeedback = async (vote: "useful" | "not") => {
    setVoted(vote);
    await fetch("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ promptType, responseId, vote, timestamp: Date.now() }),
    });
  };
  
  if (voted) return <span className="text-xs text-green-500">Terima kasih!</span>;
  
  return (
    <div className="flex gap-2 text-xs mt-2">
      <button onClick={() => sendFeedback("useful")}>👍 Berguna</button>
      <button onClick={() => sendFeedback("not")}>👎 Tidak Relevan</button>
    </div>
  );
}
```

**Endpoint backend:** `POST /api/feedback` — simpan ke `feedbackLog[]` di context + localStorage.

**Acceptance Criteria:**
- ✅ Tombol muncul di setiap card output AI
- ✅ Feedback tersimpan (minimal localStorage)
- ✅ Tidak blocking UX — async fire-and-forget

---

### 📋 Fase 1 — Checklist Selesai

- [ ] 1.1 ChainContext — competitors, strategyOutput, dailyRecords
- [ ] 1.2 CompetitorIntel → StrategyForge prompt
- [ ] 1.3 StrategyOutput → DailyPulse briefing
- [ ] 1.4 Simpan output (strategyOutput, dailyRecords) ke context
- [ ] 1.5 AIFeedback component + endpoint

**Selesai 48 jam.** Tidak perlu yang lain.

---

## Fase 2 — Minggu Ini: Feedback & Refinement

### Task 2.1 — Chain: CustomerInsight → ContentGenerator

```typescript
// ContentGenerator.tsx
const { segments, strategyOutput } = useContext(ChainContext);

// Prioritaskan segmen dengan churn risk tinggi
const highRisk = segments.filter(s => s.churnRisk === "High");

const body = {
  dna, headline, promoPrice, ...,
  targetSegments: highRisk.map(s => ({
    name: s.name, behavior: s.behavior, churnRisk: s.churnRisk,
  })),
  activeStrategies: strategyOutput?.pillars?.slice(0, 3).map(p => p.name),
};
```

---

### Task 2.2 — DNA Closed-Loop Notification

Setelah streak 7 hari, cek apakah data real contradict DNA:

```typescript
// src/hooks/useDNAAutoUpdate.ts — file baru
function useDNAAutoUpdate(dna: BusinessCanvasData, dailyRecords: DailyPulseRecord[]) {
  const [suggestion, setSuggestion] = useState<DNAUpdateSuggestion | null>(null);

  useEffect(() => {
    if (dailyRecords.length < 7) return;
    
    const last7 = dailyRecords.slice(-7);
    const activeSegments = [...new Set(last7.map(r => r.activeSegment))];
    
    // Apakah target market di DNA tidak cocok dengan segmen real?
    if (activeSegments.length > 0 && !activeSegments.includes(dna.targetMarket)) {
      setSuggestion({
        type: "market_shift",
        message: `Data 7 hari: segmen aktif adalah ${activeSegments.join(", ")}. 
                   Update target market?`,
        autoFix: () => updateDNATargetMarket(activeSegments[0]),
      });
    }
    
    // Apakah ada kompetitor baru yang muncul di briefing?
    const competitorMentions = last7.filter(r => r.mentionsCompetitor);
    if (competitorMentions.length >= 3) {
      setSuggestion({
        type: "new_competitor",
        message: `Kompetitor baru terdeteksi. Tambah ke War Room?`,
        autoFix: () => navigateToWarRoom(),
      });
    }
  }, [dailyRecords.length % 7 === 0]); // trigger tiap 7 hari
}
```

---

### Task 2.3 — Frontend useRef Cache

```typescript
// StrategyForge.tsx
const strategyRef = useRef({ dnaHash: "", response: null });

const shouldFetch = () => {
  const newHash = JSON.stringify({ dna, competitors, segments });
  if (newHash === strategyRef.current.dnaHash) {
    return false; // skip fetch, data masih valid
  }
  strategyRef.current.dnaHash = newHash;
  return true;
};
```

---

### Task 2.4 — Loading State Minimal

Cukup spinner, bukan skeleton fancy:

```tsx
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
    <span className="ml-2 text-sm text-neutral-500">Menganalisis...</span>
  </div>
) : data ? (...)
```

---

### Task 2.5 — ContentGenerator Canvas Debounce

```typescript
useEffect(() => {
  const timer = setTimeout(() => drawCanvas(), 300);
  return () => clearTimeout(timer);
}, [generatedText, imageSrc, activeFormat, promoPrice, normalPrice, hook, cta, urgency]);
```

---

## Fase 3 — Nanti (Semua yang Ditunda)

Task-task berikut **tidak dikerjakan sekarang**. Bukan karena tidak berguna, tapi karena tidak menghasilkan "Wow" dalam 2 menit.

| Task | Estimasi | Alasan Tunda |
|------|----------|-------------|
| Keyboard navigasi (Alt+1..5) | 1 jam | Power user feature, bukan "Wow" pertama |
| Animasi tab switch | 2 jam | Delight, bukan core value |
| EmptyState component | 2 jam | Bisa inline, tidak perlu reusable dulu |
| Cross-tab sync | 4 jam | Edge case — 99% user single tab |
| React.memo di semua modul | 2 jam | Prematur optimization |
| Safe localStorage parse utility | 2 jam | Cukup try-catch basics |
| Quality-based engagement (vs quantity) | 2 jam | Validasi konten bisa menyusul |
| Weekly auto-review | 1 hari | Tidak urgent, chain belum jalan |
| Growth Dashboard page | 2 hari | Fitur terpisah, setelah core stabil |
| Content performance analysis | 1 hari | Butuh data history > 2 minggu |
| Competitor-aware auto refresh | 4 jam | Trigger manual dulu cukup |
| Self-optimizing loop | 2 hari | Ini level enterprise, bukan MVP |
| Backend session cache | 2 hari | **Prematur — 100+ user dulu** |
| Exponential backoff / retry pattern | 4 jam | Belum ada user complain timeout |

---

## Dependency Map — v02

```text
FASE 1 (48 JAM) ────────────────────────────────────
  Task 1.1 (Minimal Context)
       │
       ├── Task 1.2 (War Room → Strategy)
       │         │
       │         └── Task 1.4 (Simpan strategyOutput)
       │                    │
       ├── Task 1.3 (Strategy → DailyPulse) ◄───────┘
       │         │
       │         └── Task 1.4 (Simpan dailyRecords)
       │
       └── Task 1.5 (Feedback button)
                    (independen, bisa paralel)
                                    │
FASE 2 (MINGGU INI) ────────────────▼───────────────
  Task 2.1 (Segment → Content) ← butuh context chain
  Task 2.2 (DNA auto-update)   ← butuh 7+ dailyRecords
  Task 2.3 (useRef cache)      ← butuh strategyOutput stabil
  Task 2.4 (Loading spinner)   ← independen, UI
  Task 2.5 (Canvas debounce)   ← independen, UI
                                    │
FASE 3 (NANTI) ───────────────────▼─────────────────
  Semua task deferred (lihat tabel di atas)
```

---

## Perubahan dari v01

| Item v01 | Status di v02 | Alasan |
|----------|--------------|--------|
| Context API (full state) | **DIPOTONG** → Minimal Context saja | Tidak perlu semua state di context untuk chain |
| React.memo semua modul | **DITUNDA** | Prematur optimization |
| Cross-tab sync | **DITUNDA** | Edge case |
| safeParse utility | **DITUNDA** | Cukup try-catch inline |
| Loading skeleton | **DITUNDA** → Spinner dasar cukup | Skeleton = effort > value untuk MVP |
| Keyboard navigation | **DITUNDA** | Power user, bukan "Wow" |
| EmptyState component | **DITUNDA** | Inline handling cukup |
| Tab switch animation | **DITUNDA** | Delight, bukan value |
| Fase 4 (Advanced Intelligence) | **DIHAPUS** | Semua task dipindah ke Fase 3 (Nanti) |
| StrategyForge cache hash | **DIGANTI** useRef cache | Lebih simpel, tanpa efot dependency |
| Error handling pattern fancy | **DIGANTI** try-catch dasar | Exponential backoff belum perlu |
