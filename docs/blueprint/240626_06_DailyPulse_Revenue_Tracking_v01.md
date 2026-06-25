# DailyPulse Revenue Tracking — Implementation Plan

**Versi:** v01 — 24 Juni 2026  
**Modul:** 06 of 06 (Feature Specification)  
**Status:** Planning → Menunggu approval

---

## 1. Problem Statement

Saat ini angka pencapaian target omzet di DailyPulse **hardcoded 42%**:

```typescript
const achievedRevenue = Math.round(revenueGoal * 0.42); // ← palsu
const percentageAchieved = 42; // ← hardcoded
```

User UKM tidak bisa memahami flow karena angka tidak merepresentasikan data real.

---

## 2. Solusi

User input transaksi kemarin dan target hari ini setiap pagi. Sistem hitung pencapaian dan bandingkan dengan target bulanan dari DNA.

### Flow Harian

```text
Setiap pagi buka DailyPulse:
  ├── Input: "Omzet kemarin" (Rp)         → actual
  ├── Input: "Target hari ini" (Rp)        → daily goal
  ├── Hitung: achievement% = omzet kemarin / target hari ini
  ├── Akumulasi: total omzet minggu ini
  └── Bandingkan: total mingguan vs targetMonthlyRevenue (DNA)
```

### Contoh Perhitungan

```text
DNA target: Rp 50.000.000/bulan (≈ Rp 1.666.000/hari)
User input kemarin: Rp 2.100.000
User input target hari ini: Rp 2.000.000

→ Achievement kemarin: 105% ✓ Over Target
→ Avg harian dari DNA: Rp 1.666.000
```

---

## 3. UI Mockup

```text
┌─────────────────────────────────────────────────────┐
│ MORNING BRIEFING CO-PILOT                           │
│ [Briefing AI text...]                               │
│ [👍 Berguna] [👎 Tidak Relevan]                      │
├─────────────────────────────────────────────────────┤
│ PENCAPAIAN OMZET                                    │
│ ┌──────────────────────┐ ┌──────────────────────┐   │
│ │ Omzet Kemarin (Rp)   │ │ Target Hari Ini (Rp) │   │
│ │ [2100000_________]  │ │ [2000000_________]   │   │
│ └──────────────────────┘ └──────────────────────┘   │
│                                                     │
│ PENCAPAIAN KEMARIN: 105% ✓ Over Target              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (100%)    │
│                                                     │
│ Avg harian DNA: Rp 1.666.000 × 30 hari = 50jt      │
│ Progress Bulanan: 42% dari target bulanan            │
├─────────────────────────────────────────────────────┤
│ DAFTAR PEKERJAAN PENJUALAN HARIAN                   │
│ [Checklist items...]                                │
└─────────────────────────────────────────────────────┘
```

---

## 4. Implementasi

### 4.1 Type Updates

**File:** `src/types.ts`

```typescript
export interface DailyPulseRecord {
  date: string;
  briefing: string;
  completedCount: number;
  pendingItems: string[];
  activeStrategies: string[];
  streakCount: number;
  // BARU
  yesterdayRevenue: number;
  todayTarget: number;
  dailyAchievement: number; // percentage
}
```

### 4.2 State & Persistence

**File:** `src/components/DailyPulse.tsx`

```typescript
const [yesterdayRevenue, setYesterdayRevenue] = React.useState<number>(() => {
  return Number(localStorage.getItem("maxx_sales_yesterday_revenue")) || 0;
});

const [todayTarget, setTodayTarget] = React.useState<number>(() => {
  return Number(localStorage.getItem("maxx_sales_today_target")) 
    || Math.round((dna.targetMonthlyRevenue || 50000000) / 30);
});

React.useEffect(() => {
  localStorage.setItem("maxx_sales_yesterday_revenue", String(yesterdayRevenue));
  localStorage.setItem("maxx_sales_today_target", String(todayTarget));
}, [yesterdayRevenue, todayTarget]);

// Kalkulasi
const dailyAchievement = todayTarget > 0 
  ? Math.round((yesterdayRevenue / todayTarget) * 100) 
  : 0;
const monthlyTarget = dna.targetMonthlyRevenue || 50000000;
const dailyAvgTarget = Math.round(monthlyTarget / 30);
```

### 4.3 UI Components

