# Phased Implementation Roadmap — Closed-Loop Growth OS

**Versi:** v01 — 24 Juni 2026  
**Modul:** 04 of 04

---

## Ringkasan Fase

| Fase | Fokus | Sprint | Total Task | Kompleksitas |
|------|-------|--------|-----------|-------------|
| **Fase 1** | Foundation — State management & persistence | 1 sprint | 8 task | Rendah–Sedang |
| **Fase 2** | Data Lineage & AI Chaining | 1–2 sprint | 6 task | Sedang–Tinggi |
| **Fase 3** | UX Consistency & Circular Feedback | 1 sprint | 5 task | Sedang |
| **Fase 4** | Advanced Circular Intelligence | 2 sprint | 5 task | Tinggi |

---

## Fase 1: Foundation

**Tujuan:** Memecah bottleneck state management, mengamankan persistence, mengoptimalkan performa render.

### Task 1.1 — Extract Global State ke Context API

```typescript
// src/store/GrowthStateContext.tsx
interface GrowthState {
  canvas: BusinessCanvasData;
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  featureEngagement: FeatureEngagement;
  streak: StreakInfo;
  // Output states (BARU):
  strategyOutput: StrategyOutput | null;
  contentHistory: ContentHistoryItem[];
  dailyRecords: DailyPulseRecord[];
}
```

**File affected:**
- `src/App.tsx` → pindahkan 10+ useState ke context
- `src/store/GrowthStateContext.tsx` → file baru
- `src/store/types.ts` → file baru (tipe tambahan)
- Semua component → `useContext(GrowthStateContext)` gantikan prop drilling

**Acceptance Criteria:**
- ✅ Semua component bisa mengakses state tanpa prop drilling
- ✅ Re-render hanya terjadi di component yang subscribe ke slice yang berubah
- ✅ localStorage sync masih berfungsi

### Task 1.2 — Bungkus Modul dengan React.memo

```typescript
export default React.memo(CompetitorWarRoom, (prev, next) => {
  return prev.dna === next.dna && 
         prev.competitors === next.competitors;
});
```

**File affected:** Semua 5 component modul + FloatingChatbot

### Task 1.3 — Safe localStorage Parse Utility

```typescript
// src/utils/storage.ts
export function safeParseState<T>(key: string, fallback: T, validator?: (data: any) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (validator && !validator(parsed)) {
      localStorage.removeItem(key);
      return fallback;
    }
    return parsed;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}
```

**Acceptance Criteria:**
- ✅ Corrupted JSON tidak mengakibatkan white screen
- ✅ Auto-cleanup key yang rusak

### Task 1.4 — Cross-Tab Sync via Storage Event

```typescript
// App.tsx atau context provider
window.addEventListener("storage", (e: StorageEvent) => {
  if (e.key === "maxx_sales_dna" && e.newValue) {
    updateCanvas(safeParseState("maxx_sales_dna", defaultCanvasData()));
  }
  // ... untuk semua key lainnya
});
```

### Task 1.5 — Loading Skeleton untuk CustomerInsight

Tambahkan `loading` state dan skeleton component:

```tsx
{isAnalyzing ? (
  <div className="animate-pulse space-y-3 p-4">
    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
    <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
    <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
  </div>
) : (...)}
```

### Task 1.6 — Loading State untuk DailyPulse Briefing

Tambahkan indikator loading saat briefing sedang di-fetch (prevent flash of empty content).

### Task 1.7 — StrategyForge Cache Check

Implementasi hash-based caching agar tidak re-fetch jika DNA tidak berubah:

```typescript
const dnaHash = useMemo(() => JSON.stringify(dna), [dna]);
const lastHash = useRef<string | null>(null);

useEffect(() => {
  if (dnaHash !== lastHash.current) {
    fetchStrategy(level);
    lastHash.current = dnaHash;
  }
}, [dnaHash, level]);
```

### Task 1.8 — ContentGenerator Canvas Debounce

```typescript
useEffect(() => {
  const timer = setTimeout(() => drawCanvas(), 300);
  return () => clearTimeout(timer);
}, [generatedText, imageSrc, activeFormat, promoPrice, normalPrice, hook, cta, urgency]);
```

---

## Fase 2: Data Lineage & AI Chaining

**Tujuan:** Output modul upstream menjadi input modul downstream. AI call ter-chaining.

### Task 2.1 — Simpan StrategyOutput ke Global State

```typescript
// StrategyForge — setelah fetch berhasil
const setStrategyOutput = useContext(GrowthStateContext).setStrategyOutput;

const fetchStrategy = async (level: string) => {
  setLoading(true);
  const result = await callAI<StrategyOutput>("/api/strategy-forge", { dna, optimismLevel: level });
  if (result.success) {
    setData(result.data);
    setStrategyOutput(result.data); // ✅ Simpan ke global state
  }
  setLoading(false);
};
```

### Task 2.2 — Simpan ContentHistory ke Global State

