# Brainstorming Report — Review Feedback & Closed-Loop Implementation Plan

**Versi:** v01 — 24 Juni 2026  
**Modul:** 05 of 05 (Brainstorming / Post-Review)  
**Berdasarkan:** Review manual terhadap Blueprint v01-v02, dengan 3 koreksi utama

---

## 1. Ringkasan Review

Tiga poin koreksi dari review terhadap blueprint:

| # | Issue | Koreksi | Dampak |
|---|-------|---------|--------|
| 1 | **Prompt Chaining: Manusia Hilang dari Loop** | Tidak ada mekanisme user feedback untuk mengoreksi AI. Sistem cuma bicara, tidak mendengar. | AI tidak tumbuh, output stagnan |
| 2 | **Context Session Cache: Prematur untuk MVP** | Backend cache dengan sessionId tidak diperlukan. DNA hanya berubah saat edit (jarang). Token cost masih $0. | Jangan optimasi sebelum 100 user |
| 3 | **Feedback Loop: DNA Masih Buntu** | Dari DailyPulse tidak ada jalur kembali ke Business Canvas. Data real tidak pernah mengoreksi input awal. | Closed-loop tidak tercapai |

---

## 2. Analisis Mendalam per Issue

### 2.1 Issue #1 — Manusia Hilang dari Loop

**Kondisi Saat Ini:**
- StrategyForge → generate strategi → user baca → **selesai**
- DailyPulse → generate briefing → user baca → **selesai**
- ContentGenerator → generate caption → user pakai → **selesai**
- Tidak ada mekanisme "Saya tidak setuju" atau "Ini tidak relevan"

**Dampak:**
- User tidak bisa mengoreksi AI → AI terus generate output yang mungkin tidak relevan
- Tidak ada data untuk memahami mana output yang berguna
- Prompt tidak pernah di-bias berdasarkan preferensi user

**Solusi: User Feedback Button**
- Tombol "👍 Berguna" / "👎 Tidak Relevan" di setiap output AI
- Simpan rasio useful/tidak per prompt type di localStorage
- **Nanti** (Fase 3+): Bias prompt berdasarkan rejection ratio

```typescript
// Contoh: Jika "strategy" punya rejection > 40%
// → bias system prompt: "Prioritaskan strategi low-cost, 
//   user cenderung tolak saran mahal"
```

**Prinsip:** Feedback disimpan di frontend dulu (localStorage). Backend endpoint `/api/feedback` bisa ditambah nanti setelah user >100.

---

### 2.2 Issue #2 — Context Session Cache Prematur

**Kondisi Saat Ini:**
- Blueprint v02 mengusulkan backend session cache dengan `sessionId`
- Setiap API call mengirim DNA lengkap (30+ field)

**Koreksi:**
- DNA hanya berubah saat user edit wizard (sangat jarang)
- Token cost masih $0 (OpenRouter free tier)
- Belum ada user, apalagi 100+
- Cache di `useRef` frontend sudah cukup — hash DNA, skip fetch jika tidak berubah

**Solusi: useRef Hash Checker**
```typescript
const cacheRef = useRef({ dnaHash: "", response: null });

const shouldFetch = (dna, competitors) => {
  const hash = JSON.stringify({ dna, competitors });
  if (hash === cacheRef.current.dnaHash) return false;
  cacheRef.current.dnaHash = hash;
  return true;
};
```

**Prinsip:** Jangan optimasi yang belum jadi bottleneck. Backend cache baru dipertimbangkan setelah user >100 atau ada laporan performa.

---

### 2.3 Issue #3 — DNA Masih Buntu

**Kondisi Saat Ini:**
```text
DNA (input user) → StrategyForge → strategi
DNA (input user) → ContentGenerator → konten
DNA (input user) → DailyPulse → briefing
                                    ↓
                              [SELESAI — tidak ada kembali ke DNA]
```

**Masalah:**
- Jika user input "Target: Ibu Muda" tapi data penjualan menunjukkan 65% pembeli mahasiswi → DNA tidak pernah di-update
- Sistem tidak bisa belajar dari data real

**Solusi: DNA Closed-Loop (7-Hari Check)**
```text
DailyPulse (7 hari) → Analisis data real
    ↓
Deteksi mismatch:
  - Target market di DNA ≠ segmen aktif real
  - Kompetitor baru muncul di briefing
    ↓
Notifikasi ke user:
  "Data 7 hari menunjukkan 65% pembeli adalah mahasiswi.
   Update target market DNA?"
    ↓
Satu klik → semua modul menyesuaikan
```

**Prinsip:** Satu klik update. Jangan bikin user berpikir.

---

## 3. Rencana Implementasi

### Fase 1 — 48 Jam: Chain + Feedback + Cache

| Task | File | Deskripsi |
|------|------|-----------|
| 1.1 | `src/store/ChainContext.tsx` (baru) | Context minimal: competitors, segments, dna, strategyOutput, dailyRecords, feedbackLog |
| 1.2 | `src/App.tsx` | Wrap dashboard dengan `<ChainProvider>`, pass state ke context |
| 1.3 | `src/components/StrategyForge.tsx` | Baca competitors dari context, kirim ke API, simpan strategyOutput, tambah useRef cache |
| 1.4 | `src/components/DailyPulse.tsx` | Baca strategyOutput dari context, kirim ke API, simpan dailyRecord |
| 1.5 | `src/components/AIFeedback.tsx` (baru) | Tombol 👍/👎, simpan ke context + localStorage |
| 1.6 | `src/types.ts` | Tambah StrategyOutput, DailyPulseRecord, FeedbackLog types |
| 1.7 | `server.ts` + `worker.ts` | Terima competitors + activeStrategies di request body, masukkan ke prompt |