**Input Fields:**
```tsx
<div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-[10px] font-mono text-neutral-450 block mb-1">OMZET KEMARIN (RP)</label>
    <input
      type="number"
      value={yesterdayRevenue}
      onChange={(e) => setYesterdayRevenue(Number(e.target.value))}
      className="w-full text-sm px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 font-mono"
    />
  </div>
  <div>
    <label className="text-[10px] font-mono text-neutral-450 block mb-1">TARGET HARI INI (RP)</label>
    <input
      type="number"
      value={todayTarget}
      onChange={(e) => setTodayTarget(Number(e.target.value))}
      className="w-full text-sm px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 font-mono"
    />
  </div>
</div>
```

**Achievement Display:**
```tsx
<div className="p-4 rounded bg-neutral-900 text-white text-center space-y-1">
  <span className="text-[9px] font-mono uppercase">PENCAPAIAN KEMARIN</span>
  <p className="text-2xl font-black font-mono">
    {dailyAchievement}%
    <span className={`text-xs ml-2 ${dailyAchievement >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
      {dailyAchievement >= 100 ? '✓ Over Target' : '⚡ Kejar Target!'}
    </span>
  </p>
</div>
```

**Progress Bar:**
```tsx
<div className="space-y-1">
  <div className="flex justify-between text-[9px] font-mono text-neutral-400">
    <span>Avg harian DNA: Rp {dailyAvgTarget.toLocaleString()}</span>
    <span>× 30 hari = Rp {monthlyTarget.toLocaleString()}</span>
  </div>
  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full">
    <div 
      className={`h-2 rounded-full transition-all ${dailyAchievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
      style={{ width: `${Math.min(dailyAchievement, 100)}%` }}
    />
  </div>
</div>
```

### 4.4 Save to Record

```typescript
addPulseRecord({
  date: new Date().toISOString().split("T")[0],
  briefing: data.briefing,
  completedCount: items.filter((x) => x.done).length,
  pendingItems: items.filter((x) => !x.done).map((x) => x.text),
  activeStrategies: strategyOutput?.pillars?.map((p) => p.title) ?? [],
  streakCount: streakCount,
  yesterdayRevenue,
  todayTarget,
  dailyAchievement,
});
```

### 4.5 Backend Update

**Files:** `server.ts` + `worker.ts`

```typescript
// Terima data revenue
const { dna, completedCount, activeStrategies, pendingItems,
        yesterdayRevenue, todayTarget } = req.body;

const dailyAchievement = todayTarget > 0 
  ? Math.round((yesterdayRevenue / todayTarget) * 100) 
  : 0;

// Tambah ke prompt:
// PENCAPAIAN OMZET:
// - Omzet Kemarin: Rp ${(yesterdayRevenue || 0).toLocaleString()}
// - Target Hari Ini: Rp ${(todayTarget || 0).toLocaleString()}
// - Rasio: ${dailyAchievement || 0}%
//
// Jika pencapaian < 80%, sarankan strategi closing.
// Jika pencapaian > 100%, beri selamat dan sarankan eskalasi.
```

---

## 5. File yang Diubah

| # | File | Aksi | Estimasi |
|---|------|------|----------|
| 1 | `src/types.ts` | Ubah — tambah revenue fields ke DailyPulseRecord | 5 menit |
| 2 | `src/components/DailyPulse.tsx` | Ubah — input fields + kalkulasi + UI | 30 menit |
| 3 | `server.ts` | Ubah — terima revenue data di daily-pulse | 10 menit |
| 4 | `worker.ts` | Ubah — sama | 10 menit |

**Total estimasi:** ~55 menit

---

## 6. Acceptance Criteria

- ✅ Input "Omzet Kemarin" dan "Target Hari Ini" muncul di DailyPulse
- ✅ Achievement% terhitung real-time (omzet kemarin / target hari ini)
- ✅ Data tersimpan ke localStorage (survive refresh)
- ✅ AI briefing menggunakan revenue data untuk saran closing
- ✅ Progress bar menunjukkan pencapaian vs target harian
- ✅ Target hari ini default = targetMonthlyRevenue / 30
- ✅ `npm run lint` clean, `npm run build` success

---

## 7. Verification

1. Input omzet Rp 2.100.000, target Rp 2.000.000 → verify tampil 105% Over Target
2. Reload page → verify data masih ada
3. Klik "Acak Tips Baru" → verify briefing menyebut revenue data
4. Build test: `npm run lint` + `npm run build`

---

## 8. Catatan Versi

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| v01 | 2026-06-24 | Initial release — revenue tracking spec |
