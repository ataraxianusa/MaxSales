# Strategi Migrasi MaxSales ke Azure
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Pendekatan Migrasi: Strangler Fig Pattern

Kami menggunakan pola **Strangler Fig** untuk migrasi bertahap — mengganti komponen satu per satu sementara sistem lama tetap berjalan hingga semua komponen berhasil dimigrasi.

```
Fase 1                     Fase 2                    Fase 3
┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│  Cloudflare  │           │  Cloudflare  │           │  Cloudflare  │
│  Workers     │           │  Workers     │           │  Workers     │
│  (utama)     │           │  (50%)       │           │  (sunset)    │
└──────┬──────┘           └──────┬──────┘           └─────────────┘
       │                         │
       │                         │          ┌─────────────┐
       │                         ├─────────►│  Azure       │
       │                         │          │  Functions    │
       │          ┌─────────────┐│          │  (100%)      │
       │          │  Azure       ││          └─────────────┘
       │          │  Functions   ││
       └─────────►│  (50%)       ││
                  └─────────────┘┘
```

---

## 2. Fase Migrasi (4 Fase × 3 Minggu = 12 Minggu)

### Fase 1: Foundation (Minggu 1-3)

**Tujuan:** Setup infrastruktur Azure dan konsolidasi codebase backend

| Aktivitas | Output | Durasi | Risk |
|-----------|--------|--------|------|
| 1.1 Provision Azure subscription & resources | Resource group, networking | 2 hari | Rendah |
| 1.2 Setup Azure Key Vault untuk secrets | Key Vault + Access Policy | 1 hari | Rendah |
| 1.3 Setup Azure Front Door + DNS | Front Door endpoint, custom domain | 2 hari | Rendah |
| 1.4 Konsolidasi worker.ts + server.ts | Single `azure-function` codebase | 5 hari | Sedang |
| 1.5 Implementasi AI adapter pattern | `ai-adapter.ts` multi-provider | 3 hari | Sedang |
| 1.6 Setup Cosmos DB | Database + containers + indexes | 2 hari | Rendah |
| 1.7 Setup CI/CD pipeline | GitHub Actions workflow | 3 hari | Rendah |

**Gate:** ✅ Azure resources provisioned, consolidated codebase compiles

### Fase 2: Core Migration (Minggu 4-6)

**Tujuan:** Migrasi endpoint API ke Azure Functions + Cosmos DB

| Aktivitas | Output | Durasi | Risk |
|-----------|--------|--------|------|
| 2.1 Migrasi endpoint `/api/status` | Azure Function + tested | 1 hari | Rendah |
| 2.2 Migrasi endpoint `/api/generate-content-text` | Azure Function + AI adapter | 2 hari | Sedang |
| 2.3 Migrasi endpoint `/api/strategy-forge` | Azure Function (complex prompt) | 3 hari | Sedang |
| 2.4 Migrasi endpoint `/api/daily-pulse` | Azure Function + tested | 2 hari | Sedang |
| 2.5 Migrasi endpoint `/api/analyze-competitor` | Azure Function + tested | 2 hari | Rendah |
| 2.6 Migrasi endpoint `/api/analyze-segments` | Azure Function + tested | 2 hari | Rendah |
| 2.7 Migrasi endpoint `/api/chat` | Azure Function (context-aware) | 3 hari | Sedang |
| 2.8 Implementasi Cosmos DB client + CRUD | Cosmos client + data layer | 3 hari | Sedang |

**Gate:** ✅ Semua 7 endpoint berjalan di Azure Functions staging

### Fase 3: Frontend + Integration (Minggu 7-9)

**Tujuan:** Update frontend, integrasi dengan Azure backend, testing komprehensif

| Aktivitas | Output | Durasi | Risk |
|-----------|--------|--------|------|
| 3.1 Update `src/api.ts` ke Azure endpoint | API config updated | 1 hari | Rendah |
| 3.2 Implementasi data persistensi dari frontend | Canvas save/load via Cosmos | 3 hari | Sedang |
| 3.3 E2E testing (lokal vs Azure) | Test report + bug fixes | 5 hari | Sedang |
| 3.4 Performance testing & optimization | Load test report | 3 hari | Sedang |
| 3.5 Setup Azure Monitor + App Insights | Dashboard + alerts | 2 hari | Rendah |
| 3.6 Security audit (WAF, Private Endpoint, Key Vault) | Security report | 2 hari | Rendah |
| 3.7 User acceptance testing | UAT sign-off | 3 hari | Rendah |

**Gate:** ✅ UAT passed, performance meets SLA

### Fase 4: Production Cutover (Minggu 10-12)

**Tujuan:** Deploy production, traffic shifting, monitoring, dan sunset Cloudflare

