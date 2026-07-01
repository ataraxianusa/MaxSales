# Azure Infrastructure Plan — MaxSales Serverless

**Dibuat:** 2025-06-30 | **Versi:** v01 | **Status:** Draft  
**Rencana:** Serverless App dengan Azure Functions + Cosmos DB

---

## Ringkasan Arsitektur

Arsitektur fully-serverless: **Azure Functions (Consumption Plan)** sebagai compute, **Cosmos DB (Serverless)** sebagai database NoSQL, dengan **Storage Account** untuk Functions runtime. Semua komunikasi service-to-service menggunakan **Managed Identity** (passwordless). **Application Insights + Log Analytics** untuk observability. **Key Vault** untuk penyimpanan secrets.

| Komponen | Layanan | Tier/SKU |
|----------|---------|----------|
| Compute | Azure Functions | Consumption (Y1) |
| Database | Cosmos DB (NoSQL API) | Serverless |
| Storage | Storage Account | Standard_LRS, StorageV2 |
| Secrets | Key Vault | Standard |
| Identity | User-Assigned Managed Identity | — |
| Monitoring | Application Insights + Log Analytics | Workspace-based, PerGB2018 |

**Region:** East US (single region)  
**Resource Group:** `rg-maxsales-exp-eastus`

---

## Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                  Resource Group: rg-maxsales-exp-eastus │
│                                                         │
│  ┌──────────────┐    Managed Identity    ┌───────────┐  │
│  │   Key Vault   │◄──────────────────────►│  Cosmos DB │  │
│  │  (secrets)    │                       │ (serverless)│  │
│  └──────┬───────┘                       └─────┬─────┘  │
│         │                                     │         │
│         │ Key Vault refs               Managed │         │
│         │ (App Settings)              Identity  │         │
│         │                                     │         │
│  ┌──────▼──────────────────────────────────▼──┐       │
│  │          Azure Functions                   │       │
│  │      (Consumption Plan, Node.js)           │       │
│  │  ┌──────────────────────────────────────┐  │       │
│  │  │  HTTP Triggers / Timer Triggers      │  │       │
│  │  │  Cosmos DB Input/Output Bindings     │  │       │
│  │  └──────────────────────────────────────┘  │       │
│  └──────┬─────────────────────────────────────┘       │
│         │                                              │
│  ┌──────▼───────┐    ┌──────────────────────┐         │
│  │   Storage    │    │  App Insights +      │         │
│  │   Account    │    │  Log Analytics       │         │
│  │ (Functions   │    │  (telemetry)         │         │
│  │  runtime)    │    │                      │         │
│  └──────────────┘    └──────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## Detail Resource

### 1. Resource Group
| Field | Value |
|-------|-------|
| **Nama** | `rg-maxsales-exp-eastus` |
| **Type** | `Microsoft.Resources/resourceGroups` |
| **Region** | eastus |

Semua resource berada dalam satu resource group — sesuai untuk eksperimen. Production sebaiknya dipisah berdasarkan lifecycle (compute, data, network).

---

### 2. Storage Account
| Field | Value |
|-------|-------|
| **Nama** | `stmaxsalesexpeastus` |
| **Type** | `Microsoft.Storage/storageAccounts` |
| **Kind** | StorageV2 |
| **SKU** | Standard_LRS |
| **TLS** | 1.2 minimum |
| **Blob public access** | Disabled |

Storage account **wajib** untuk Functions runtime. Kind `StorageV2` diperlukan karena Functions butuh Queue dan Table storage. `BlobStorage`/`FileStorage` tidak didukung.

**Constraint:** Consumption Plan tidak bisa pakai storage yang di-secure dengan VNet — hanya Premium/Dedicated plans yang mendukung.

---

### 3. Managed Identity (User-Assigned)
| Field | Value |
|-------|-------|
| **Nama** | `id-maxsales-exp-eastus` |
| **Type** | `Microsoft.ManagedIdentity/userAssignedIdentities` |
| **Region** | eastus |

Identitas tunggal untuk Function App — digunakan untuk akses ke Cosmos DB (RBAC), Key Vault (secret read), dan Storage. User-assigned dipilih karena reusable dan survive resource deletion.

