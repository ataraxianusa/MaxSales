# Konfigurasi CI/CD Pipeline (GitHub Actions to Azure)
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Pipeline Overview

```
Event: Push ke main / PR ke main
        │
┌───────┴───────────────────┐
│ 1. Build & Validate        │
│    - npm ci                │
│    - npm run lint          │
│    - npm run build         │
│    - npm test              │
└───────┬───────────────────┘
        │
┌───────┴───────────────────┐
│ 2. Deploy ke Staging       │
│    - Azure Functions Deploy│
│    - Smoke tests           │
└───────┬───────────────────┘
        │
┌───────┴───────────────────┐
│ 3. Approval Gate (Manual)  │
└───────┬───────────────────┘
        │
┌───────┴───────────────────┐
│ 4. Deploy ke Production    │
│    - Slot swap staging→prod │
│    - Health check           │
│    - Rollback if failed     │
└────────────────────────────┘
```

---

## 2. GitHub Actions Workflow

```yaml
name: Deploy MaxSales API to Azure

on:
  push:
    branches: [main]
    paths:
      - 'maxsales-api/**'
      - '.github/workflows/deploy.yml'
  pull_request:
    branches: [main]
    paths:
      - 'maxsales-api/**'

env:
  AZURE_FUNCTIONAPP_NAME: func-maxsales-api
  AZURE_FUNCTIONAPP_PATH: maxsales-api
  NODE_VERSION: '20.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: ${{ env.AZURE_FUNCTIONAPP_PATH }}/package-lock.json

    - name: Install dependencies
      run: npm ci
      working-directory: ${{ env.AZURE_FUNCTIONAPP_PATH }}

    - name: Lint
      run: npm run lint
      working-directory: ${{ env.AZURE_FUNCTIONAPP_PATH }}

    - name: Build
      run: npm run build --if-present
      working-directory: ${{ env.AZURE_FUNCTIONAPP_PATH }}

    - name: Run tests
      run: npm test
      working-directory: ${{ env.AZURE_FUNCTIONAPP_PATH }}

    - name: Deploy to Azure Functions
      if: github.ref == 'refs/heads/main'
      uses: Azure/functions-action@v1
      id: deploy
      with:
        app-name: ${{ env.AZURE_FUNCTIONAPP_NAME }}
        slot-name: staging
        package: ${{ env.AZURE_FUNCTIONAPP_PATH }}
        publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}

    - name: Smoke test staging
      if: github.ref == 'refs/heads/main'
      run: |
        curl -sSf https://func-maxsales-api-staging.azurewebsites.net/api/status | head -c 200

    - name: Swap to production
      if: success() && github.ref == 'refs/heads/main'
      run: |
        az functionapp deployment slot swap \
          --name ${{ env.AZURE_FUNCTIONAPP_NAME }} \
          --resource-group rg-maxsales \
          --slot staging \
          --target-slot production
      env:
        AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
        AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
        AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

    - name: Health check production
      if: github.ref == 'refs/heads/main'
      run: |
        sleep 10
        curl -sSf https://api.maxsales.qzz.io/api/status | head -c 200
```

---

## 3. Environment Configuration

### 3.1 GitHub Secrets Required

| Secret Name | Description | Source |
|-------------|-------------|--------|
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | Deploy credentials | Azure Portal > Function App |
| `AZURE_CLIENT_ID` | Service principal | Azure AD App Registration |
| `AZURE_TENANT_ID` | Azure AD tenant | Azure Portal |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID | Azure Portal |

### 3.2 Application Settings (Azure Functions)

| Setting | Value | Source |
|---------|-------|--------|
| `OPENROUTER_API_KEY` | @Microsoft.KeyVault(SecretUri=...) | Key Vault Reference |
| `COSMOS_DB_CONNECTION_STRING` | @Microsoft.KeyVault(SecretUri=...) | Key Vault Reference |
| `CORS_ORIGIN` | https://maxsales.qzz.io | Static |
| `APP_VERSION` | 1.0.0 | Static |
| `NODE_ENV` | production | Static |
| `FUNCTIONS_EXTENSION_VERSION` | ~4 | Static |
| `FUNCTIONS_WORKER_RUNTIME` | node | Static |

---

## 4. IaC Pipeline (Terraform/Bicep)

```yaml
# infrastructure-deploy.yml
name: Deploy Azure Infrastructure

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Validate Bicep
      run: |
        az bicep build --file infrastructure/main.bicep

  deploy:
    needs: validate
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Deploy Infrastructure
      run: |
        az deployment group create \
          --resource-group rg-maxsales \
          --template-file infrastructure/main.bicep \
          --parameters @infrastructure/parameters/prod.parameters.json
      env:
        AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
```

---

## 5. Local Development Setup

Untuk development lokal tanpa Azure:

```
# 1. Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# 2. Clone repo
git clone https://github.com/.../maxsales-api.git
cd maxsales-api

# 3. Copy local settings
cp local.settings.example.json local.settings.json

# 4. Set environment variables di local.settings.json
# "OPENROUTER_API_KEY": "sk-or-..."
# "COSMOS_DB_CONNECTION_STRING": "..." (optional, pake simulator)

# 5. Install dependencies
npm install

# 6. Run locally
npm start
# atau
func start
```

**local.settings.json:**
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "OPENROUTER_API_KEY": "",
    "COSMOS_DB_CONNECTION_STRING": "",
    "CORS_ORIGIN": "http://localhost:5173",
    "NODE_ENV": "development"
  }
}
```

---

## 6. Branch Strategy

| Branch | Environment | Auto-deploy | Traffic |
|--------|-------------|-------------|---------|
| `main` | Production | Yes (via slot swap) | 100% |
| `staging` | Staging slot | Manual trigger | Canary (10%) |
| `develop` | Dev slot | On push | 0% |
| `feature/*` | - | PR build only | - |

---

## 7. Rollback Strategy via CI/CD

```yaml
# rollback.yml — workflow terpisah untuk rollback
name: Rollback MaxSales API

on:
  workflow_dispatch:
    inputs:
      commit_hash:
        description: 'Commit hash untuk rollback'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout specific commit
      uses: actions/checkout@v4
      with:
        ref: ${{ github.event.inputs.commit_hash }}

    - name: Build and deploy
      # Same steps as deploy workflow
      # Deploy langsung ke production slot (skip staging)

    - name: Verify health
      run: |
        curl -sSf https://api.maxsales.qzz.io/api/status
```

---

## 8. Monitoring Pipeline

| Stage | Monitoring | Tool |
|-------|------------|------|
| Build | Build time, test pass rate | GitHub Actions |
| Deploy | Deployment duration | GitHub Actions + Azure Monitor |
| Staging | Smoke test, error rate | Application Insights |
| Production | Response time, 5xx, latency | Application Insights + Azure Monitor |
| Post-deploy | User impact | Real User Monitoring (Front Door) |

---

*Dokumen konfigurasi CI/CD — pipeline GitHub Actions untuk deployment Azure Functions*
