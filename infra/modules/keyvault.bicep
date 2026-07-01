@description('Azure region for deployment')
param location string

@description('Workload name for naming convention')
param workloadName string = 'maxsales'

@description('Environment name')
param environmentName string = 'exp'

@description('Azure AD tenant ID')
param tenantId string = tenant().tenantId

var vaultName = 'kv-${workloadName}-${environmentName}-eus'

resource keyVault 'Microsoft.KeyVault/vaults@2024-11-01' = {
  name: vaultName
  location: location
  properties: {
    tenantId: tenantId
    sku: {
      name: 'standard'
      family: 'A'
    }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enablePurgeProtection: false
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
  tags: {
    environment: environmentName
    workload: workloadName
  }
}

output vaultName string = keyVault.name
output vaultUri string = keyVault.properties.vaultUri
output vaultId string = keyVault.id
