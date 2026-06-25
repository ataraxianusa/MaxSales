# Analisis Biaya Azure
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Cost Estimation Summary

| Resource | Tier | Estimated Monthly | Annual |
|----------|------|------------------:|-------:|
| Azure Functions | Consumption (Pay-per-exec) | $0 - $5 | $0 - $60 |
| Cosmos DB | Serverless | $5 - $15 | $60 - $180 |
| API Management | Consumption | $0 - $3 | $0 - $36 |
| Front Door | Standard | $35 | $420 |
| Key Vault | Standard | $1 | $12 |
| App Insights | Pay-as-you-go | $2 - $5 | $24 - $60 |
| **TOTAL** | | **$43 - $64** | **$516 - $768** |

---

## 2. Detail Per Resource

### 2.1 Azure Functions (Consumption Plan)

| Component | Cost |
|-----------|-----:|
| Execution (first 1M/month) | FREE |
| Execution (after 1M) | $0.20 per million |
| Execution time (first 400,000 GB-s) | FREE |
| Execution time (after) | $0.000016 per GB-s |

**Estimasi untuk MaxSales:**
- 500 requests/day × 30 days = 15,000 executions/month → FREE tier
- Average execution time: 5 seconds
- Average memory: 256 MB
- GB-s per month: 15,000 × 5s × 0.25 GB = 18,750 GB-s → FREE tier
- **Monthly cost: $0 - $5** (jika traffic naik 10x)

### 2.2 Cosmos DB (Serverless)

| Component | Cost |
|-----------|-----:|
| Storage | $0.25 per GB/month |
| Throughput (RU/s) | Pay-per-request |

**Estimasi untuk MaxSales:**
- Estimated storage: ~500 MB (text-based business data)
- 5,000 requests/day × 30 days = 150,000 RU/month
- ~1,000 RU per request average
- **Monthly cost: $5 - $15**

### 2.3 Azure Front Door

| Component | Cost |
|-----------|-----:|
| Standard tier | $35/month fixed |

**Monthly cost: $35** (fixed, regardless of traffic volume)

---

## 3. Traffic-Dependent Cost Scenarios

| Scenario | Requests/day | Monthly Cost |
|----------|-------------|------------:|
| Development (minimal) | < 100 | $36 - $40 |
| Launch (low traffic) | 500 | $43 - $48 |
| Growth (medium) | 5,000 | $50 - $65 |
| Scale (high) | 50,000 | $75 - $120 |

---

## 4. Comparison: Current vs Azure

| Item | Current (Cloudflare Workers) | Azure Target |
|------|:---------------------------:|:------------:|
| Hosting | Free tier | $35 (Front Door fixed) |
| Compute | $0 (Workers) | $0 - $5 (Functions) |
| Database | $0 (localStorage) | $5 - $15 (Cosmos DB) |
| Monitoring | $0 | $2 - $5 (App Insights) |
| **Total** | **$0** | **$43 - $64** |

**Catatan:** Saat ini MaxSales tidak punya biaya hosting karena menggunakan free tier Cloudflare Workers + semua data in-memory. Migrasi ke Azure menambahkan biaya tetap $35/bulan untuk Front Door + biaya variabel.

---

*Dokumen analisis biaya — perkiraan biaya migrasi MaxSales ke Azure*
