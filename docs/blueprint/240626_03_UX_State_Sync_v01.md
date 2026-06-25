# UX & State Synchronization Analysis

**Versi:** v01 — 24 Juni 2026  
**Modul:** 03 of 04

---

## 1. UX Component Inventory

### 1.1 Screen Flow

```text
[LANDING PAGE]
    │
    ▼
[LOGIN]
    │ (localStorage check)
    ▼
[DASHBOARD]
    │
    ├── [DNA WIZARD] — BusinessCanvas (once only)
    │       │ onSave → isDnaFilled = true
    │       ▼
    └── [MAIN DASHBOARD]
            │
            ├── Sidebar
            │   ├── Brand Overview Card
            │   ├── Theme Switcher Card
            │   ├── Daily Streak Card
            │   ├── Menu Utama (5 tab buttons + progress bar)
            │   │   ├── 1. Competitor War Room
            │   │   ├── 2. Customer Insight
            │   │   ├── 3. Strategy Fusion
            │   │   ├── 4. Content Generator
            │   │   └── 5. Daily Sales Pulse
            │   └── UserTour Component
            │
            └── Content Panel (berganti sesuai tab aktif)
                    ├── CompetitorWarRoom
                    ├── CustomerInsight
                    ├── StrategyForge
                    ├── ContentGenerator
                    └── DailyPulse
```

### 1.2 State Transition Diagram

```text
currentTab: "landing" ──(klik CTA)──▶ "login"
"login" ──(login success)──▶ "dashboard"
"dashboard" ──(klik logo)──▶ "landing"
"landing" ──(logged in + klik)──▶ "dashboard"

di dalam dashboard:
isDnaFilled = false ──(wizard save)──▶ isDnaFilled = true
dashTab: "competitor" ◀──▶ "customer" ◀──▶ "strategy" ◀──▶ "content" ◀──▶ "pulse"
```

---

## 2. Positive UX Findings ✅

### 2.1 Onboarding Flow

- **DNA wizard sebagai forced gate** sangat efektif — user WAJIB mengisi data bisnis sebelum bisa menggunakan fitur
- **Onboarding badge** dengan teks "★ INITIAL ONBOARDING STAGE" memberi konteks yang jelas
- `handleResetDNA()` memungkinkan user kembali mengedit — baik untuk testing

### 2.2 Feature Engagement Tracking

- Setiap tab memiliki checkbox + badge "Done/Todo" → visual progress tracking
- `featureEngagement` auto-detect dari aktivitas (bukan hanya manual checkbox)
- Progress bar di sidebar: `Math.round((completedCount / 5) * 100)` — sederhana namun informatif

### 2.3 Streak Gamification

- **Streak card** dengan fire emoji, level indicator, XP counter, animasi pulse
- Auto-increment streak saat user mengunjungi DailyPulse tab
- "Simulasi" button untuk testing — menunjukkan developer awareness akan UX testing

### 2.4 Theme & Responsiveness

- Dark/light mode dengan toggle yang smooth (CSS `transition-colors duration-300`)
- `max-w-7xl mx-auto` — container responsif
- Sidebar layout: `flex-col lg:flex-row` — collapse ke vertikal di mobile

### 2.5 Floating Chatbot

- Hanya muncul di dashboard (conditional render)
- Menerima `dna` sebagai context — AI assistant paham konteks bisnis user

---

## 3. Critical UX Issues 🔴

### 3.1 No Loading States

| Modul | Saat Loading | Masalah |
|-------|-------------|---------|
| CompetitorWarRoom | Instant render (no API) | Tidak ada masalah |
| CustomerInsight | Instant render + API call | Data hasil analisis segmen muncul delayed tanpa indikator |
| **StrategyForge** | Spinner + disabled dropdown | ✅ OK |
| ContentGenerator | Spinner saat generate text | ✅ OK |
| **DailyPulse** | Instant render + API briefing | Briefing muncul delayed tanpa loading state |