| Aktivitas | Output | Durasi | Risk |
|-----------|--------|--------|------|
| 4.1 Deploy staging + production environments | Staging + Prod Azure resources | 2 hari | Rendah |
| 4.2 Canary deployment (10% → 50% → 100%) | Traffic shifting, monitoring | 5 hari | Tinggi |
| 4.3 Monitoring & observability | Runbook + alerting | 3 hari | Sedang |
| 4.4 Rollback plan documentation | Rollback procedures | 2 hari | Rendah |
| 4.5 Final testing & verification | Sign-off document | 2 hari | Rendah |
| 4.6 Documentation & knowledge transfer | Architecture docs + runbook | 3 hari | Rendah |
| 4.7 Sunset Cloudflare Workers | Decommission script | 1 hari | Sedang |
| 4.8 Post-mortem & lessons learned | Retrospective report | 1 hari | Rendah |

**Gate:** ✅ Production live di Azure, Cloudflare Workers decommissioned

---

## 3. Traffic Shifting Strategy

### Canary Deployment

```
Minggu 10       Minggu 11       Minggu 12
   │               │               │
   ▼               ▼               ▼
┌──────┐      ┌──────┐        ┌──────┐
│ Azure│      │ Azure│        │ Azure│
│  10% │ ───► │  50% │ ───►   │ 100% │
│ CF 90%│      │ CF 50%│       │ CF 0%│
└──────┘      └──────┘        └──────┘
```

**Monitoring Metrics:**
- Error rate (target: <0.1%)
- Response time (target: <500ms p95)
- Success rate (target: >99.9%)
- User-reported issues (target: 0)

**Rollback Trigger:**
- Error rate > 1% → rollback ke Cloudflare
- Response time > 2s → rollback
- Any 5xx spike > 0.5% → rollback

---

## 4. Rollback Plan

### Instant Rollback (≤ 15 minutes)
1. Update DNS `maxsales.qzz.io` → Cloudflare Workers
2. Frontend: re-deploy previous GitHub Pages build
3. Verify: all endpoints return expected responses
4. Notify: email + status page

### Full Rollback (≤ 2 hours)
1. Revert CI/CD pipeline to GitHub Actions → GitHub Pages
2. Restore wrangler.toml config
3. Restore Cloudflare Workers KV (if used)
4. Full E2E regression test
5. User communication

---

## 5. Risiko & Mitigasi per Fase

| Fase | Risiko | Probabilitas | Dampak | Mitigasi |
|------|--------|-------------|--------|----------|
| 1 | Azure subscription delays | Rendah | Tinggi | Parallel provisioning |
| 1 | Code consolidation breaks API contract | Sedang | Tinggi | Comprehensive test suite |
| 2 | OpenRouter rate limits | Sedang | Sedang | Caching + retry logic |
| 2 | Cosmos DB RU overage | Sedang | Sedang | Serverless mode + monitoring |
| 3 | CORS issues | Rendah | Sedang | Early testing + API Management |
| 3 | Performance regression | Sedang | Tinggi | Load testing in phase 2 |
| 4 | DNS propagation delay | Rendah | Sedang | Low TTL during transition |
| 4 | Unhandled edge case in production | Sedang | Tinggi | Canary + full monitoring |

---

## 6. Environment Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Infrastructure                    │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │ Development  │  │  Staging     │  │  Production   │   │
│  │ - dev-func    │  │  - stg-func  │  │  - prd-func  │   │
│  │ - dev-cosmos  │  │  - stg-cosmos│  │  - prd-cosmos│   │
│  │ - dev-keys    │  │  - stg-keys  │  │  - prd-keys  │   │
│  │ Local testing │  │  Integration │  │  Live traffic │   │
│  └─────────────┘  └──────────────┘  └───────────────┘   │
│                                                           │
│  Secret Isolation:                                        │
│  - Dev: .env file (local development)                     │
│  - Staging: Key Vault with limited access                 │
│  - Production: Key Vault with MFA + RBAC                  │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Success Criteria Checklist

### Technical
- [ ] All 7 API endpoints functional with same contract
- [ ] Response time < 500ms (p95)
- [ ] Availability > 99.9%
- [ ] Error rate < 0.1%
- [ ] Data persistence working (Cosmos DB)
- [ ] AI adapter supporting 3 providers (OpenRouter, Simulation, Azure OpenAI)

### Operational
- [ ] CI/CD pipeline automated
- [ ] Monitoring & alerting configured
- [ ] Backup & DR procedures documented
- [ ] Security compliance validated
- [ ] Runbook created

### Business
- [ ] Zero user-reported data loss
- [ ] Zero downtime during migration
- [ ] Cost within budget (±10%)
- [ ] Team trained on Azure operations

---

*Dokumen strategi migrasi — bagian dari rencana migrasi MaxSales ke Azure*
*Strategy: Strangler Fig Pattern, Canary Deployment, Zero-Downtime Migration*
