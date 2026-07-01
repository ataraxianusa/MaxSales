# Azure Infrastructure Plan + Bicep IaC — MaxSales Serverless

**Dibuat:** 2025-06-30 | **Versi:** v02 | **Status:** Approved (IaC generated)  
**Format IaC:** Bicep  
**Target Scope:** Resource Group

---

## Ringkasan Arsitektur

Arsitektur fully-serverless untuk experiment MaxSales: **Azure Functions (Consumption Plan, Node.js)** sebagai compute, **Cosmos DB (Serverless, NoSQL API)** sebagai database. Semua autentikasi service-to-service menggunakan **User-Assigned Managed Identity** (passwordless). **Key Vault** untuk secrets, **Application Insights + Log Analytics** untuk observability.

| Komponen | Resource | Tier |
|----------|----------|------|
| Compute | Azure Functions | Consumption (Y1) |
| Database | Cosmos DB | Serverless |
| Storage | Storage Account | Standard_LRS |
| Identity | Managed Identity | User-Assigned |
| Secrets | Key Vault | Standard (RBAC) |
| Monitoring | App Insights + Log Analytics | Workspace-based |

**Region:** East US | **Resource Group:** `rg-maxsales-exp-eastus` | **Estimasi Biaya:** ~$5–$20/bulan

---

## Struktur File

```
MaxSales/
├── .azure/
│   └── infrastructure-plan.json       ← Machine-readable plan (JSON)
├── infra/
│   ├── main.bicep                     ← Orchestrator
│   ├── main.bicepparam                ← Parameter values
│   └── modules/
│       ├── storage.bicep              ← Storage Account
│       ├── identity.bicep             ← Managed Identity
│       ├── keyvault.bicep             ← Key Vault
│       ├── monitoring.bicep           ← Log Analytics + App Insights
│       ├── cosmos.bicep               ← Cosmos DB (serverless)
│       └── functions.bicep            ← Function App + App Service Plan
└── docs/
    ├── 250630_AzureInfraPlan_MaxSales_v01.md   ← Laporan awal (draft)
    └── 250630_AzureInfraPlan_MaxSales_v02.md   ← Laporan ini (final + IaC)
```

---

## Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Resource Group: rg-maxsales-exp-eastus           │
│                                                                     │
│  ┌──────────────┐              ┌──────────────────────┐             │
│  │   Key Vault   │              │  Managed Identity     │             │
│  │  kv-maxsales- │              │  id-maxsales-exp-eus │             │
│  │  exp-eus     │              └──────────┬───────────┘             │
│  └──────┬───────┘                         │                         │
│         │                                 │ RBAC                    │
│         │ @Microsoft.KeyVault ref         ▼                         │
│         │                    ┌────────────────────────┐             │
│  ┌──────▼────────────────────│   Cosmos DB (serverless)│             │
│  │   Azure Functions         │   cosmos-maxsales-     │             │
│  │   func-maxsales-exp-eus  │   exp-eus             │             │
│  │   (Consumption, Node.js)  │   NoSQL API            │             │
│  │  ┌────────────────────┐   │   Session consistency  │             │
│  │  │ HTTP Triggers      │   │   disableLocalAuth     │             │
│  │  │ Cosmos DB Bindings │   └────────────────────────┘             │
│  │  │ Timer Triggers     │                                         │
│  │  └────────────────────┘                                         │
│  └──────┬─────────────────┐                                        │
│         │                 │                                        │
│  ┌──────▼──────┐   ┌──────▼──────────────────┐                     │
│  │  Storage    │   │  App Insights +          │                     │
│  │  Account    │   │  Log Analytics           │                     │
│  │  stmaxsales │   │  appi-maxsales-exp-eus  │                     │
│  │  expeus    │   │  log-maxsales-exp-eus   │                     │
│  └─────────────┘   └─────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Urutan

Resource dideploy dalam urutan ini (Bicep handle via `dependsOn` implicit):

```
1. Storage Account      ──┐
2. Managed Identity     ──┤  Parallel
3. Key Vault            ──┤
4. Log Analytics        ──┘
5. App Insights         ──► depends: Log Analytics
6. Cosmos DB            ──► depends: Resource Group
7. App Service Plan     ──┐
8. Function App         ──┘  depends: Storage, Identity, KV, Cosmos, AppInsights
```

---

## Cara Deploy

### Prasyarat
```bash
az login
az group create --name rg-maxsales-exp-eastus --location eastus
```

### Validasi
```bash
az bicep build --file infra/main.bicep
```