---

### 4. Key Vault
| Field | Value |
|-------|-------|
| **Nama** | `kv-maxsales-exp-eastus` |
| **Type** | `Microsoft.KeyVault/vaults` |
| **SKU** | Standard |
| **RBAC** | Enabled |
| **Soft-delete** | Enabled |
| **Purge protection** | Disabled |

Menyimpan:
- Application Insights connection string (direference via `@Microsoft.KeyVault(SecretUri=...)` di App Settings)
- Cosmos DB endpoint (jika perlu)

Purge protection disabled agar mudah di-cleanup. Production harus di-enable.

---

### 5. Log Analytics Workspace
| Field | Value |
|-------|-------|
| **Nama** | `log-maxsales-exp-eastus` |
| **Type** | `Microsoft.OperationalInsights/workspaces` |
| **SKU** | PerGB2018 |
| **Retention** | 30 hari |

Centralized log aggregation untuk semua resource. PerGB2018 = pay-per-use.

---

### 6. Application Insights
| Field | Value |
|-------|-------|
| **Nama** | `appi-maxsales-exp-eastus` |
| **Type** | `Microsoft.Insights/components` |
| **Mode** | Workspace-based |
| **Workspace** | `log-maxsales-exp-eastus` |

Workspace-based App Insights adalah rekomendasi terbaru. Function App mengirim telemetry (requests, exceptions, dependencies, custom metrics) ke sini.

---

### 7. Cosmos DB (Serverless)
| Field | Value |
|-------|-------|
| **Nama** | `cosmos-maxsales-exp-eastus` |
| **Type** | `Microsoft.DocumentDB/databaseAccounts` |
| **API** | NoSQL (Core/SQL) |
| **Tier** | Serverless |
| **Consistency** | Session |
| **Multi-region** | Disabled (single: eastus) |
| **Zone redundant** | false |
| **Local auth** | Disabled |
| **Public network** | Enabled |

**Serverless constraints (penting!):**
- Single region only — tidak bisa tambah region
- Max 50 GB per container
- Tidak support analytical store
- Tidak support CMK (customer-managed keys)
- `disableLocalAuth: true` = semua akses harus pakai Entra ID (RBAC via managed identity)

Session consistency dipilih — lebih murah 2× dibanding Strong/Bounded Staleness.

**RBAC roles yang diperlukan:**
- Function App managed identity: `Cosmos DB Built-in Data Contributor`

---

### 8. Function App
| Field | Value |
|-------|-------|
| **Nama** | `func-maxsales-exp-eastus` |
| **Type** | `Microsoft.Web/sites` |
| **Kind** | functionapp |
| **Plan** | Consumption (Y1) |
| **Runtime** | Node.js (~4) |
| **Identity** | User-Assigned |
| **HTTPS** | Only |
| **TLS** | 1.2 minimum |
| **FTP** | Disabled |
| **CORS** | Wildcard (*) |
| **Public network** | Enabled |

**Consumption Plan constraints:**
- Cold start saat idle
- Max execution: 10 menit
- Tidak support VNet integration
- Tidak bisa pakai VNet-secured storage
- Tidak support private endpoints

**App Settings:**
| Key | Value |
|-----|-------|
| `FUNCTIONS_WORKER_RUNTIME` | node |
| `FUNCTIONS_EXTENSION_VERSION` | ~4 |
| `AzureWebJobsStorage__accountName` | stmaxsalesexpeastus |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Key Vault reference |
| `CosmosDBConnection__accountEndpoint` | cosmos-maxsales-exp-eastus endpoint |

---

## WAF Pillar Assessment

### Reliability
- ✅ Cosmos DB: Session consistency, single-region
- ⚠️ No zone redundancy (cost tradeoff)
- ⚠️ No geo-replication (Cosmos DB serverless limitation)
- ✅ Functions: auto-scale, platform-managed

### Security
- ✅ Managed Identity untuk semua service-to-service auth
- ✅ Key Vault RBAC untuk secrets
- ✅ Cosmos DB `disableLocalAuth: true` — no keys
- ✅ HTTPS-only, TLS 1.2, FTP disabled
- ⚠️ Public endpoints (cost/experiment tradeoff; exp harus VNet + private endpoints)
- ⚠️ Purge protection disabled (cleanup-friendly; exp harus enable)

