# Timeline Migrasi Azure — Updated
**Versi:** v02 | **Tanggal:** 2025-06-25 | **Klasifikasi:** Internal

> **Changelog v01 → v02:**
> - Menambahkan tasks untuk tactical briefing (endpoint #8, 3-chain prompt)
> - Menambahkan tasks untuk DNA field expansion (peakHours, topConvertingChannel)
> - Menambahkan tasks untuk frontend refactor (DailyPulse, BusinessCanvas)
> - Status milestone diperbarui: tactical briefing & DNA fields sudah completed

---

## Fase 0: Completed Work (Pre-Migration)

| # | Task | Status | Date | PR |
|---|------|--------|------|-----|
| 0.1 | Implementasi `/api/tactical-briefing` — 3-chain prompt | ✅ Done | 25 Jun | #19, #21 |
| 0.2 | Frontend integration — DailyPulse.tsx wiring | ✅ Done | 25 Jun | #20 |
| 0.3 | DNA field expansion — `peakHours`, `topConvertingChannel` | ✅ Done | 25 Jun | #23 |
| 0.4 | BusinessCanvas UI — "Performa Real-Time" tab | ✅ Done | 25 Jun | #24 |
| 0.5 | Markdown parsing fix — checklist stripping | ✅ Done | 25 Jun | #22 |
| 0.6 | Worker deployment — Cloudflare Workers update | ✅ Done | 25 Jun | via `wrangler deploy` |

---

## Fase 1: Persiapan Infrastruktur Azure (Minggu 1-2)

| Minggu | Task | Owner | Deliverable |
|--------|------|-------|-------------|
| W1 | Provision resource group `rg-maxsales-prod` di Southeast Asia | DevOps | Resource group aktif |
| W1 | Setup Azure Functions Premium Plan (EP1) | DevOps | Function app berjalan |
| W1 | Provision Cosmos DB serverless (Southeast Asia) | DevOps | Database endpoint aktif |
| W2 | Setup Azure Key Vault + App Configuration | DevOps | Secrets & config terpusat |
| W2 | Setup Application Insights workspace | DevOps | Monitoring aktif |
| W2 | Deploy Azure Front Door (opsional — lihat optimasi biaya) | DevOps | CDN/WAF endpoint |

---

## Fase 2: Migrasi Kode & Data (Minggu 3-7)

| Minggu | Task | Owner | Detail |
|--------|------|-------|--------|
| W3 | **Refactoring: konsolidasi duplikasi kode** | Backend | Gabungkan `callOpenRouter()` & `parseJsonResponse()` ke shared utility. `src/tactical-briefing.ts` jadi template pattern. |
| W3 | **11 endpoint porting ke Azure Functions** | Backend | 11 function apps: status, generate-content, suggest-content, strategy-forge, daily-pulse (legacy), analyze-competitor, analyze-segments, chat, tactical-briefing, auto-segment, predict-revenue, cluster-customers |
| W4 | **AI Adapter multi-provider** | Backend | Factory pattern (OpenRouter + Azure OpenAI + Simulation). Retry/fallback untuk 3-chain. ⚠️ Tactical briefing = 3 sequential calls, perlu error handling di tengah chain. |
| W4 | **Cosmos DB schema design** | Backend | 4 containers: `business-dna`, `competitors`, `segments`, `tactical-briefings`. ⚠️ Schema harus mendukung 2 field DNA baru. |
| W5 | **Unit & integration tests** | QA | 11 endpoints + 3-chain failure scenarios + fallback simulator. Contract tests untuk setiap response format. |
| W5 | **Frontend API_BASE switch** | Frontend | Ganti `VITE_API_URL` dari Worker URL ke Azure Functions URL. Test setiap module (DailyPulse, StrategyForge, ContentGenerator, DNA Canvas). |
| W6 | **Playwright E2E tests** | QA | Flow: Login → Isi DNA → Competitor War Room → Customer Insight → Tactical Briefing (klik "Acak Tips Baru") → Checklist → Copy Amunisi. |
| W6 | **k6 load testing** | DevOps | Threshold: p95 < 3s, error rate < 1%. ⚠️ Tactical briefing = latency lebih tinggi karena 3-chain. |
| W7 | **Canary deployment 10%** | DevOps | Traffic splitting via Front Door / Traffic Manager. Monitor error rate, latency, token usage. |

---

## Fase 3: Validasi & Staging (Minggu 8-9)

| Minggu | Task | Owner | Detail |
|--------|------|-------|--------|
| W8 | **Canary 50%** | DevOps | Perluas traffic. Bandingkan Worker vs Azure latency. |
| W8 | **Cosmos DB data migration** | Backend | Migrasi dari localStorage ke Cosmos DB. ⚠️ Pertahankan localStorage sebagai cache offline. |
| W9 | **Canary 100%** | DevOps | Full Azure. Worker tetap sebagai cold standby. |
| W9 | **Security audit** | Security | WAF rules, managed identity, RBAC, private endpoints. |

---

## Fase 4: Go-Live & Stabilisasi (Minggu 10-12)

| Minggu | Task | Owner | Detail |
|--------|------|-------|--------|
| W10 | **Production go-live** | DevOps | Slot swap staging → production. DNS switch ke Azure Front Door. |
| W10 | **24/7 monitoring (week 1)** | DevOps | On-call rotation. Alert thresholds: error rate > 1%, p95 > 3s. |
| W11 | **Performance tuning** | Backend | Optimasi cold start. Cache frequent prompts. Cosmos DB indexing. |
| W12 | **Documentation handover** | All | Runbook, architecture diagrams, API docs (updated). |
| W12 | **Post-mortem & retrospective** | PM | Lessons learned. Next phase planning. |

---

## Milestones

| # | Milestone | Target Date | Status |
|---|-----------|-------------|--------|
| M0 | Tactical briefing + DNA expansion completed | 25 Jun 2026 | ✅ |
| M1 | Azure infrastructure provisioned | W2 | ⏳ |
| M2 | 11 endpoints running on Azure Functions | W4 | ⏳ |
| M3 | Cosmos DB integration + data migration | W5 | ⏳ |
| M4 | Canary 50% — Azure vs Worker parity | W8 | ⏳ |
| M5 | Production go-live | W10 | ⏳ |
| M6 | Post-stabilization | W12 | ⏳ |

---

## Risk Matrix (Updated)

| Risk | Severity | Mitigation | Status |
|------|----------|------------|--------|
| 3-chain latency > target | High | Parallelize chain 1+2? Track latency per chain. | Active |
| Cosmos DB cold start | Medium | Keep serverless warm. Provisioned mode sebagai fallback. | Active |
| AI prompt drift setelah migrasi | Medium | Contract tests untuk setiap response format. Temperature consistency check. | Active |
| Terminology regression ("UMKM" leak) | Low | Pre-commit hook audit system prompts. | Active |

---

*Timeline migrasi — diperbarui dengan tactical briefing & DNA expansion sebagai completed pre-migration work*
*Source: docs/migrasi/implementasi/250623_Timeline_Migrasi_v01.md, PR #19-#24, project status 25 Juni 2026*