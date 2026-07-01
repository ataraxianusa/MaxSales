@description('Environment: stg or prod')
param environment string

@description('Azure location for resources')
param location string

@description('Azure OpenAI deployment name')
param openAiDeployment string = 'gpt-4o'

// ── Environment-specific values ──
var functionPlanSku = environment == 'prod' ? { name: 'EP2', tier: 'ElasticPremium', size: 'EP2', family: 'EP', capacity: 1 } : { name: 'Y1', tier: 'Dynamic', size: 'Y1', family: 'Y', capacity: 0 }
var swaSku = environment == 'prod' ? { name: 'Standard', tier: 'Standard' } : { name: 'Free', tier: 'Free' }
var swaBranch = environment == 'prod' ? 'main' : 'develop'
var keyVaultSoftDeleteDays = environment == 'prod' ? 90 : 7
var keyVaultPurgeProtection = environment == 'prod' ? true : false
var logRetentionDays = environment == 'prod' ? 90 : 30

var namePrefix = 'maxxsales-${environment}'
var tags = {
  environment: environment
  project: 'MaxxSales'
  managedBy: 'VOXIA'
  domain: 'maxxsales.com'
}

// ═══════════════════════════════════════════════════════════
// Storage Account
// ═══════════════════════════════════════════════════════════
var storageName = 'st${replace(namePrefix, '-', '')}'

resource storage 'Microsoft.Storage/storageAccounts@2025-01-01' = {
  name: storageName
  location: location
  kind: 'StorageV2'
  sku: { name: 'Standard_LRS' }
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    publicNetworkAccess: 'Enabled'
  }
  tags: tags
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2025-01-01' = {
  parent: storage
  name: 'default'
}

resource imagesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2025-01-01' = {
  parent: blobService
  name: 'product-images'
}

// ═══════════════════════════════════════════════════════════
// User-Assigned Managed Identity
// ═══════════════════════════════════════════════════════════
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: 'id-${namePrefix}'
  location: location
  tags: tags
}

// ═══════════════════════════════════════════════════════════
// Key Vault
// ═══════════════════════════════════════════════════════════
resource keyVault 'Microsoft.KeyVault/vaults@2024-11-01' = {
  name: 'kv-${namePrefix}'
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { name: 'standard', family: 'A' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: keyVaultSoftDeleteDays
    enablePurgeProtection: keyVaultPurgeProtection
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
  tags: tags
}

// ═══════════════════════════════════════════════════════════
// Log Analytics + Application Insights
// ═══════════════════════════════════════════════════════════
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2025-02-01' = {
  name: 'log-${namePrefix}'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: logRetentionDays
  }
  tags: tags
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${namePrefix}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
  tags: tags
}

// ═══════════════════════════════════════════════════════════
// Cosmos DB (provisioned autoscale)
// ═══════════════════════════════════════════════════════════
resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2025-04-15' = {
  name: 'cosmos-${namePrefix}'
  location: location
  kind: 'GlobalDocumentDB'
  identity: { type: 'None' }
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
      maxIntervalInSeconds: 5
      maxStalenessPrefix: 100
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    enableMultipleWriteLocations: false
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: true
    disableKeyBasedMetadataWriteAccess: true
  }
  tags: tags
}

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
    resource: {
      id: 'business-dna'
      partitionKey: { paths: ['/brand'], kind: 'Hash' }
    }
  }
}

resource containerCompetitors 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'competitors'
  properties: {
    resource: {
      id: 'competitors'
      partitionKey: { paths: ['/brand'], kind: 'Hash' }
    }
  }
}

resource containerSegments 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'segments'
  properties: {
    resource: {
      id: 'segments'
      partitionKey: { paths: ['/brand'], kind: 'Hash' }
    }
  }
}

resource containerChatHistory 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'chat-history'
  properties: {
    resource: {
      id: 'chat-history'
      partitionKey: { paths: ['/userId'], kind: 'Hash' }
      defaultTtl: 86400
    }
  }
}

