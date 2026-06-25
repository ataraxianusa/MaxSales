# Desain Infrastruktur Azure
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Topologi Jaringan

```
                          Internet
                             │
                    ┌────────┴────────┐
                    │ Azure Front Door  │
                    │ (CDN + WAF)       │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │ Azure API Mgmt    │
                    │ (API Gateway)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────┴───┐  ┌──────┴──────┐  ┌───┴─────────┐
     │ Azure      │  │ Azure       │  │ Azure        │
     │ Functions   │  │ Cosmos DB   │  │ Key Vault    │
     │ (Consump.)  │  │ (Serverless)│  │ (Secrets)    │
     └────────────┘  └─────────────┘  └──────────────┘
              │
     ┌────────┴───┐
     │ App Insights│
     │ (Monitoring)│
     └────────────┘
```

---

## 2. Spesifikasi Resource

### 2.1 Azure Front Door

| Parameter | Value |
|-----------|-------|
| Tier | Standard |
| Caching | Enabled (static assets, TTL 24h) |
| WAF Policy | Managed Default Rule Set (DRS 2.1) |
| Custom Domain | api.maxsales.qzz.io |
| TLS | Minimum 1.2 |
| Origin | Azure API Management |

### 2.2 Azure API Management

| Parameter | Value |
|-----------|-------|
| Tier | Consumption (Serverless) |
| Base URL | https://api.maxsales.qzz.io |
| Rate Limit | 100 req/min per key |
| Quota | 10000 req/day per subscription |
| CORS | Allow maxsales.qzz.io |

### 2.3 Azure Functions

| Parameter | Value |
|-----------|-------|
| Plan | Consumption (Serverless) |
| Runtime | Node.js 20 LTS |
| Memory | 1.5 GB max |
| Timeout | 230 seconds (max for Consumption) |
| Functions | 7 HTTP trigger functions |
| Region | Southeast Asia |

### 2.4 Cosmos DB

| Parameter | Value |
|-----------|-------|
| API | NoSQL |
| Tier | Serverless |
| Consistency | Session |
| Containers | 4 (canvas, competitors, segments, generations) |
| Region | Southeast Asia |
| Backup | Continuous (point-in-time restore, 7 days) |

### 2.5 Azure Key Vault

| Parameter | Value |
|-----------|-------|
| Tier | Standard |
| Secrets | OPENROUTER_API_KEY, COSMOS_CONNECTION_STRING |
| Access | Managed Identity + RBAC |

---

## 3. Network Topology Detail

```
Virtual Network: vnet-maxsales (10.0.0.0/16)
├── Subnet: snet-functions (10.0.1.0/24)
│   └── Azure Functions (Private Endpoint)
├── Subnet: snet-cosmos (10.0.2.0/24)
│   └── Cosmos DB (Private Endpoint)
├── Subnet: snet-keyvault (10.0.3.0/24)
│   └── Key Vault (Private Endpoint)
└── Subnet: snet-apim (10.0.4.0/24)
    └── API Management (Private Endpoint)

Network Security Groups (NSG):
- snet-functions: Allow inbound from APIM only (port 443)
- snet-cosmos: Allow inbound from Functions only
- snet-keyvault: Allow inbound from Functions only
- snet-apim: Allow inbound from Front Door only (port 443)
```

---

## 4. Deployment Architecture

### 4.1 CI/CD Pipeline

```
Developer Push (main branch)
        │
┌───────┴────────┐
│ GitHub Actions  │
└───────┬────────┘
        │
┌───────┴────────┐
│ Build & Test    │
│ - npm ci        │
│ - npm test      │
│ - npm run build │
└───────┬────────┘
        │
┌───────┴────────┐
│ Deploy to Staging│
│ - maxsales-stg   │
│ Run smoke tests  │
└───────┬────────┘
        │
  Manual Approval?
        │
┌───────┴────────┐
│ Deploy to Prod  │
│ - maxsales-prod │
│ - Swap slots    │
└────────────────┘
```

### 4.2 Deployment Slots (Azure Functions)

| Slot | Usage | Traffic % |
|------|-------|-----------|
| Production | Live traffic | 90% |
| Staging | Pre-prod validation | 10% (canary) |
| Development | Dev testing | 0% (direct access) |

---

## 5. Disaster Recovery

| Skenario | RTO | RPO | Strategy |
|----------|-----|-----|----------|
| Single instance failure | < 1 menit | 0 | Azure Functions auto-scale |
| Region failure | < 1 jam | < 5 menit | Manual failover to secondary region |
| Cosmos DB outage | < 1 menit | 0 | Multi-region writes |
| API corruption | < 30 menit | < 7 hari | Point-in-time restore Cosmos DB |

---

## 6. Auto-scaling Configuration

| Resource | Min | Max | Scale Criteria |
|----------|-----|-----|----------------|
| Azure Functions | 0 | 20 | Queue length > 10 |
| Cosmos DB RU | Serverless | - | Auto-scale (pay per request) |
| API Management | Consumption | - | Auto-scale |

---

## 7. Monitoring & Alerting

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error Rate | > 1% | PagerDuty alert |
| Response Time | > 2000ms | Email notification |
| 5xx Errors | > 0.5% | Critical alert |
| Cosmos DB 429 | > 5/min | Scale notification |
| Function Execution | > 20000/day | Cost alert |

---

## 8. Infrastructure as Code

Azure resource provisioning menggunakan **Bicep**:

```
infrastructure/
├── main.bicep            // Main template
├── modules/
│   ├── front-door.bicep  // Front Door + WAF
│   ├── apim.bicep        // API Management
│   ├── functions.bicep   // Function App
│   ├── cosmos.bicep      // Cosmos DB
│   ├── keyvault.bicep    // Key Vault
│   └── network.bicep     // VNet + Subnet + NSG
├── parameters/
│   ├── dev.parameters.json
│   ├── stg.parameters.json
│   └── prod.parameters.json
└── scripts/
    ├── deploy-dev.sh
    ├── deploy-stg.sh
    └── deploy-prod.sh
```

---

## 9. Cost Estimation (Monthly)

| Resource | Estimated Cost |
|----------|---------------|
| Azure Functions (Consumption) | $0 - $5 |
| Cosmos DB (Serverless) | $5 - $15 |
| API Management (Consumption) | $0 - $3 |
| Front Door (Standard) | $35 |
| Key Vault (Standard) | $1 |
| App Insights | $2 - $5 |
| **Total** | **$43 - $64/month** |

---

*Dokumen desain infrastruktur — baseline infrastruktur Azure untuk MaxSales*
