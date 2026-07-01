# Plan Kongkrit: Revisi File Migrasi Azure MaxxSales

## Status: Draft untuk approval

## Problem Statement
File migrasi Azure di `docs/maxxsales/` punya 5 gap kritis yang bikin deployment gagal atau insecure. Revisi ini bikin semua file konsisten, aman, dan langsung deployable.

---

## FILE 1: `docs/maxxsales/infra/main.bicep`

### Change 1.1: Tambah Cosmos DB Database + Containers (sesudah line 146)

**Mengapa:** Bicep create Cosmos DB account tapi TIDAK create database. App runtime akan crash karena container tidak ada.

**Tambahkan SETELAH resource `cosmosDb` (line 146), SEBELUM comment App Service Plan:**

```bicep
// ═══════════════════════════════════════════════════════════
// Cosmos DB SQL Database + Containers
// ═══════════════════════════════════════════════════════════
resource sqlDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2025-04-15' = {
  parent: cosmosDb
  name: 'maxxsales'
  properties: {
    resource: { id: 'maxxsales' }
  }
}

resource containerBusinessDna 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'business-dna'
  properties: {
    resource: { id: 'business-dna' }
    partitionKey: { paths: ['/brand'], kind: 'Hash' }
  }
}

resource containerCompetitors 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'competitors'
  properties: {
    resource: { id: 'competitors' }
    partitionKey: { paths: ['/brand'], kind: 'Hash' }
  }
}

resource containerSegments 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'segments'
  properties: {
    resource: { id: 'segments' }
    partitionKey: { paths: ['/brand'], kind: 'Hash' }
  }
}

resource containerChatHistory 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'chat-history'
  properties: {
    resource: { id: 'chat-history' }
    partitionKey: { paths: ['/userId'], kind: 'Hash' }
    defaultTtl: 86400
  }
}

resource containerContentLibrary 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'content-library'
  properties: {
    resource: { id: 'content-library' }
    partitionKey: { paths: ['/brand'], kind: 'Hash' }
  }
}
```

### Change 1.2: Hapus hardcoded Storage Connection String (line 191)

**Mengapa:** `AZURE_STORAGE_CONNECTION_STRING` dengan plaintext endpoint tidak aman. Functions sudah pakai `AzureWebJobsStorage__accountName` (line 184) yang identity-based.

**Hapus line 191:**
```
{ name: 'AZURE_STORAGE_CONNECTION_STRING', value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};EndpointSuffix=core.windows.net' }
```

### Change 1.3: OpenAI Endpoint via Key Vault (line 187)

**Mengapa:** OpenAI endpoint hardcoded. Seharusnya di Key Vault supaya bisa di-rotate.

**Ganti line 187 dari:**
```
{ name: 'AZURE_OPENAI_ENDPOINT', value: openAiEndpoint }
```
**Menjadi:**
```
{ name: 'AZURE_OPENAI_ENDPOINT', value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/OpenAIEndpoint/)' }
```

### Change 1.4: SWA Production Location (line 211)

**Mengapa:** SWA prod di `centralus` tapi semua resource lain di `southeastasia`. Standard tier tidak dibatasi centralus.

**Ganti line 211 dari:**
```
location: 'centralus'
```
**Menjadi:**
```
location: environment == 'prod' ? location : 'centralus'
```

### Change 1.5: Tambah Cosmos DB SQL Role Assignment (sesudah RBAC section, sebelum Outputs)

**Mengapa:** `disableLocalAuth=true` di Cosmos DB membutuhkan SQL role definition supaya Managed Identity bisa akses data-plane.

**Tambahkan SEBELUM Outputs section:**

```bicep
// ═══════════════════════════════════════════════════════════
// Cosmos DB SQL Role Assignment (passwordless data-plane)
// ═══════════════════════════════════════════════════════════
var cosmosSqlRoleDefinitionId = '00000000-0000-0000-0000-000000000002' // Built-in Data Contributor

resource cosmosSqlRoleAssignment 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2025-04-15' = {
  parent: cosmosDb
  name: guid(cosmosDb.id, managedIdentity.id, cosmosSqlRoleDefinitionId)
  properties: {
    roleDefinitionId: cosmosSqlRoleDefinitionId
    principalId: managedIdentity.properties.principalId
    scope: '${cosmosDb.id}/dbs/maxxsales'
  }
}
```

