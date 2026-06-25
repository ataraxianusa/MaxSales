# Skalabilitas & Disaster Recovery
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Arsitektur Skalabilitas

### 1.1 Azure Functions (Compute)

| Aspek | Detail |
|-------|--------|
| Plan | Consumption (Serverless) |
| Scale Unit | Per instance = 1.5 GB RAM, 1 vCPU |
| Max Instances | 200 (default limit) |
| Cold Start | ~3-8 detik (Node.js) |
| Concurrent Executions | Unlimited per instance |
| Scale Trigger | Jumlah requests masuk |

**Scale Behavior:**
```
Request Spike → Functions Host Scale Controller
    ↓
Monitoring metrics (queue length, request rate)
    ↓
Add instances (setiap ~10 detik)
    ↓
Max 200 instances

Scale-down setelah 5-10 menit tidak ada request
```

**Cold Start Mitigation:**
1. Premium Plan (always-on instances) — opsi jika latency < 500ms diperlukan
2. Keep-alive ping tiap 5 menit
3. Gunakan Node.js 20 (startup lebih cepat dari v18)
4. Minimal dependencies — hanya import yang diperlukan per function

### 1.2 Cosmos DB (Storage)

| Mode | RU/s | Use Case |
|------|------|----------|
| Serverless (default) | Auto-scale | Cocok untuk dev/traffic rendah |
| Provisioned (jika perlu) | 400 - 10000 | Untuk production traffic tinggi |

**Scalability Strategy:**
- Partition key design: `/userId` untuk canvas, competitors, segments
- Partition key: `/createdAt` untuk generations (TTL-based)
- Cross-partition queries dihindari (gunakan partition key di query)
- Indexing policy: hanya index field yang diperlukan

### 1.3 API Management

| Tier | Throughput | Use Case |
|------|------------|----------|
| Consumption | Unlimited (metered) | Default (serverless) |
| Developer | 500 req/s | Development |
| Standard | 5000 req/s | Production tinggi |

---

## 2. Load Testing Target

| Metric | Target | Threshold (Alert) |
|--------|--------|-------------------|
| Concurrent Users | 100 | > 100 |
| Requests/second | 50 | > 50 |
| Response Time (p50) | < 1000ms | > 2000ms |
| Response Time (p99) | < 5000ms | > 10000ms |
| Error Rate | < 0.1% | > 1% |

**Load Testing Tools:**
- **k6** — untuk script-based load testing
- **Azure Load Testing** — managed service, integrasi dengan App Insights

---

## 3. Disaster Recovery Plan

### 3.1 Recovery Tiers

| Tier | RPO | RTO | Biaya Tambahan |
|------|-----|-----|----------------|
| Bronze (Default) | 7 hari | 4 jam | $0 |
| Silver | 1 jam | 1 jam | +$10/bulan |
| Gold | 5 menit | 15 menit | +$50/bulan |

### 3.2 Recovery Scenarios

**Scenario 1: Function App Crash**
```
Deteksi: Azure Monitor alert (error rate > 5% dalam 5 menit)
     ↓
Action: Automatic restart oleh platform
     ↓
Eskalasi: Jika restart gagal → deploy dari CI/CD dalam 10 menit
     ↓
Recovery: Swap ke deployment slot sebelumnya
```

**Scenario 2: Cosmos DB Outage**
```
Deteksi: 429 error rate spike / query timeout
     ↓
Action: Enable multi-region reads (Southeast Asia + East Asia)
     ↓
Write failover: Automatic jika primary region down
     ↓
Recovery: Point-in-time restore jika data corrupt
```

**Scenario 3: Full Region Outage**
```
Deteksi: Azure Service Health notification
     ↓
Action: Manual failover ke East Asia region
     ↓
Update DNS: Front Door auto-detects healthy origin
     ↓
Communication: Status page update (status.maxsales.qzz.io)
```

### 3.3 Backup Strategy

| Data | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Cosmos DB (all containers) | Continuous | 7 days | Point-in-time restore |
| Function App Config | Per deploy | 90 days | Git history + slot |
| Key Vault Secrets | On change | Forever | Soft delete |
| Application Insights | Continuous | 90 days | Auto-retention |

---

## 4. High Availability Design

```
                    Azure Front Door (Global)
                           │
              ┌────────────┴────────────┐
              │                         │
     Southeast Asia              East Asia (DR)
     (Primary)                   (Standby)
              │                         │
     ┌────────┴──┐             ┌────────┴──┐
     │ Functions  │             │ Functions  │
     │ Cosmos DB  │             │ Cosmos DB  │
     │ (RW)       │◄──────────►│ (RO)       │
     └────────────┘             └────────────┘
```

**Failover Steps (Regional):**
1. Front Door mendeteksi health probe gagal
2. Traffic dialihkan ke secondary region (2-5 menit)
3. Cosmos DB promote secondary ke read-write
4. Verify semua endpoint jalan
5. Notify admin via email + PagerDuty

---

## 5. Cost Optimization for Scale

| Strategy | Savings | Impact |
|----------|---------|--------|
| Functions Consumption Plan | 100% vs Premium | Cold start trade-off |
| Cosmos DB Serverless | Pay-per-request | Higher cost at scale |
| Response caching | 30-50% fewer AI calls | Slight staleness |
| Request batching | 20-40% fewer API calls | Batch delay |

---

*Dokumen skalabilitas & disaster recovery — strategi untuk production-grade availability*
