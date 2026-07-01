#!/bin/bash
# MaxxSales Post-Deployment Setup
# Run after: az deployment group create --template-file infra/main.bicep --parameters infra/parameters/main.stg.bicepparam
# Usage: ENVIRONMENT=stg ./infra/scripts/post-deploy.sh

set -e
ENVIRONMENT="${ENVIRONMENT:-stg}"
PREFIX="maxxsales-${ENVIRONMENT}"

case "$ENVIRONMENT" in
  stg) RG="rg-maxxsales-stg-sea" ;;
  prod) RG="rg-maxxsales-prod-sea" ;;
  *) echo "ERROR: ENVIRONMENT must be stg or prod"; exit 1 ;;
esac

echo "=== Post-deploy setup for MaxxSales $ENVIRONMENT ==="

# Get resource IDs
COSMOS_ID=$(az cosmosdb show --name "cosmos-${PREFIX}" -g "$RG" --query id -o tsv)
KV_ID=$(az keyvault show --name "kv-${PREFIX}" -g "$RG" --query id -o tsv)
IDENTITY_PRINCIPAL=$(az identity show --name "id-${PREFIX}" -g "$RG" --query principalId -o tsv)
APPI_CONNSTR=$(az monitor app-insights component show --app "appi-${PREFIX}" -g "$RG" --query connectionString -o tsv)
FUNC_NAME="func-${PREFIX}"

echo "Cosmos DB:  $COSMOS_ID"
echo "Key Vault:  $KV_ID"
echo "Identity:   $IDENTITY_PRINCIPAL"

# ── 1. RBAC: Cosmos DB Data Contributor → Managed Identity ──
echo ""
echo ">> Assigning Cosmos DB Built-in Data Contributor..."
az role assignment create \
  --assignee "$IDENTITY_PRINCIPAL" \
  --role "Cosmos DB Built-in Data Contributor" \
  --scope "$COSMOS_ID" \
  --output none
echo "   Done."

# ── 2. RBAC: Key Vault Secrets User → Managed Identity ──
echo ""
echo ">> Assigning Key Vault Secrets User..."
az role assignment create \
  --assignee "$IDENTITY_PRINCIPAL" \
  --role "Key Vault Secrets User" \
  --scope "$KV_ID" \
  --output none
echo "   Done."

# ── 3. RBAC: Storage Blob Data Contributor → Managed Identity (for product images) ──
echo ""
echo ">> Assigning Storage Blob Data Contributor..."
STORAGE_ID=$(az storage account show --name "st${PREFIX//-/}" -g "$RG" --query id -o tsv)
az role assignment create \
  --assignee "$IDENTITY_PRINCIPAL" \
  --role "Storage Blob Data Contributor" \
  --scope "$STORAGE_ID" \
  --output none
echo "   Done."

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

# ── 4. Store App Insights connection string in Key Vault ──
echo ""
echo ">> Storing App Insights connection string in Key Vault..."
az keyvault secret set \
  --vault-name "kv-${PREFIX}" \
  --name "AppInsightsConnectionString" \
  --value "$APPI_CONNSTR" \
  --output none
echo "   Done."

# ── 5. Store OpenAI key in Key Vault (env var or prompt) ──
echo ""
if [ -z "$OPENAI_KEY" ]; then
  echo ">> Enter Azure OpenAI API key for $ENVIRONMENT:"
  read -s OPENAI_KEY
else
  echo ">> Using OPENAI_KEY from environment variable."
fi
az keyvault secret set \
  --vault-name "kv-${PREFIX}" \
  --name "OpenAIKey" \
  --value "$OPENAI_KEY" \
  --output none
echo "   OpenAIKey stored."

# ── 5b. Store OpenAI Endpoint in Key Vault ──
echo ""
OPENAI_ENDPOINT=$(az functionapp config appsettings list --name "$FUNC_NAME" -g "$RG" --query "[?name=='AZURE_OPENAI_ENDPOINT'].value" -o tsv 2>/dev/null)
if [ -n "$OPENAI_ENDPOINT" ]; then
  az keyvault secret set \
    --vault-name "kv-${PREFIX}" \
    --name "OpenAIEndpoint" \
    --value "$OPENAI_ENDPOINT" \
    --output none
  echo "   OpenAIEndpoint stored."
fi

# ── 5c. Validate Key Vault secrets ──
echo ""
echo ">> Validating Key Vault secrets..."
for SECRET_NAME in AppInsightsConnectionString OpenAIKey OpenAIEndpoint; do
  SECRET_VALUE=$(az keyvault secret show --vault-name "kv-${PREFIX}" --name "$SECRET_NAME" --query value -o tsv 2>/dev/null)
  if [ -z "$SECRET_VALUE" ]; then
    echo "   WARNING: Secret '$SECRET_NAME' is missing!"
  else
    echo "   ✓ $SECRET_NAME"
  fi
done

# ── 6. Restart Function App to pick up Key Vault references ──
echo ""
echo ">> Restarting Function App..."
az functionapp restart --name "$FUNC_NAME" -g "$RG" --output none
echo "   Done."

echo ""
echo "=== Post-deploy setup complete for $ENVIRONMENT ==="
echo "Function App: https://${FUNC_NAME}.azurewebsites.net"
echo "Static Web App: https://$(az staticwebapp show --name swa-${PREFIX} -g "$RG" --query defaultHostname -o tsv)"
