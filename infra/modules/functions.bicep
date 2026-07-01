@description('Azure region for deployment')
param location string

@description('Workload name for naming convention')
param workloadName string = 'maxsales'

@description('Environment name')
param environmentName string = 'exp'

@description('Storage account name for Functions runtime')
param storageAccountName string

@description('Storage account resource ID')
param storageAccountId string

@description('Managed identity resource ID')
param managedIdentityId string

@description('Managed identity principal ID for RBAC')
param managedIdentityPrincipalId string

@description('Key Vault URI for secret references')
param keyVaultUri string

@description('Cosmos DB endpoint')
param cosmosEndpoint string

@description('Application Insights connection string')
@secure()
param appInsightsConnectionString string

@description('Functions runtime stack')
param functionsRuntime string = 'node'

@description('Functions extension version')
param functionsVersion string = '~4'

var functionAppName = 'func-${workloadName}-${environmentName}-eus'
var serverFarmName = 'asp-${workloadName}-${environmentName}-eus'

resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: serverFarmName
  location: location
  kind: 'linux'
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
    size: 'Y1'
    family: 'Y'
    capacity: 0
  }
  properties: {
    reserved: true
  }
  tags: {
    environment: environmentName
    workload: workloadName
  }
}

resource functionApp 'Microsoft.Web/sites@2024-11-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    clientAffinityEnabled: false
    siteConfig: {
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: functionsRuntime
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: functionsVersion
        }
        {
          name: 'AzureWebJobsStorage__accountName'
          value: storageAccountName
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/AppInsightsConnectionString/)'
        }
        {
          name: 'CosmosDBConnection__accountEndpoint'
          value: cosmosEndpoint
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'FUNCTIONS_WORKER_PROCESS_COUNT'
          value: '2'
        }
      ]
      ftpsState: 'Disabled'
      http20Enabled: true
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      cors: {
        allowedOrigins: [
          '*'
        ]
        supportCredentials: false
      }
    }
  }
  tags: {
    environment: environmentName
    workload: workloadName
  }
}

output functionAppName string = functionApp.name
output functionAppId string = functionApp.id
output functionAppDefaultHostName string = functionApp.properties.defaultHostName
output appServicePlanId string = appServicePlan.id
