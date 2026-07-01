@description('Azure region for deployment')
param location string

@description('Workload name for naming convention')
param workloadName string = 'maxsales'

@description('Environment name')
param environmentName string = 'exp'

var cosmosAccountName = 'cosmos-${workloadName}-${environmentName}-eus'

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2025-04-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  identity: {
    type: 'None'
  }
  properties: {
    databaseAccountOfferType: 'Standard'
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
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
    enableFreeTier: false
    disableLocalAuth: true
    disableKeyBasedMetadataWriteAccess: true
  }
  tags: {
    environment: environmentName
    workload: workloadName
  }
}

output cosmosAccountName string = cosmosAccount.name
output cosmosAccountId string = cosmosAccount.id
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
