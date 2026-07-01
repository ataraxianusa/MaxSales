# MaxxSales — Azure Infrastructure Plan: Staging & Production

**Dibuat:** 2025-06-30 | **Versi:** v01 | **Status:** Approved (IaC generated)  
**Format IaC:** Bicep (single-file, env-driven)  
**Target Scope:** Resource Group (separate RGs per environment)

---

## Overview

MaxxSales adalah **production workload** — hasil validasi experiment dari MaxSales. Arsitektur two-environment: **staging** (validasi sebelum release) dan **production** (live, customer-facing). Semua learnings dari MaxSales experiment diterapkan di sini.

### Experiment → Staging → Production Flow

```
MaxSales (exp)                    MaxxSales (stg)                    MaxxSales (prod)
/EXPERIMENT/MaxSales/             /VOXIA/MaxxSales/                  /VOXIA/MaxxSales/
                                                                     
Explore, POC, test               Validasi, integration test          Live traffic
Consumption tier                 Premium EP1, autoscale DB          Premium EP2, autoscale DB
Serverless Cosmos DB              Provisioned Cosmos DB              Provisioned Cosmos DB (higher)
No KV, no MI                     KV RBAC + User-Assigned MI         KV RBAC + Purge Protection
                                                                     
  └──► Lolos validasi ──────────►┘ Lolos QA ──────────────────────►┘
       Promosikan ke staging          Promosikan ke production
```

---

## Architecture Comparison

| Component | MaxSales (exp) | MaxxSales (stg) | MaxxSales (prod) |
|-----------|---------------|-----------------|------------------|
| **Functions** | Consumption (Y1) | Premium EP1 | Premium EP2 |
| **Cosmos DB** | Serverless | Autoscale provisioned | Autoscale provisioned (higher max) |
| **Storage** | Standard_LRS | Standard_LRS | Standard_LRS |
| **Key Vault** | Standard, no purge prot. | Standard, no purge prot. | Standard, purge prot. ON |
| **Identity** | User-Assigned MI | User-Assigned MI | User-Assigned MI |
| **Static Web App** | — | Free tier | Standard tier |
| **Frontend** | Cloudflare Pages | SWA (develop branch) | SWA (main branch) |
| **Auth** | — | Google OAuth | Google OAuth |
| **OpenAI** | — | GPT-4o | GPT-4o |
| **Region** | eastus | southeastasia | southeastasia |
| **Est. Biaya** | ~$5–$20 | ~$150–$250 | ~$300–$500 |

---

## What Changed from Existing Infra

Existing MaxxSales `infra/main.bicep` was analyzed. Enhancements:

| Existing | Enhanced | Reason |
|----------|----------|--------|
| System-Assigned MI | User-Assigned MI | Reusable, survives deletion, CMK-ready |
| Plaintext env vars for secrets | Key Vault RBAC + `@Microsoft.KeyVault()` refs | No secrets in code/app settings |
| No Cosmos DB | Cosmos DB provisioned autoscale | Data layer needed for e-commerce |
| Consumption plan | Premium EP1/EP2 | No cold starts, Always Ready, VNet-ready |
| OpenAI key in plan | OpenAI key in Key Vault | Secure secret storage |
| `AzureWebJobsStorage` with account key | `AzureWebJobsStorage__accountName` + MI | Passwordless storage auth |
| Single env (dev) | Dual env (stg + prod) | Staged deployment pipeline |

---

## Deployment

### Prasyarat
```bash
az login
az group create --name rg-maxxsales-stg-sea --location southeastasia
az group create --name rg-maxxsales-prod-sea --location southeastasia
```

### Deploy Staging
```bash
az deployment group create \
  --resource-group rg-maxxsales-stg-sea \
  --template-file infra/main.bicep \
  --parameters infra/parameters/main.stg.bicepparam

# Post-deploy setup (RBAC + secrets)
ENVIRONMENT=stg bash infra/scripts/post-deploy.sh
```

