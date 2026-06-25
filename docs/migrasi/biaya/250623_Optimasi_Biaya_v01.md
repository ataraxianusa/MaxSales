# Optimasi Biaya Azure
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. 10 Strategi Optimasi Biaya

### 1.1 Front Door → Fungsi Langsung (Dev/Staging)
Selama development, bypass Front Door dan akses Functions langsung via URL.

| Environment | Tanpa Optimasi | Dengan Optimasi |
|-------------|---------------:|----------------:|
| Dev | $35/bulan | $0 |
| Staging | $35/bulan | $0 |
| Production | $35/bulan | $35/bulan |

**Hemat: $35/bulan untuk 2 environment non-prod = $70/bulan**

---

### 1.2 API Management Consumption + Self-Hosted Gateway
APIM Consumption tidak punya reserved capacity. Cost berdasarkan jumlah request.

| Requests/month | Cost Consumption | Cost Developer |
|----------------|----------------:|---------------:|
| <100K | $0 - $3 | $175+ |
| <1M | $3 - $30 | $175+ |

**Hemat: ~$145/bulan dibanding Developer tier**

---

### 1.3 Cosmos DB: Auto-Scale vs Serverless vs Provisioned

| Mode | Cocok Untuk | Biaya |
|------|-------------|:-----:|
| Serverless | Traffic rendah / tidak terduga | $5 - $15 |
| Auto-Scale (400 - 1000 RU) | Traffic moderate, perlu prediktabilitas | ~$15 |
| Manual 400 RU | Traffic sangat rendah | ~$5 |

**Rekomendasi: Serverless** selama traffic < 5,000 request/day.

---

### 1.4 Functions Consumption Plan (vs Premium)

| Plan | Monthly Min | Monthly Estimated |
|------|:-----------:|:-----------------:|
| Consumption | $0 | $0 - $5 |
| Premium (EP1) | $75 | $75 - $100 |

**Hemat: $75/bulan** dengan tetap di Consumption Plan.

---

### 1.5 Budget Alert & Cost Cap

```bicep
resource budget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: 'monthly-budget'
  properties: {
    amount: 100
    timeGrain: 'Monthly'
    notifications: {
      warning: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: ['devops@maxsales.com']
      }
      critical: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        contactEmails: ['devops@maxsales.com']
      }
    }
  }
}
```

---

### 1.6 Cosmos DB TTL untuk Temporary Data

| Container | TTL | Impact |
|-----------|:---:|--------|
| canvas | No TTL | Status - |
| competitors | No TTL | Status - |
| segments | No TTL | Status - |
| generations | 30 days | Prevent storage bloat |

Generations container adalah yang terbesar karena menyimpan semua output AI. TTL 30 hari mencegah biaya storage berlebih.

---

### 1.7 App Insights Sampling

| Mode | Sampling Rate | Monthly Cost |
|------|:------------:|:------------:|
| Full (100%) | - | $5 - $10 |
| Adaptive (50%) | ~50% | $2 - $5 |
| Fixed (10%) | ~90% | $0.5 - $1 |

**Rekomendasi:** Adaptive sampling cukup untuk production.

---

### 1.8 Right-Sizing Multi-Environment

Dev dan staging bisa menggunakan Shared Infrastructure:
- 1x Cosmos DB Serverless (shared via container-level RBAC)
- Functions di 1x Consumption Plan (slot per environment)
- 1x Key Vault (shared, secret isolation via naming)

---

### 1.9 RI / Savings Plan (Jika Sudah Scale)

Setelah traffic > 50K request/hari, pertimbangkan:
- 1-year Reserved Instance untuk Cosmos DB (hemat ~30%)
- Azure Savings Plan untuk compute (hemat ~20%)

---

### 1.10 Hentikan Resources Non-Prod di Malam Hari

Untuk optimalisasi maksimal, environment dev/staging bisa dimatikan:
- Fungsi: Set App Service Plan ke 0 instance (tidak bisa di Consumption)
- Cosmos DB: Tidak bisa dimatikan (serverless masih charge untuk storage)

---

## 2. Target Biaya Bulanan

| Component | Tanpa Optimasi | Dengan Optimasi |
|-----------|:--------------:|:---------------:|
| Front Door (Prod) | $35 | $35 |
| Front Door (Dev/Stg) | $70 | $0 |
| API Management | $3 | $3 |
| Functions | $5 | $5 |
| Cosmos DB | $15 | $10 |
| Key Vault | $1 | $1 |
| App Insights | $5 | $2 |
| **Total** | **$134** | **$56** |

---

*Dokumen optimasi biaya — strategi penghematan biaya untuk MaxSales di Azure*