### Cost Optimization
- ✅ Consumption Plan — scale to zero
- ✅ Cosmos DB serverless — pay per RU consumed
- ✅ Storage LRS — cheapest redundancy
- ✅ Single region — no cross-region traffic costs
- ✅ Log Analytics PerGB2018 — pay per GB

### Operational Excellence
- ✅ Application Insights untuk tracing, exceptions, metrics
- ✅ Log Analytics untuk centralized logging
- ✅ Workspace-based App Insights (modern, recommended)

### Performance Efficiency
- ✅ Functions auto-scale based on event rate
- ✅ Cosmos DB serverless auto-scales RU/s
- ✅ Session consistency — low latency reads
- ⚠️ Cold start pada Consumption Plan (mitigasi: timer trigger keep-warm jika diperlukan)

---

## Dependensi Deployment

Urutan deployment:

```
1. Resource Group
2. Storage Account        ──┐
3. Managed Identity       ──┤  (parallel)
4. Key Vault              ──┤
5. Log Analytics          ──┘
6. Application Insights   ──► depends: Log Analytics
7. Cosmos DB              ──► depends: Resource Group
8. Function App           ──► depends: Storage, Identity, KV, Cosmos, AppInsights
```

---

## Yang TIDAK Termasuk (Intentional Omissions)

| Item | Alasan |
|------|--------|
| VNet / Subnet | Consumption Plan tidak support VNet integration |
| Private Endpoints | Consumption Plan tidak support private endpoints |
| Azure Front Door / CDN | Overkill untuk eksperimen |
| API Management | Tidak diperlukan untuk eksperimen |
| Zone Redundancy | Cost tradeoff; tidak kritis untuk eksperimen |
| Geo-replication | Cosmos DB serverless tidak support multi-region |
| CI/CD Pipeline | Di luar scope infrastructure plan ini |
| Static Web App | Frontend di-deploy terpisah (lihat wrangler.toml untuk Cloudflare Pages) |

---

## Perkiraan Biaya Bulanan

| Resource | SKU | Estimasi/bulan |
|----------|-----|----------------|
| Azure Functions | Consumption | ~$0 (low traffic) |
| Cosmos DB | Serverless | ~$0–$10 (tergantung RU consumed) |
| Storage Account | LRS | ~$0–$2 |
| Key Vault | Standard | ~$0.03/10K transaksi |
| Log Analytics | PerGB2018 | ~$0–$5 |
| **Total estimasi** | | **~$5–$20/bulan** |

---

## Catatan untuk Production

Jika ingin move ke expuction, upgrade berikut direkomendasikan:

1. **Functions Plan** → Premium (EP1) — untuk VNet integration dan private endpoints
2. **Cosmos DB** → Provisioned throughput (autoscale) — untuk workload predictable
3. **Storage** → ZRS atau GRS — untuk durability
4. **VNet + Private Endpoints** — untuk semua resource
5. **Key Vault** → Enable purge protection
6. **Multi-region** — active-passive DR
7. **Azure Front Door** — global load balancing + WAF
8. **RBAC custom roles** — least privilege untuk managed identity

---

## Referensi

- [Serverless web app with Cosmos DB — Reference Architecture](https://learn.microsoft.com/azure/architecture/solution-ideas/articles/serverless-apps-using-cosmos-db)
- [Azure Functions WAF Service Guide](https://learn.microsoft.com/azure/well-architected/service-guides/azure-functions)
- [Cosmos DB WAF Service Guide](https://learn.microsoft.com/azure/well-architected/service-guides/cosmos-db)
- [Cosmos DB Serverless Documentation](https://learn.microsoft.com/azure/cosmos-db/serverless)
- [Functions + Cosmos DB Bindings](https://learn.microsoft.com/azure/azure-functions/functions-bindings-cosmosdb-v2)

---

*Dokumen ini dihasilkan otomatis oleh Azure Enterprise Infra Planner. File JSON plan lengkap tersedia di `.azure/infrastructure-plan.json`.*