### Change 1.6: Tambah Cosmos DB database + container output

**Tambahkan di Outputs section:**

```bicep
output cosmosDatabaseName string = sqlDatabase.name
output cosmosDatabaseId string = sqlDatabase.id
```

---

## FILE 2: `docs/maxxsales/infra/scripts/post-deploy.sh`

### Change 2.1: Tambah OpenAI RBAC Role (sesudah step 3, line ~58)

**Mengapa:** Function App butuh `Cognitive Services OpenAI User` role untuk akses Azure OpenAI via Managed Identity.

**Tambahkan SETELAH step 3 (Storage Blob Data Contributor):**

```bash
# ── 3b. RBAC: Cognitive Services OpenAI User → Managed Identity ──
echo ""
echo ">> Assigning Cognitive Services OpenAI User..."
OPENAI_ID=$(az cognitiveservices account show --name "voxia-openai-eastus" -g "$RG" --query id -o tsv 2>/dev/null || echo "")
if [ -n "$OPENAI_ID" ]; then
  az role assignment create \
    --assignee "$IDENTITY_PRINCIPAL" \
    --role "Cognitive Services OpenAI User" \
    --scope "$OPENAI_ID" \
    --output none
  echo "   Done."
else
  echo "   Skipped: Azure OpenAI resource not found in this RG."
fi
```

### Change 2.2: Store OpenAI Endpoint di Key Vault (sesudah step 5, line ~79)

**Mengapa:** Bicep reference `secrets/OpenAIEndpoint/` di Key Vault tapi post-deploy tidak store value ini.

**Tambahkan SETELAH step 5 (OpenAI Key):**

```bash
# ── 5b. Store OpenAI Endpoint in Key Vault ──
echo ""
OPENAI_ENDPOINT=$(az functionapp config appsettings list --name "$FUNC_NAME" -g "$RG" --query "[?name=='AZURE_OPENAI_ENDPOINT'].value" -o tsv 2>/dev/null)
if [ -n "$OPENAI_ENDPOINT" ]; then
  az keyvault secret set \
    --vault-name "kv-${PREFIX}" \
    --name "OpenAIEndpoint" \
    --value "$OPENAI_ENDPOINT" \
    --output none
  echo "   OpenAI Endpoint stored in Key Vault."
fi
```

### Change 2.3: Support env var input untuk OpenAI Key (ganti line 72-78)

**Ganti block step 5 dari:**
```bash
echo ""
echo ">> Enter Azure OpenAI API key for $ENVIRONMENT:"
read -s OPENAI_KEY
```
**Menjadi:**
```bash
echo ""
if [ -z "$OPENAI_KEY" ]; then
  echo ">> Enter Azure OpenAI API key for $ENVIRONMENT:"
  read -s OPENAI_KEY
else
  echo ">> Using OPENAI_KEY from environment variable."
fi
```

### Change 2.4: Tambah validation step (SEBELUM restart, sesudah step 5b)

**Tambahkan SEBELUM step 6 (Restart):**

```bash
# ── 5c. Validate Key Vault secrets ──
echo ""
echo ">> Validating Key Vault secrets..."
for SECRET_NAME in AppInsightsConnectionString OpenAIKey OpenAIEndpoint; do
  SECRET_VALUE=$(az keyvault secret show --vault-name "kv-${PREFIX}" --name "$SECRET_NAME" --query value -o tsv 2>/dev/null)
  if [ -z "$SECRET_VALUE" ]; then
    echo "   WARNING: Secret '$SECRET_NAME' is missing in Key Vault!"
  else
    echo "   ✓ $SECRET_NAME"
  fi
done
```

---

## FILE 3: `docs/maxxsales/.azure/infrastructure-plan.json`

