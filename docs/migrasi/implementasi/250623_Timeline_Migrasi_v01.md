# Timeline Migrasi Azure
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Phase Overview (12 Minggu)

| Phase | Minggu | Fokus | Deliverable |
|-------|--------|-------|-------------|
| **I: Persiapan & Foundations** | 1-3 | Infrastruktur awal, CI/CD, setup tools | Azure env ready |
| **II: Core Migration** | 4-7 | Refactor API, Cosmos DB, AI adapter | API berjalan di Azure |
| **III: Frontend & Testing** | 8-10 | Integrasi frontend, testing, perf test | Full integration |
| **IV: Go-Live** | 11-12 | Canary deploy, monitor, rollback plan | Production live |

---

## 2. Phase I: Persiapan & Foundations (Minggu 1-3)

### Minggu 1: Azure Setup

| Task | Owner | Duration |
|------|-------|:--------:|
| Buat Azure subscription & resource group | DevOps | 1 hari |
| Deploy Bicep template: VNet, Key Vault, Cosmos DB, Functions | DevOps | 2 hari |
| Configure Managed Identity + RBAC | DevOps | 1 hari |
| Setup DNS (CNAME ke Front Door) | DevOps | 1 hari |

### Minggu 2: CI/CD Pipeline

| Task | Owner | Duration |
|------|-------|:--------:|
| Setup GitHub Actions: build + deploy to Azure | DevOps | 2 hari |
| Create staging slot + production slot | DevOps | 1 hari |
| Configure smoke tests + approval gate | DevOps | 1 hari |
| Rollback workflow setup | DevOps | 1 hari |

### Minggu 3: Tools & Monitoring

| Task | Owner | Duration |
|------|-------|:--------:|
| Setup Azure Monitor + App Insights | DevOps | 1 hari |
| Configure alerts (error rate, response time) | DevOps | 1 hari |
| Setup WAF policies on Front Door | Security | 1 hari |
| Setup budget alerts | DevOps | 0.5 hari |

---

## 3. Phase II: Core Migration (Minggu 4-7)

### Minggu 4: Shared Code + AI Adapter

| Task | Owner | Duration |
|------|-------|:--------:|
| Extract shared utilities (callOpenRouter, parseJsonResponse) | BE | 1 hari |
| Implement AIProvider interface | BE | 1 hari |
| OpenRouterProvider implementation | BE | 1 hari |
| SimulationProvider (fallback) implementation | BE | 1 hari |
| Factory pattern + provider selection | BE | 1 hari |

### Minggu 5: Azure Functions

| Task | Owner | Duration |
|------|-------|:--------:|
| Create Function App project structure | BE | 1 hari |
| Migrate /status endpoint | BE | 0.5 hari |
| Migrate /generate-content-text endpoint | BE | 1 hari |
| Migrate /strategy-forge endpoint | BE | 1 hari |
| Migrate /daily-pulse endpoint | BE | 0.5 hari |
| Migrate remaining endpoints (analyze-* + chat) | BE | 1 hari |

### Minggu 6: Cosmos DB Integration

| Task | Owner | Duration |
|------|-------|:--------:|
| Create Cosmos DB containers + partition keys | BE | 0.5 hari |
| Implement data access layer (read/write) | BE | 2 hari |
| TTL configuration for generations container | BE | 0.5 hari |
| Seed initial demo data | BE | 1 hari |
| Query optimization + pagination | BE | 1 hari |

### Minggu 7: Integration Testing

| Task | Owner | Duration |
|------|-------|:--------:|
| Unit test: AI adapter (3 providers) | BE | 1 hari |
| Integration test: all 7 endpoints on Azure | BE | 2 hari |
| End-to-end test: full request flow | BE | 1 hari |
| Cosmos DB CRUD test | BE | 1 hari |

---

## 4. Phase III: Frontend & Testing (Minggu 8-10)

### Minggu 8: Frontend Integration

| Task | Owner | Duration |
|------|-------|:--------:|
| Update API base URL in src/api.ts | FE | 0.5 hari |
| Add CORS configuration for new domain | FE | 0.5 hari |
| Environment variable update (VITE_API_URL) | FE | 0.5 hari |
| Test all 5 dashboard modules | FE | 2 hari |
| Deploy updated frontend to GitHub Pages | FE | 0.5 hari |

### Minggu 9: Performance & Load Testing

| Task | Owner | Duration |
|------|-------|:--------:|
| Load test: 50 concurrent users, 25 req/s | QA | 1 hari |
| Load test: 100 concurrent users, 50 req/s | QA | 1 hari |
| Cold start measurement | QA | 0.5 hari |
| Cosmos DB RU consumption analysis | QA | 0.5 hari |
| API response time benchmarking | QA | 1 hari |

### Minggu 10: Security & Compliance

| Task | Owner | Duration |
|------|-------|:--------:|
| WAF rule validation | Security | 1 hari |
| Penetration test (automated) | Security | 1 hari |
| Compliance checklist sign-off | PM | 0.5 hari |
| DR drill: simulated failover | DevOps | 1 hari |

---

## 5. Phase IV: Go-Live (Minggu 11-12)

### Minggu 11: Canary Deployment

| Day | Action | Traffic |
|:---:|--------|:-------:|
| Mon | Deploy to staging, run smoke tests | 0% |
| Tue | Enable canary via Front Door | 10% |
| Wed | Monitor metrics, error rate, latency | 10% |
| Thu | Increase canary | 50% |
| Fri | Full production switch | 100% |

### Minggu 12: Monitoring & Stabilisasi

| Task | Owner | Duration |
|------|-------|:--------:|
| 24/7 monitoring post-migration | DevOps | 5 hari |
| Crash report & hotfixes | BE | 5 hari |
| Performance tuning | BE | 2 hari |
| Document lessons learned | All | 1 hari |
| Close migration project | PM | 1 hari |

---

## 6. Milestones

| Milestone | Date | Deliverable |
|-----------|:----:|-------------|
| M1: Azure Infrastructure Ready | Week 3 | VNet, Key Vault, Cosmos DB, Functions deployed |
| M2: CI/CD Pipeline Green | Week 4 | Build → Deploy → Test cycle passing |
| M3: All APIs Running on Azure | Week 7 | 7 endpoints tested |
| M4: Full Integration Complete | Week 10 | Frontend + Backend end-to-end |
| M5: Production Live | Week 11 | 100% traffic on Azure |
| M6: Post-Migration Stable | Week 12 | All metrics green |

---

*Dokumen timeline migrasi — jadwal 12 minggu migrasi MaxSales ke Azure*
