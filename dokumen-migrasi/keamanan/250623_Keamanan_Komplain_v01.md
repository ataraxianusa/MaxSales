# Security Baseline & Compliance
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** CONFIDENTIAL

---

## 1. Security Architecture

```
Internet
    │
    ▼
Azure Front Door
├── WAF: Managed DRS 2.1 (OWASP Top 10)
├── DDoS Protection: Azure DDOS Network Protection
├── TLS 1.2+ (HTTPS only)
│
    ▼
Azure API Management
├── Subscription Key Validation
├── Rate Limiting (100 req/min)
├── CORS Whitelist
├── Request/Response Validation
│
    ▼
Azure Functions (Private Endpoint)
├── Managed Identity (no connection strings)
├── Network Isolation (VNet Integration)
│
    ▼
Cosmos DB (Private Endpoint)
├── Encryption at rest (AES-256)
├── Encryption in transit (TLS)
├── RBAC + Managed Identity
└── Continuous Backup
```

---

## 2. Azure Policy Assignments

| Policy | Effect | Resource |
|--------|--------|----------|
| Audit insecure TLS | Deny | Front Door |
| Require HTTPS | Deny | All |
| Audit SQL encryption | Audit | Cosmos DB |
| Restrict public IP | Deny | Functions |
| Require Managed Identity | Deny | Functions |
| Audit diagnostic logs | Audit | All |

---

## 3. Identity & Access Management (IAM)

### 3.1 RBAC Roles

| Role | Scope | Assigned To |
|------|-------|-------------|
| Contributor | Resource Group | DevOps Engineers |
| Function App Contributor | Function App | CI/CD Service Principal |
| Cosmos DB Data Contributor | Cosmos DB | Function App Managed Identity |
| Key Vault Secrets User | Key Vault | Function App Managed Identity |
| Reader | Resource Group | Monitoring |

### 3.2 Managed Identity

Setiap Azure Function menggunakan System-Assigned Managed Identity:

```bicep
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  identity: {
    type: 'SystemAssigned'
  }
}
```

---

## 4. Network Security

### 4.1 Private Endpoints

| Resource | Private Endpoint | DNS Zone |
|----------|-----------------|----------|
| Azure Functions | Yes | privatelink.azurewebsites.net |
| Cosmos DB | Yes | privatelink.documents.azure.com |
| Key Vault | Yes | privatelink.vaultcore.azure.net |

### 4.2 Network Security Groups

```bicep
resource nsgFunctions 'Microsoft.Network/networkSecurityGroups@2023-11-01' = {
  properties: {
    securityRules: [
      {
        name: 'AllowAPIM'
        properties: {
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '443'
          sourceAddressPrefix: 'ApiManagement' // Service Tag
          destinationAddressPrefix: '*'
          access: 'Allow'
          priority: 100
          direction: 'Inbound'
        }
      }
    ]
  }
}
```

---

## 5. Secrets Management

### 5.1 Key Vault Configuration

| Secret | Description | Rotation |
|--------|-------------|----------|
| OPENROUTER-API-KEY | OpenRouter API key | Quarterly |
| COSMOS-CONNECTION-STRING | Cosmos DB primary connection | Annual |

### 5.2 Key Vault References

```json
{
  "name": "OPENROUTER_API_KEY",
  "value": "@Microsoft.KeyVault(SecretUri=https://kv-maxsales.vault.azure.net/secrets/OPENROUTER-API-KEY/)",
  "slotSetting": false
}
```

---

## 6. Data Protection

| Layer | Protection | Standard |
|-------|------------|----------|
| Transit | TLS 1.2+ | PCI DSS |
| At Rest | AES-256 | FIPS 140-2 |
| Application | Input validation (all endpoints) | OWASP ASVS |
| Credentials | Managed Identity | Zero Trust |

---

## 7. Monitoring & Incident Response

| Alert | Threshold | Channel |
|-------|-----------|---------|
| WAF Blocked Request | > 10/5min | Email + Slack |
| Unauthorized Access (401) | > 5/5min | Email |
| Rate Limit Exceeded (429) | > 20/5min | Slack |
| Managed Identity Failure | Any | Critical Alert |

---

## 8. Security Checklist (Pre-Production)

- [ ] WAF enabled dengan OWASP DRS 2.1
- [ ] Private Endpoints untuk semua resources
- [ ] TLS 1.2 minimum
- [ ] CORS whitelist hanya maxsales.qzz.io
- [ ] Managed Identity untuk semua Function Apps
- [ ] Key Vault untuk semua secrets
- [ ] Diagnostic logging enabled
- [ ] Network isolation (VNet Integration)
- [ ] DDoS Protection enabled
- [ ] RBAC with least privilege

---

*Dokumen security baseline — konfigurasi keamanan untuk production deployment*