```typescript
// ContentGenerator — setiap kali konten berhasil digenerate
const addContent = useContext(GrowthStateContext).addContent;

const handleGenerate = async () => {
  const result = await callAI<GeneratedContentText>("/api/generate-content-text", { ... });
  if (result.success) {
    setGeneratedText(result.data);
    addContent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      headline: result.data.headline,
      format: activeFormat,
      imageSrc: imageSrc,
    });
  }
};
```

### Task 2.3 — Simpan DailyRecords ke Global State

```typescript
// DailyPulse — setiap kali briefing selesai
const addPulseRecord = useContext(GrowthStateContext).addPulseRecord;

const fetchBriefing = async () => {
  // ... setelah sukses
  addPulseRecord({
    date: new Date().toISOString().split("T")[0],
    briefing: result.data.briefing,
    completedCount: completedItems.length,
    streakCount: streak.count,
  });
};
```

### Task 2.4 — Chain CompetitorIntel → StrategyForge

**Prompt update:** StrategyForge prompt sekarang menyertakan data kompetitor.

```typescript
// StrategyForge.tsx
const competitors = useContext(GrowthStateContext).competitors;

// Kirim ke API:
const body = {
  dna,
  optimismLevel: level,
  competitors: competitors.filter(c => c.name), // Hanya yang valid
};
```

**Backend change:** Endpoint `/api/strategy-forge` menerima field `competitors` array.

### Task 2.5 — Chain StrategyOutput → DailyPulse

**Prompt update:** Daily briefing berdasarkan strategi yang aktif.

```typescript
// DailyPulse.tsx
const strategyOutput = useContext(GrowthStateContext).strategyOutput;

const body = {
  dna,
  completedCount,
  activeStrategies: strategyOutput?.pillars?.map(p => p.name) ?? [],
};
```

### Task 2.6 — Chain CustomerInsight → ContentGenerator

**Prompt update:** Caption disesuaikan dengan segmen risiko churn.

```typescript
// ContentGenerator.tsx
const segments = useContext(GrowthStateContext).segments;

// Prioritaskan segmen dengan churn risk tinggi
const highRiskSegments = segments.filter(s => s.churnRisk === "High");

const body = {
  dna,
  headline, promoPrice, ...,
  targetSegments: highRiskSegments.map(s => ({
    name: s.name,
    behavior: s.behavior,
    churnRisk: s.churnRisk,
  })),
};
```

---

## Fase 3: UX Consistency & Circular Feedback

**Tujuan:** UI mulus, feedback loop lengkap antar modul.

### Task 3.1 — Quality-Based Feature Engagement

```typescript
// Ganti auto-detect jumlah dengan validasi konten
const hasRealCompetitors = competitors.some(c => 
  c.name?.trim() && c.strengths?.length > 0 && c.weaknesses?.length > 0
);
const hasRealSegments = segments.some(s =>
  s.name?.trim() && s.count > 0 && s.ltv > 0
);
```

### Task 3.2 — DailyPulse Feedback ke StrategyForge

Setelah streak 3/5/7 hari, StrategyForge menawarkan upgrade optimism level:

```typescript
// StrategyForge.tsx
const dailyRecords = useContext(GrowthStateContext).dailyRecords;
const lastWeekRecords = dailyRecords.slice(-7);
const avgCompletion = lastWeekRecords.reduce((sum, r) => sum + r.completedCount, 0) / 7;

// Saran AI: Jika avg completion > 80%, upgrade ke agresif
if (avgCompletion >= 4) { // 4/5 items
  setSuggestedLevel("Agresif");
}
```

### Task 3.3 — Tab Switch Animation

Tambahkan CSS transition di content panel:

```css
.dashboard-content {
  animation: dashboardFadeIn 0.2s ease-out;
}

@keyframes dashboardFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Task 3.4 — Keyboard Navigation Enhancement

```typescript
// Sidebar — tambahkan keyboard shortcuts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.altKey) {
      switch(e.key) {
        case "1": setDashTab("competitor"); break;
        case "2": setDashTab("customer"); break;
        case "3": setDashTab("strategy"); break;
        case "4": setDashTab("content"); break;
        case "5": setDashTab("pulse"); break;
      }
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

### Task 3.5 — Unified Empty State

Buat komponen `EmptyState` yang reusable:

```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="opacity-40">{icon}</div>
      <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">{title}</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-500 max-w-xs">{description}</p>
      {action && (
        <button onClick={action.onClick} className="...">
          {action.label}
        </button>
      )}
    </div>
  );
}
```

---

## Fase 4: Advanced Circular Intelligence

**Tujuan:** Sistem yang belajar dari output sendiri dan memberikan insight lintas-modul.

### Task 4.1 — Weekly Auto-Review

Backend membaca history 7 hari dan memberikan ringkasan:

```typescript
// Backend: POST /api/weekly-review
interface WeeklyReviewRequest {
  sessionId: string;
  dailyRecords: DailyPulseRecord[];
  contentHistory: ContentHistoryItem[];
  competitors: CompetitorIntel[];
  strategyOutput: StrategyOutput | null;
}

interface WeeklyReviewResponse {
  score: number;           // 0-100
  trend: "up" | "down" | "stable";
  topPerformingAction: string;
  weakestArea: string;
  recommendedAdjustment: string;
  newStrategySuggestion: string;
}
```

