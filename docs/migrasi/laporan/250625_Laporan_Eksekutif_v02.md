# Laporan Eksekutif — Migrasi MaxSales ke Microsoft Azure
**Versi:** v02 | **Tanggal:** 2025-06-25 | **Klasifikasi:** CONFIDENTIAL

> **Changelog v01 → v02:**
> - Mencatat progress signifikan: tactical briefing (3-chain prompt) + DNA expansion telah completed
> - Arsitektur endpoint: 7 → 8
> - DNA fields: 57 → 59
> - Pre-migration work yang sudah selesai mengurangi risiko Fase 2

---

## Ringkasan Eksekutif

MaxSales saat ini berjalan di **Cloudflare Workers** dengan arsitektur dual-codebase (worker.ts + server.ts) yang identik dan tidak memiliki persistent storage. Seluruh data bisnis disimpan di memory/browser localStorage — tidak ada history, backup, atau session sharing antar pengguna.

**Masalah Utama (sama dengan v01):**
1. **Dual-codebase:** Setiap perubahan API harus dilakukan 2x (worker.ts + server.ts)
2. **Zero persistence:** Data hilang saat server restart atau browser refresh
3. **No observability:** Tidak ada monitoring, logging, atau alerting
4. **No scalability:** Semua request diproses secara ephemeral tanpa caching/rate limiting

**Solusi:** Migrasi ke Microsoft Azure dengan arsitektur modern menggunakan Azure Functions, Cosmos DB, API Management, dan Front Door.

---

## Progress Sejak v01 (23 Juni → 25 Juni)

Sejak laporan eksekutif v01, tim telah menyelesaikan **pre-migration work** yang signifikan:

| Capaian | Detail | Dampak |
|---------|--------|--------|
| **Endpoint #8: `/api/tactical-briefing`** | 3-chain prompt (GapAnalyzer → ExecutionPlan → CommsWriter) | Inti dari Strategy Forge / Daily Pulse — output AI membumi & taktis |
| **DNA field expansion** | +`peakHours`, +`topConvertingChannel` (57 → 59 fields) | AI sekarang tahu kapan & di mana eksekusi paling efektif |
| **DailyPulse.tsx refactor** | Hardcoded checklist → AI-generated | Checklist dinamis dari 3-chain output, siap copy-paste |
| **"Performa Real-Time" UI tab** | Tab ke-6 di Business Canvas DNA | Pengusaha bisa input jam sibuk & channel konversi |
| **Terminology policy** | Zero "UMKM/UKM/Mikro" di seluruh prompt | Brand positioning konsisten: "Pengusaha", "Pelaku Usaha" |
| **Shared module pattern** | `src/tactical-briefing.ts` — dipakai worker.ts & server.ts | Template untuk eliminasi duplikasi dual-codebase |

**Progress terhadap total scope migrasi:** ~15% (pre-migration work completed)

---

## Arsitektur Saat Ini (v02 Snapshot)

```
8 Endpoints aktif:
├─ /api/status                    GET   [no AI]
├─ /api/generate-content-text     POST  [AI: 1 call]
├─ /api/strategy-forge            POST  [AI: 1 call]
├─ /api/daily-pulse               POST  [AI: 1 call, legacy]
├─ /api/analyze-competitor        POST  [AI: 1 call]
├─ /api/analyze-segments          POST  [AI: 1 call]
├─ /api/chat                      POST  [AI: 1 call]
└─ /api/tactical-briefing         POST  [AI: 3 calls, chain] ⭐ NEW

Shared Module: src/tactical-briefing.ts (387 lines)
DNA Interface: 59 fields (57 original + 2 new)
UI Tabs: 6 (5 original + "Performa Real-Time")
```

---

## Timeline (Updated)

| Fase | Duration | Status |
|------|----------|--------|
| **Fase 0: Pre-Migration** | 25 Juni 2026 | ✅ Completed |
| Fase 1: Infrastruktur Azure | Minggu 1-2 | ⏳ Pending |
| Fase 2: Migrasi Kode & Data | Minggu 3-7 | ⏳ Pending |
| Fase 3: Validasi & Staging | Minggu 8-9 | ⏳ Pending |
| Fase 4: Go-Live & Stabilisasi | Minggu 10-12 | ⏳ Pending |

---

## Budget (sama dengan v01)

| Layanan Azure | Estimasi Bulanan |
|---------------|-----------------|
| Azure Functions (Premium EP1) | $15-25 |
| Cosmos DB (Serverless) | $10-15 |
| Azure Front Door | $10-15 |
| API Management (Developer) | $3-5 |
| Key Vault | $2-3 |
| Application Insights | $3-6 |
| **Total (Optimized)** | **$43-64/bulan** |

---

## Risk Matrix (Updated)

| Risk | Severity | Mitigation | Status |
|------|----------|------------|--------|
| 3-chain latency > target | **High** | Track per-chain latency. Consider parallelize chain 1+2. | **NEW** — active |
| Cosmos DB cold start | Medium | Serverless warm-keep. Provisioned fallback. | Active |
| AI prompt drift pasca migrasi | Medium | Contract tests per endpoint. Temperature consistency. | Active |
| Dual-codebase duplication | Medium | `src/tactical-briefing.ts` pattern proven — extend to other shared utils. | Reduced |
| Terminology regression | Low | Pre-commit hook audit. Strict system prompt rules. | Mitigated |

---

## Rekomendasi Next Steps

1. **Prioritas #1:** Konsolidasi `callOpenRouter()` & `parseJsonResponse()` ke shared utility (ikuti pattern `src/tactical-briefing.ts`)
2. **Prioritas #2:** Provision Azure infrastructure (resource group, functions, Cosmos DB)
3. **Prioritas #3:** Port 11 endpoint (worker.ts) ke Azure Functions dengan AI adapter multi-provider
4. **Prioritas #4:** Cosmos DB schema design — 4 containers termasuk `tactical-briefings`
5. **Prioritas #5:** Frontend `VITE_API_URL` switch ke Azure endpoint

---

*Laporan eksekutif — diperbarui dengan progress tactical briefing, DNA expansion, dan UI refactor*
*Source: PR #19-#24, docs/migrasi/*/250625_*_v02.md, project status 25 Juni 2026*