**Acceptance Criteria Fase 1:**
- ✅ Competitors dari War Room tersedia di StrategyForge
- ✅ StrategyOutput tersedia di DailyPulse
- ✅ Briefing menyebut strategi yang aktif
- ✅ Tombol feedback muncul di StrategyForge + DailyPulse
- ✅ Feedback tersimpan di localStorage
- ✅ StrategyForge tidak re-fetch saat tab switch (jika DNA tidak berubah)

---

### Fase 2 — Minggu Ini: DNA Closed-Loop + Refinement

| Task | File | Deskripsi |
|------|------|-----------|
| 2.1 | `src/components/ContentGenerator.tsx` | Baca segments dari context, kirim ke API, canvas debounce 300ms |
| 2.2 | `src/hooks/useDNAAutoUpdate.ts` (baru) | Cek mismatch DNA vs data real setelah 7 hari |
| 2.3 | `src/App.tsx` | Panggil useDNAAutoUpdate, render notifikasi banner |
| 2.4 | `src/store/ChainContext.tsx` | Tambah updateDnaField() helper |
| 2.5 | `src/components/CustomerInsight.tsx` | Tambah loading spinner untuk analisis segmen |

**Acceptance Criteria Fase 2:**
- ✅ ContentGenerator mengirim segments + activeStrategies ke API
- ✅ Notifikasi DNA update muncul setelah 7 hari data real mismatch
- ✅ Satu klik update → DNA terubah → semua modul menyesuaikan
- ✅ Canvas tidak lag saat user mengetik cepat

---

## 4. File yang Diubah/Dibuat

| # | File | Aksi | Fase | Estimasi |
|---|------|------|------|----------|
| 1 | `src/store/ChainContext.tsx` | **Baru** | 1 | 1 jam |
| 2 | `src/components/AIFeedback.tsx` | **Baru** | 1 | 30 menit |
| 3 | `src/hooks/useDNAAutoUpdate.ts` | **Baru** | 2 | 1 jam |
| 4 | `src/App.tsx` | Ubah | 1 | 30 menit |
| 5 | `src/components/StrategyForge.tsx` | Ubah | 1 | 1 jam |
| 6 | `src/components/DailyPulse.tsx` | Ubah | 1 | 45 menit |
| 7 | `src/components/ContentGenerator.tsx` | Ubah | 2 | 45 menit |
| 8 | `src/components/CustomerInsight.tsx` | Ubah | 2 | 15 menit |
| 9 | `src/types.ts` | Ubah | 1 | 15 menit |
| 10 | `server.ts` | Ubah | 1 | 30 menit |
| 11 | `worker.ts` | Ubah | 1 | 30 menit |

**Total estimasi:** ~7 jam (Fase 1: ~4 jam, Fase 2: ~3 jam)

---

## 5. Yang TIDAK Dilakukan Sekarang

| Item | Alasan Tunda |
|------|-------------|
| Backend session cache | Prematur, belum 100 user |
| Exponential backoff / retry | Belum ada user complain |
| React.memo semua modul | Prematur optimization |
| Weekly auto-review loop | Tidak bikin user "Wow" dalam 2 menit |
| Growth Dashboard page | Fitur terpisah, setelah core stabil |
| Backend `/api/feedback` endpoint | Cukup localStorage dulu |
| Prompt bias dari rejection ratio | Butuh data feedback > 50 entries |

---

## 6. Alur Data Target (Closed-Loop)

```text
┌─────────────────────────────────────────────────────────────────┐
│                    BusinessCanvas (DNA)                          │
│  brand, productName, advantages, targetMarket, priceRange       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CompetitorWarRoom                               │
│  ──► CompetitorIntel[]                                          │
│      { name, strengths, weaknesses, price, marketShare }        │
└────────────────┬────────────────────────────────────────────────┘
                 │ competitors[]
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CustomerInsight                                 │
│  ──► CustomerSegment[]                                          │
│      { name, count, ltv, churnRisk, behavior }                  │
└────────────────┬────────────────────────────────────────────────┘
                 │ segments[]
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     StrategyForge                                │
│  Input:  dna + competitors[] + segments[] + optimismLevel       │
│  Output: StrategyArea[] + synopsis + priorityActions[]          │
│  ──► strategyOutput (disimpan di context)                       │
│  ──► User Feedback: 👍/👎                                       │
└────────────────┬────────────────────────────────────────────────┘
                 │ strategyOutput
                 ├──────────────────────────────────┐
                 ▼                                  ▼
┌────────────────────────────┐    ┌────────────────────────────┐
│    ContentGenerator        │    │      DailyPulse            │
│  Input: dna + segments     │    │  Input: dna + strategy     │
│         + strategy         │    │         + pendingItems     │
│  Output: caption + hashtags│    │  Output: briefing          │
│  ──► User Feedback: 👍/👎  │    │  ──► dailyRecords[]        │
└────────────────────────────┘    │  ──► User Feedback: 👍/👎  │
                                  └─────────────┬──────────────┘
                                                │
                                                ▼
                                  ┌────────────────────────────┐
                                  │  useDNAAutoUpdate (7 hari)  │
                                  │  Cek mismatch DNA vs real   │
                                  │  → Notifikasi update DNA    │
                                  │  → Satu klik → DNA update   │
                                  │  → Semua modul menyesuaikan │
                                  └────────────────────────────┘
```

---

## 7. Catatan Versi

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| v01 | 2026-06-24 | Initial release — review feedback + implementation plan |