### Deploy Production (after staging QA pass)
```bash
az deployment group create \
  --resource-group rg-maxxsales-prod-sea \
  --template-file infra/main.bicep \
  --parameters infra/parameters/main.prod.bicepparam

# Post-deploy setup
ENVIRONMENT=prod bash infra/scripts/post-deploy.sh
```

---

## File Structure (to copy to /VOXIA/MaxxSales/)

```
MaxxSales/
├── .azure/
│   └── infrastructure-plan.json
├── infra/
│   ├── main.bicep                 ← Single Bicep (env-driven via param)
│   ├── parameters/
│   │   ├── main.stg.bicepparam
│   │   └── main.prod.bicepparam
│   └── scripts/
│       └── post-deploy.sh
```

---

## Post-Deployment Checklist

- [ ] Cosmos DB Data Contributor role assigned to MI
- [ ] Key Vault Secrets User role assigned to MI
- [ ] Storage Blob Data Contributor role assigned to MI
- [ ] App Insights connection string stored in KV
- [ ] OpenAI key stored in KV
- [ ] Function App restarted (KV refs require restart)
- [ ] `disableLocalAuth` verified on Cosmos DB
- [ ] Google OAuth configured in SWA portal

---

## Key Design Decisions

| Decision | Why |
|----------|-----|
| Single Bicep file (no modules) | Simple, env-driven via parameter. Staging & prod dari satu file. |
| `environment` parameter drives all config | `stg` = EP1/Free/7-day/purge-off. `prod` = EP2/Standard/90-day/purge-on. |
| User-Assigned MI over System-Assigned | Survives resource deletion, reusable across redeployments. |
| `disableLocalAuth: true` on Cosmos DB | Zero-trust — all access via Entra ID RBAC. |
| OpenAI key in KV, not plaintext | Existing Bicep had `openAiApiKey` as plain param. Moved to KV secret. |
| `AzureWebJobsStorage__accountName` instead of connection string | Let Functions SDK authenticate via managed identity. |
| Premium EP1/EP2 instead of Consumption | No cold starts. Always Ready untuk latency-sensitive endpoints. |
| No VNet/Private Endpoints yet | Phase 2. Public endpoints with HTTPS + TLS 1.2 + auth headers. |

---

## Perkiraan Biaya Bulanan

| Resource | Staging | Production |
|----------|---------|------------|
| Functions Premium | ~$80 (EP1) | ~$160 (EP2) |
| Cosmos DB autoscale | ~$25–$50 | ~$50–$150 |
| Storage Account | ~$2 | ~$5 |
| Key Vault | ~$0.03 | ~$0.03 |
| Log Analytics | ~$5 | ~$10 |
| Static Web App | Free | ~$9 |
| **Total** | **~$115–$140** | **~$240–$340** |

---

## Phase 2 Upgrade Path (Future)

- VNet + Private Endpoints (all services)
- Zone redundancy (Functions ZRS storage, Cosmos DB zone-redundant)
- Azure Front Door + WAF (global CDN, DDoS protection)
- Multi-region Cosmos DB (japaneast/eastus secondary)
- RBAC custom roles (least privilege)
- CI/CD: GitHub Actions deploy per environment

---

## File Inventory (dalam `docs/maxxsales/`)

| File | Description |
|------|-------------|
| `.azure/infrastructure-plan.json` | Machine-readable plan |
| `infra/main.bicep` | Enhanced Bicep (single-file, env-driven) |
| `infra/parameters/main.stg.bicepparam` | Staging params |
| `infra/parameters/main.prod.bicepparam` | Production params |
| `infra/scripts/post-deploy.sh` | RBAC + secrets setup script |
| `250630_MaxxSales_StagingProd_Plan_v01.md` | This report |

---

*Dihasilkan oleh Azure Enterprise Infra Planner. Copy semua file dari `docs/maxxsales/` ke `/home/ics/Projects/VOXIA/MaxxSales/` untuk deployment.*