### Change 3.1: Update Function App appSettings (line ~319-327)

**Ganti Cosmos DB endpoint reference:**
```json
{ "name": "CosmosDBConnection__accountEndpoint", "value": "https://cosmos-maxxsales-stg-sea.documents.azure.com:443/" }
```
**Menjadi:**
```json
{ "name": "CosmosDBConnection__accountEndpoint", "value": "[reference('cosmos-maxxsales-stg-sea').documentEndpoint]" }
```

**Ganti OpenAI Endpoint dari hardcoded ke KV reference:**
```json
{ "name": "AZURE_OPENAI_ENDPOINT", "value": "@Microsoft.KeyVault(SecretUri=https://kv-maxxsales-stg-sea.vault.azure.net/secrets/OpenAIEndpoint/)" }
```

**Hapus `AZURE_STORAGE_CONNECTION_STRING` jika ada di plan**

### Change 3.2: Update SWA prod location (line ~407)

```json
"location": "southeastasia"
```
(bukan `centralus` untuk Standard tier)

### Change 3.3: Tambah Cosmos DB database/container ke plan resources (sesudah Cosmos DB entry ~line 238)

```json
{
  "name": "cosmos-maxxsales-stg-sea/maxxsales",
  "type": "Microsoft.DocumentDB/databaseAccounts/sqlDatabases",
  "properties": { "resource": { "id": "maxxsales" } },
  "dependencies": ["cosmos-maxxsales-stg-sea"],
  "reasoning": {
    "whyChosen": "Central database untuk semua container. Partition per brand untuk multi-tenant readiness."
  }
}
```

---

## FILE 4: Baru — `docs/maxxsales/infra/README.md`

Dokumentasi deployment step-by-step:

```markdown
# MaxxSales Azure Infrastructure

## Prerequisites
- Azure CLI logged in (`az login`)
- Subscription set (`az account set --subscription <id>`)

## Deployment Steps

### 1. Create Resource Groups
```bash
az group create -n rg-maxxsales-stg-sea -l southeastasia --tags environment=staging project=MaxxSales
az group create -n rg-maxxsales-prod-sea -l southeastasia --tags environment=production project=MaxxSales
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
ENVIRONMENT=stg ./infra/scripts/post-deploy.sh
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
ENVIRONMENT=prod ./infra/scripts/post-deploy.sh
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
- **Staging**: EP1 Premium Functions, Free SWA, 30-day log retention
- **Production**: EP2 Premium Functions, Standard SWA, 90-day log retention
- **All**: southeastasia region, UserAssigned MI, Key Vault RBAC, Cosmos DB disableLocalAuth

## Estimated Monthly Cost
- Staging: ~$105/month (EP1 ~$80, Cosmos DB ~$25)
- Production: ~$195/month (EP2 ~$160, Cosmos DB ~$25, SWA ~$10)
```

---

## Verification Checklist

Setelah semua perubahan:

1. **`az bicep build --file infra/main.bicep`** — harus tanpa error
2. **Cosmos DB** — database `maxxsales` + 5 containers tersedia setelah deploy
3. **Key Vault** — 3 secrets: AppInsightsConnectionString, OpenAIKey, OpenAIEndpoint
4. **RBAC** — 4 role assignments: Cosmos DB Data Contributor, Key Vault Secrets User, Storage Blob Data Contributor, Cognitive Services OpenAI User
5. **Function App** — semua app settings resolve tanpa hardcoded secrets
6. **No `AZURE_STORAGE_CONNECTION_STRING`** di Function App settings
7. **SWA prod** di southeastasia (bukan centralus)
8. **`az bicep build`** — verify parameter files masih valid

## File Paths

| File | Action |
|------|--------|
| `docs/maxxsales/infra/main.bicep` | Edit (6 changes) |
| `docs/maxxsales/infra/scripts/post-deploy.sh` | Edit (4 changes) |
| `docs/maxxsales/.azure/infrastructure-plan.json` | Edit (3 changes) |
| `docs/maxxsales/infra/README.md` | Create (deployment guide) |