**Rekomendasi:** Tambahkan loading skeleton untuk CustomerInsight dan DailyPulse.

### 3.2 StrategyForge Auto-Re-Fetch on Tab Switch

```typescript
// StrategyForge.tsx — useEffect dependency kosong
React.useEffect(() => {
  fetchStrategy(level);  // Dipanggil setiap mount
}, []);
```

**Setiap kali user switch ke tab StrategyForge → API call baru,** meskipun data DNA tidak berubah dan user hanya ingin membaca hasil sebelumnya.

**Rekomendasi:** 
```typescript
const [lastFetchedDna, setLastFetchedDna] = useState<string | null>(null);

React.useEffect(() => {
  const dnaHash = JSON.stringify(dna);
  if (dnaHash !== lastFetchedDna) {
    fetchStrategy(level);
    setLastFetchedDna(dnaHash);
  }
}, [dna, level]);
```

### 3.3 ContentGenerator Canvas Re-Render Cascade

```typescript
// ContentGenerator.tsx
React.useEffect(() => {
  drawCanvas(); // Dipanggil saat salah satu dari 6+ state berubah
}, [generatedText, imageSrc, activeFormat, promoPrice, normalPrice, ...]);
```

**Problem:** Setiap perubahan input (promoPrice, normalPrice, dll.) trigger canvas re-draw penuh. Jika user mengetik cepat, canvas bisa re-render 10+ kali per detik.

**Rekomendasi:**
```typescript
// Debounce canvas rendering
React.useEffect(() => {
  const timer = setTimeout(() => drawCanvas(), 300);
  return () => clearTimeout(timer);
}, [generatedText, imageSrc, activeFormat, promoPrice, normalPrice]);
```

### 3.4 Global Re-Render Cascade

Karena semua state di `App.tsx`, perubahan sekecil apapun (misal: user menambah 1 competitor) menyebabkan:

```text
setCompetitors(newArray)
  → App re-render
    → Sidebar re-render
    → UserTour re-render
    → CompetitorWarRoom re-render
    → (all other inactive modules still re-render via conditional rendering)
```

**Rekomendasi:**
1. Bungkus modul dengan `React.memo()` — hanya re-render jika props berubah
2. Extract global state ke Context API — komponen hanya subscribe ke slice yang relevan
3. Atau migrate ke Zustand untuk performa lebih baik

### 3.5 Tab Switch Animation