resource containerContentLibrary 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-04-15' = {
  parent: sqlDatabase
  name: 'content-library'
  properties: {
    resource: {
      id: 'content-library'
      partitionKey: { paths: ['/brand'], kind: 'Hash' }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// App Service Plan (Premium EP1/EP2)
// ═══════════════════════════════════════════════════════════
resource hostingPlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: 'asp-${namePrefix}'
  location: location
  kind: 'linux'
  sku: functionPlanSku
  properties: { reserved: true }
  tags: tags
}

// ═══════════════════════════════════════════════════════════
// Function App (Premium)
// ═══════════════════════════════════════════════════════════
resource functionApp 'Microsoft.Web/sites@2024-11-01' = {
  name: 'func-${namePrefix}'
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    serverFarmId: hostingPlan.id
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    clientAffinityEnabled: false
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' }
        { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '1' }
        { name: 'AzureWebJobsStorage__accountName', value: storage.name }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/AppInsightsConnectionString/)' }
        { name: 'CosmosDBConnection__accountEndpoint', value: cosmosDb.properties.documentEndpoint }
        { name: 'AZURE_OPENAI_ENDPOINT', value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/OpenAIEndpoint/)' }
        { name: 'AZURE_OPENAI_KEY', value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/OpenAIKey/)' }
        { name: 'AZURE_OPENAI_DEPLOYMENT', value: openAiDeployment }
        { name: 'AZURE_OPENAI_API_VERSION', value: '2024-10-21' }
        { name: 'AZURE_STORAGE_CONTAINER', value: 'product-images' }
        { name: 'NODE_ENV', value: environment }
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: '1' }
      ]
      ftpsState: 'Disabled'
      http20Enabled: true
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      use32BitWorkerProcess: false
    }
  }
  tags: tags
}

// ═══════════════════════════════════════════════════════════
// Static Web App (React frontend)
// ═══════════════════════════════════════════════════════════
resource swa 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'swa-${namePrefix}'
  location: environment == 'prod' ? location : 'centralus'
  sku: swaSku
  properties: {
    repositoryUrl: 'https://github.com/VOXIA-ID/MaxxSales'
    branch: swaBranch
    buildProperties: {
      appLocation: '.'
      apiLocation: 'api'
      outputLocation: 'dist'
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
  tags: tags
}

resource swaAuthConfig 'Microsoft.Web/staticSites/config@2022-09-01' = {
  parent: swa
  name: 'authsettings'
  properties: {
    platform: {
      enabled: true
      runtimeVersion: '1.0'
    }
    globalValidation: {
      unauthenticatedClientAction: 'AllowAnonymous'
    }
    identityProviders: {
      google: {
        registration: {
          clientIdSettingName: 'GOOGLE_CLIENT_ID'
          clientSecretSettingName: 'GOOGLE_CLIENT_SECRET'
        }
        login: {
          scopes: ['openid', 'profile', 'email']
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Cosmos DB SQL Role Assignment (passwordless data-plane)
// ═══════════════════════════════════════════════════════════
var cosmosSqlRoleDefinitionId = '00000000-0000-0000-0000-000000000002'

resource cosmosSqlRoleAssignment 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2025-04-15' = {
  parent: cosmosDb
  name: guid(cosmosDb.id, managedIdentity.id, cosmosSqlRoleDefinitionId)
  properties: {
    roleDefinitionId: cosmosSqlRoleDefinitionId
    principalId: managedIdentity.properties.principalId
    scope: '${cosmosDb.id}/dbs/maxxsales'
  }
}

// ═══════════════════════════════════════════════════════════
// Outputs
// ═══════════════════════════════════════════════════════════
output functionAppName string = functionApp.name
output functionAppEndpoint string = 'https://${functionApp.properties.defaultHostName}'
output swaEndpoint string = 'https://${swa.properties.defaultHostname}'
output swaName string = swa.name
output storageAccountName string = storage.name
output cosmosEndpoint string = cosmosDb.properties.documentEndpoint
output keyVaultUri string = keyVault.properties.vaultUri
output identityPrincipalId string = managedIdentity.properties.principalId
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output cosmosDatabaseName string = sqlDatabase.name
output cosmosDatabaseId string = sqlDatabase.id
