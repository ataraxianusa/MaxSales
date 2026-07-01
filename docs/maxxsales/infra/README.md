# MaxxSales Azure Infrastructure

## Prerequisites
- Azure CLI logged in (`az login`)
- Subscription set (`az account set --subscription <id>`)

## Deployment Steps

### 1. Create Resource Groups
```bash
az group create -n rg-maxxsales-stg-sea -l southeastasia --tags environment=staging project=MaxxSales managedBy=VOXIA
az group create -n rg-maxxsales-prod-sea -l southeastasia --tags environment=production project=MaxxSales managedBy=VOXIA
```

### 2. Deploy Bicep (Staging)
```bash
az deployment group create \
  -g rg-maxxsales-stg-sea \
  --template-file infra/main.bicep \
  --parameters infra/parameters/main.stg.bicepparam
```

### 3. Run Post-Deploy (Staging)
```bash
ENVIRONMENT=stg OPENAI_KEY=<your-key> ./infra/scripts/post-deploy.sh
```

### 4. Deploy Bicep (Production)
```bash
az deployment group create \
  -g rg-maxxsales-prod-sea \
  --template-file infra/main.bicep \
  --parameters infra/parameters/main.prod.bicepparam
```

### 5. Run Post-Deploy (Production)
```bash
ENVIRONMENT=prod OPENAI_KEY=<your-key> ./infra/scripts/post-deploy.sh
```

### 6. Verify
```bash
# Check Function App settings
az functionapp config appsettings list -n func-maxxsales-stg -g rg-maxxsales-stg-sea

# Check Cosmos DB containers
az cosmosdb sql database show -a cosmos-maxxsales-stg-sea -g rg-maxxsales-stg-sea -n maxxsales

# Check Key Vault secrets
az keyvault secret list --vault-name kv-maxxsales-stg-sea
```

## Architecture
| Component | Staging | Production |
|-----------|---------|------------|
| Functions | Premium EP1 (~$80/mo) | Premium EP2 (~$160/mo) |
| SWA | Free (centralus) | Standard (southeastasia) |
| Cosmos DB | Provisioned autoscale | Provisioned autoscale |
| Key Vault | Standard (7d soft-delete) | Standard (90d soft-delete, purge protection) |
| Log Analytics | 30d retention | 90d retention |
| Identity | UserAssigned MI | UserAssigned MI |

## RBAC (assigned by post-deploy.sh)
1. **Cosmos DB Built-in Data Contributor** → MI (data-plane access)
2. **Key Vault Secrets User** → MI (read secrets)
3. **Storage Blob Data Contributor** → MI (product images)
4. **Cognitive Services OpenAI User** → MI (Azure OpenAI access)
5. **Cosmos DB SQL Role Assignment** → MI (in Bicep, passwordless data access)

## Key Vault Secrets
| Secret Name | Source | Used By |
|-------------|--------|---------|
| AppInsightsConnectionString | Post-deploy (auto) | Function App telemetry |
| OpenAIKey | Post-deploy (user input) | Azure OpenAI calls |
| OpenAIEndpoint | Post-deploy (auto) | Azure OpenAI endpoint URL |

## Estimated Monthly Cost
- **Staging**: ~$105/month (EP1 ~$80, Cosmos DB ~$25)
- **Production**: ~$195/month (EP2 ~$160, Cosmos DB ~$25, SWA ~$10)
- **Tip**: Downgrade staging to Consumption (Y1) for ~$25/month when not actively developing

## Cosmos DB Containers
| Container | Partition Key | TTL | Purpose |
|-----------|--------------|-----|---------|
| business-dna | /brand | - | DNA Canvas data |
| competitors | /brand | - | Competitor War Room data |
| segments | /brand | - | Customer segments |
| chat-history | /userId | 86400 (1 day) | Chat messages |
| content-library | /brand | - | Generated content |