Saat ini modul muncul instant tanpa transisi. Lebih baik:
```css
/* Tambahkan animasi fade-in untuk tiap tab switch */
.dashboard-content {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 4. State Synchronization Issues 🟡

### 4.1 localStorage Race Condition

```typescript
// App.tsx — useEffect sync ke localStorage
React.useEffect(() => {
  localStorage.setItem("maxx_sales_dna", JSON.stringify(canvas));
}, [canvas]);
```

**Problem:** Jika user membuka 2 tab browser, perubahan di Tab A bisa di-overwrite oleh Tab B.

**Solusi (Fase 1):**
```typescript
// Gunakan storage event listener
window.addEventListener("storage", (e) => {
  if (e.key === "maxx_sales_dna" && e.newValue) {
    setCanvas(JSON.parse(e.newValue));
  }
});
```

### 4.2 JSON.parse Error Handling

```typescript
// App.tsx — Saat ini
const [canvas, setCanvas] = useState<BusinessCanvasData>(() => {
  const saved = localStorage.getItem("maxx_sales_dna");
  return saved ? JSON.parse(saved) : defaultCanvasData();  // ❌ Bisa throw!
});
```

Jika localStorage corrupted (misal: user clear sebagian data), `JSON.parse` bisa throw dan mengakibatkan white screen.

**Solusi:**
```typescript
function safeParse<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  try {
    const parsed = JSON.parse(data);
    return isValidState(parsed) ? parsed : fallback;
  } catch {
    console.warn("Corrupted state detected, using fallback");
    localStorage.removeItem("maxx_sales_dna"); // cleanup
    return fallback;
  }
}
```

### 4.3 Feature Engagement Auto-Detect Logic

```typescript
// Saat ini: auto-detect berdasarkan jumlah array
if (competitors.length > 2) { ... setFeatureEngagement(prev => ...prev, competitor: true }
if (segments.length > 4) { ... customer: true }
```

**Problem:** Auto-detect hanya berdasarkan KUANTITAS, bukan KUALITAS. User bisa menambah 3 competitor kosong (default values) dan fitur tetap terdeteksi sebagai "Done".

**Solusi:**
```typescript
// Validasi kualitas — cek apakah ada data yang benar-benar diisi
const hasRealCompetitors = competitors.some(c => 
  c.name && c.name !== "" && c.strengths && c.strengths.length > 0
);
if (hasRealCompetitors) {
  setFeatureEngagement(prev => ...prev, competitor: true);
}
```

### 4.4 Streak Sync Timing

```typescript
// Auto-increment streak saat visit DailyPulse
React.useEffect(() => {
  if (dashTab === "pulse") {
    const todayStr = new Date().toISOString().split("T")[0];
    if (streak.lastClaimDate !== todayStr) {
      setStreak(prev => ({
        count: prev.count + 1,     // ✅ increment count
        lastClaimDate: todayStr,
        xp: prev.xp + 50           // ✅ tambah XP
      }));
    }
  }
}, [dashTab, streak.lastClaimDate]);
```

**Problem:** Dependency `[dashTab, streak.lastClaimDate]`. Setelah `setStreak()` dipanggil, `streak.lastClaimDate` berubah → effect terpanggil lagi (karena `streak.lastClaimDate` di dependency array). Ini menyebabkan re-run hook yang tidak perlu (meskipun conditional guard mencegah increment ganda).

**Rekomendasi:** Pindahkan streak logic ke handler terpisah (bukan useEffect).

---

## 5. Accessibility Audit 🟢

| Kriteria | Status | Catatan |
|----------|--------|---------|
| Keyboard navigation | 🟡 Sebagian | Tab bisa diakses via klik, tapi tidak ada keyboard shortcut |
| Focus indicators | 🟡 Minimal | `focus:outline-none` menghilangkan default outline, perlu custom focus style |
| Color contrast | 🟢 Baik | Dark mode + light mode dengan kontras tinggi |
| ARIA labels | 🟡 Sebagian | Beberapa button punya `aria-label`, tapi tidak semua |
| Screen reader | 🟠 Perlu review | Tidak ada testing visible |
| Motion sensitivity | 🟢 Reduced motion via CSS | `transition-colors`, `animate-pulse` bisa dimatikan via `prefers-reduced-motion` |

---

## 6. UX Recommendations Matrix

| # | Issue | Severity | Fix | Effort | Fase |
|---|-------|----------|-----|--------|------|
| 1 | No loading state di CustomerInsight, DailyPulse | 🔴 High | Skeleton loader | Rendah | Fase 1 |
| 2 | StrategyForge auto-re-fetch | 🔴 High | Cache + hash comparison | Rendah | Fase 1 |
| 3 | Canvas re-render cascade | 🟡 Medium | Debounce 300ms | Rendah | Fase 1 |
| 4 | Global re-render cascade | 🔴 High | React.memo / Context | Sedang | Fase 1 |
| 5 | localStorage race condition | 🟡 Medium | Storage event listener | Rendah | Fase 1 |
| 6 | JSON.parse error handling | 🟡 Medium | safeParse utility | Rendah | Fase 1 |
| 7 | Feature engagement quality check | 🟢 Low | Validasi isi data | Rendah | Fase 1 |
| 8 | Tab switch animation | 🟢 Low | CSS fade-in | Rendah | Fase 3 |
| 9 | Keyboard accessibility | 🟡 Medium | Custom focus ring | Rendah | Fase 3 |
| 10 | Streak sync optimization | 🟢 Low | Move to handler | Rendah | Fase 3 |