### Deploy
```bash
az deployment group create \
  --resource-group rg-maxsales-exp-eastus \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

---

## Post-Deployment Steps

Setelah deploy, langkah manual yang diperlukan:

1. **Simpan App Insights connection string ke Key Vault:**
   ```bash
   az keyvault secret set \
     --vault-name kv-maxsales-exp-eus \
     --name AppInsightsConnectionString \
     --value "$(az monitor app-insights component show --app appi-maxsales-exp-eus -g rg-maxsales-exp-eastus --query connectionString -o tsv)"
   ```

2. **Assign Cosmos DB Data Contributor ke Managed Identity:**
   ```bash
   cosmosId=$(az cosmosdb show --name cosmos-maxsales-exp-eus -g rg-maxsales-exp-eastus --query id -o tsv)
   identityPrincipal=$(az identity show --name id-maxsales-exp-eus -g rg-maxsales-exp-eastus --query principalId -o tsv)
   
   az role assignment create \
     --assignee $identityPrincipal \
     --role "Cosmos DB Built-in Data Contributor" \
     --scope $cosmosId
   ```

3. **Assign Key Vault Secrets User ke Managed Identity:**
   ```bash
   kvId=$(az keyvault show --name kv-maxsales-exp-eus -g rg-maxsales-exp-eastus --query id -o tsv)
   
   az role assignment create \
     --assignee $identityPrincipal \
     --role "Key Vault Secrets User" \
     --scope $kvId
   ```

4. **Deploy kode Function App:** (via VS Code, Azure Functions Core Tools, atau CI/CD)

---

## Key Design Decisions

| Keputusan | Alasan |
|-----------|--------|
| Consumption Plan, bukan Premium | True serverless, scale-to-zero, cost minimal untuk experiment |
| Cosmos DB Serverless, bukan provisioned | Pay-per-RU, cocok untuk workload tidak predictable |
| User-Assigned Identity, bukan system-assigned | Reusable, survive resource deletion, CMK-ready |
| Session consistency, bukan Strong | 2× lebih murah, cukup untuk most apps |
| `disableLocalAuth: true` di Cosmos DB | Zero-trust: semua akses via Entra ID RBAC |
| Tidak ada VNet/Private Endpoint | Consumption Plan tidak support VNet integration |
| Tidak ada purge protection di KV | Cleanup-friendly untuk experiment |
| Single region | Cosmos DB serverless tidak support multi-region |

---

## Constraint yang Diidentifikasi

| Constraint | Impact |
|-----------|--------|
| Cosmos DB serverless: single region only | Tidak bisa geo-distribute |
| Cosmos DB serverless: max 50GB/container | Perlu cleanup/monitoring size |
| Functions Consumption: cold starts | Latency spike setelah idle |
| Functions Consumption: no VNet integration | Semua endpoint public |
| Functions Consumption: max 10-min execution | Tidak bisa long-running jobs |

---

## File Bicep Summary

| File | Resources | Outputs |
|------|-----------|---------|
| `modules/storage.bicep` | `Microsoft.Storage/storageAccounts` | name, id |
| `modules/identity.bicep` | `Microsoft.ManagedIdentity/userAssignedIdentities` | name, id, principalId, clientId |
| `modules/keyvault.bicep` | `Microsoft.KeyVault/vaults` | name, uri, id |
| `modules/monitoring.bicep` | `Microsoft.OperationalInsights/workspaces`, `Microsoft.Insights/components` | workspace id, appInsights name/id/connectionString |
| `modules/cosmos.bicep` | `Microsoft.DocumentDB/databaseAccounts` | name, id, endpoint |
| `modules/functions.bicep` | `Microsoft.Web/serverfarms`, `Microsoft.Web/sites` | functionApp name/id/hostname, plan id |
| `main.bicep` | Orchestrates all 6 modules | All key outputs |

---

## Referensi

- [Serverless web app + Cosmos DB Reference Architecture](https://learn.microsoft.com/azure/architecture/solution-ideas/articles/serverless-apps-using-cosmos-db)
- [Azure Functions WAF Service Guide](https://learn.microsoft.com/azure/well-architected/service-guides/azure-functions)
- [Cosmos DB WAF Service Guide](https://learn.microsoft.com/azure/well-architected/service-guides/cosmos-db)
- [Cosmos DB Serverless](https://learn.microsoft.com/azure/cosmos-db/serverless)
- [Functions storage considerations](https://learn.microsoft.com/azure/azure-functions/storage-considerations)
- [Functions Cosmos DB bindings](https://learn.microsoft.com/azure/azure-functions/functions-bindings-cosmosdb-v2)

---

*Dihasilkan oleh Azure Enterprise Infra Planner. Plan JSON: `.azure/infrastructure-plan.json`. Bicep files: `infra/`.*
