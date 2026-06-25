# Rencana Uji Coba
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Testing Strategy Overview

| Layer | Tools | Coverage |
|-------|-------|:--------:|
| Unit | Vitest / Jest | AI adapter, utils, data access |
| Integration | Vitest + chai-http | Azure Functions endpoints |
| E2E | Playwright | Full flow: UI → API → DB |
| Load | k6 | 100 concurrent users, 50 req/s |
| Security | OWASP ZAP | WAF bypass, injection, XSS |

---

## 2. Unit Test Plan

### 2.1 AI Adapter Tests

| Test | Provider | Expected |
|------|----------|----------|
| generateResponse returns valid JSON | OpenRouter | Success |
| generateResponse handles rate limit (429) | OpenRouter | Retry + fallback |
| generateResponse handles server error (5xx) | OpenRouter | Retry 3x + fallback |
| generateResponse returns fallback data | Simulation | Always success |
| Token counting is accurate | All | Match provider response |
| Cost calculation matches rate card | All | Within 5% tolerance |

### 2.2 Utils Tests

| Test | Expected |
|------|----------|
| parseJsonResponse: valid JSON string → parsed object | Success |
| parseJsonResponse: markdown-wrapped JSON → clean JSON | Success |
| parseJsonResponse: malformed JSON → simulation fallback | Fallback |
| sanitizeAISchema: strip unknown fields | Cleaned schema |
| validateRequest: missing required field → 400 | Validation error |

---

## 3. Integration Test Plan

### 3.1 Endpoint Smoke Tests

| Endpoint | Input | Expected Status | Expected Body |
|----------|-------|:-:|:-:|
| GET /status | - | 200 | `{status:"ok",version:"..."}` |
| POST /generate-content-text | {canvasId, brief} | 200 | `{content, tokens}` |
| POST /strategy-forge | {canvasId} | 200 | `{strategies, recommendations}` |
| POST /daily-pulse | {canvasId, metrics} | 200 | `{pulse, insights, alerts}` |
| POST /analyze-competitor | {canvasId,competitorId} | 200 | `{competitor,analysis}` |
| POST /analyze-segments | {canvasId} | 200 | `{segments,insights}` |
| POST /chat | {canvasId,message} | 200 | `{response,context}` |

### 3.2 Edge Cases

| Test | Input | Expected |
|------|-------|----------|
| Empty body → validation error | `{}` | 400 |
| Missing required fields | `{brief:""}` | 400 |
| Invalid canvasId | `{canvasId:"fake"}` | 404 |
| Large payload (>10KB) | Very long brief | 413 |
| Rate limit exceeded | 101 req/min | 429 |

---

## 4. Cosmos DB Integration Tests

| Test | Expected |
|------|----------|
| Save canvas → read back → same data | Match |
| Update canvas → read → updated | Match |
| Delete canvas → read → 404 | Deleted |
| Query by partition key | Correct results |
| TTL expiration (generations) | Auto-deleted after 30d |

---

## 5. E2E Test Plan (Playwright)

| Scenario | Steps | Verification |
|----------|-------|-------------|
| Full content generation | Load app → fill form → generate | Content displayed |
| Strategy forge flow | Load app → click Strategy Fusion → generate | Strategies rendered |
| Dashboard data persistence | Generate → refresh page → data still there | Persisted |
| Error handling | Disconnect network → trigger action | Error message shown |

---

## 6. Load Test Plan (k6)

### 6.1 Scenario

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 25 },  // Ramp up
    { duration: '5m', target: 50 },  // Steady
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% < 3s
    http_req_failed: ['rate<0.01'],     // <1% error
  }
};
```

### 6.2 Targets

| Metric | Target |
|--------|:------:|
| Concurrent users | 100 |
| Requests/second | 50 |
| p95 response time | < 3 seconds |
| Error rate | < 1% |
| Cold start latency | < 5 seconds |

---

## 7. Acceptance Criteria

### Go-Live Gate

- [ ] All 7 endpoints return 200 in staging
- [ ] Load test passes (p95 < 3s, error < 1%)
- [ ] Cosmos DB CRUD operations verified
- [ ] AI adapter: OpenRouter + Simulation both working
- [ ] CORS allows maxsales.qzz.io
- [ ] WAF blocks malicious requests
- [ ] All secrets in Key Vault (no hardcoded values)
- [ ] Rollback procedure tested
- [ ] Frontend dashboard modules all functional
- [ ] Monitoring alerts configured and tested

---

*Dokumen rencana uji coba — testing strategy komprehensif untuk migrasi MaxSales*