### Task 4.2 — Competitor-Aware Strategy Refresh

Jika `competitors[]` berubah setelah strategy terakhir digenerate, trigger auto-refresh prompt:

```typescript
useEffect(() => {
  if (strategyOutput && competitors.length > lastCompetitorCount.current) {
    setShowRefreshBanner(true);
    // "Kompetitor baru terdeteksi! Ingin strategi disesuaikan?"
  }
}, [competitors.length]);
```

### Task 4.3 — Content Performance Analysis

Berdasarkan `contentHistory`, AI memberikan insight:

```typescript
// Backend: POST /api/content-insights
// Analisis: format mana (IG Stories / Feed / WA) yang paling banyak digunakan?
//          caption length vs engagement?
//          promo type mana yang paling sering dipilih?
```

### Task 4.4 — Growth Dashboard Page

Halaman baru yang menampilkan closed-loop metrics:

```
[Growth Dashboard]
├── Weekly Performance Score (0-100) — dengan sparkline
├── Streak Calendar — visual streak 30 hari
├── Strategy Effectiveness — completion rate per pillar
├── Content Mix — distribusi format konten
├── Competitor Response — perubahan market share
├── AI Recommendations — 3 saran next actions
└── Export Report — download summary PDF
```

### Task 4.5 — Self-Optimizing Loop

```text
Setiap N hari (configurable):
1. AI baca seluruh history (strategy + content + pulse)
2. AI evaluasi: apa yang berhasil? mana yang buang-buang waktu?
3. AI generate "Week Ahead Plan":
   - Strategi mana yang dilanjutkan
   - Strategi mana yang dihentikan
   - Strategi baru apa yang dicoba
4. Tampilkan ke user sebagai "AI Weekly Briefing"
5. User bisa approve / adjust / reject
```

---

## Dependencies & Sequencing

```text
Fase 1 ─────────────────────────────────────────────
  Task 1.1 ─── Task 1.2 ─── Task 1.3 ─── Task 1.4
       │
       ├── Task 1.5 ─── Task 1.6 (parallel, UI)
       │
       └── Task 1.7 ─── Task 1.8 (parallel, optimization)
                                                  │
Fase 2 ───────────────────────────────────────────▼
  Task 2.1 ───────────────────────────── Task 2.2
       │                                      │
       ├── Task 2.4 ─── Task 2.5 ─── Task 2.6
       │
       └── Task 2.3
                                  │
Fase 3 ──────────────────────────▼───────────────
  Task 3.1 ─── Task 3.3 ─── Task 3.4
       │
       ├── Task 3.2
       │
       └── Task 3.5
                                  │
Fase 4 ──────────────────────────▼───────────────
  Task 4.1 ─── Task 4.3 ─── Task 4.5
       │
       ├── Task 4.2
       │
       └── Task 4.4
```

---

## Complexity Estimation

| Task | Complexity | Est. File Changes | Risk |
|------|-----------|-------------------|------|
| 1.1 Context API | S | 10+ files | Regression pada state access |
| 1.2 React.memo | S | 6 files | Rendah |
| 1.3 safeParse | S | 1 file + 1 new | Rendah |
| 1.4 Cross-tab sync | S | 1 file | Rendah |
| 1.5–1.6 Loading states | S | 2 files | Rendah |
| 1.7 StrategyForge cache | S | 1 file | Rendah |
| 1.8 Canvas debounce | S | 1 file | Rendah |
| 2.1 Save strategyOutput | M | 2 files | Perlu update tipe |
| 2.2 Save contentHistory | M | 2 files | Perlu update tipe |
| 2.3 Save dailyRecords | M | 2 files | Perlu update tipe |
| 2.4 Chain competitor | M | 1 file + backend | API contract change |
| 2.5 Chain strategy | M | 1 file + backend | API contract change |
| 2.6 Chain segment | M | 1 file + backend | API contract change |
| 3.1 Quality engagement | S | 1 file | Rendah |
| 3.2 Pulse → Strategy | M | 1 file | Logic baru |
| 3.3 Tab animation | S | CSS | Rendah |
| 3.4 Keyboard nav | S | 1 file | Rendah |
| 3.5 EmptyState component | S | 1 new + 5 updates | Rendah |
| 4.1 Weekly review | L | 1 new + backend | Backend baru |
| 4.2 Competitor refresh | M | 1 file | Logic baru |
| 4.3 Content analysis | L | Backend | Analisis kompleks |
| 4.4 Growth Dashboard | L | 1 new page | Halaman baru |
| 4.5 Self-optimizing loop | L | Backend + frontend | Sistem kompleks |

---

## Success Metrics

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| Re-render frequency | < 2x per state change | React DevTools Profiler |
| API call redundancy | 0 duplicate calls | Network tab |
| localStorage corruption rate | 0% setelah implementasi | Manual test |
| Tab switch response | < 100ms | Performance tab |
| AI response caching | 60% fewer payload bytes | Backend metrics |
| Circular data flow | all 5 modules connected | State graph validation |
