targetScope = 'resourceGroup'

@description('Azure region for deployment')
param location string = 'eastus'

@description('Workload name for naming convention')
param workloadName string = 'maxsales'

@description('Environment name (exp = experiment, prod = production in separate project)')
param environmentName string = 'exp'

// ── Storage Account ───────────────────────────────────────
module storageModule './modules/storage.bicep' = {
  name: 'storageDeploy'
  params: {
    location: location
    workloadName: workloadName
    environmentName: environmentName
  }
}

// ── Managed Identity ──────────────────────────────────────
module identityModule './modules/identity.bicep' = {
  name: 'identityDeploy'
  params: {
    location: location
    workloadName: workloadName
    environmentName: environmentName
  }
}

// ── Key Vault ─────────────────────────────────────────────
module keyVaultModule './modules/keyvault.bicep' = {
  name: 'keyvaultDeploy'
  params: {
    location: location
    workloadName: workloadName
    environmentName: environmentName
  }
}

// ── Monitoring ────────────────────────────────────────────
module monitoringModule './modules/monitoring.bicep' = {
  name: 'monitoringDeploy'
  params: {
    location: location
    workloadName: workloadName
    environmentName: environmentName
  }
}

// ── Cosmos DB ─────────────────────────────────────────────
module cosmosModule './modules/cosmos.bicep' = {
  name: 'cosmosDeploy'
  params: {
    location: location
    workloadName: workloadName
    environmentName: environmentName
  }
}

// ── Functions ─────────────────────────────────────────────
module functionsModule './modules/functions.bicep' = {
  name: 'functionsDeploy'
  params: {
    location: location
    workloadName: workloadName
    environmentName: environmentName
    storageAccountName: storageModule.outputs.storageAccountName
    storageAccountId: storageModule.outputs.storageAccountId
    managedIdentityId: identityModule.outputs.identityId
    managedIdentityPrincipalId: identityModule.outputs.identityPrincipalId
    keyVaultUri: keyVaultModule.outputs.vaultUri
    cosmosEndpoint: cosmosModule.outputs.cosmosEndpoint
    appInsightsConnectionString: monitoringModule.outputs.appInsightsConnectionString
  }
}

// ── Outputs ───────────────────────────────────────────────
output storageAccountName string = storageModule.outputs.storageAccountName
output identityPrincipalId string = identityModule.outputs.identityPrincipalId
output keyVaultUri string = keyVaultModule.outputs.vaultUri
output cosmosEndpoint string = cosmosModule.outputs.cosmosEndpoint
output functionAppName string = functionsModule.outputs.functionAppName
output functionAppDefaultHostName string = functionsModule.outputs.functionAppDefaultHostName
