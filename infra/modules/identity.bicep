@description('Azure region for deployment')
param location string

@description('Workload name for naming convention')
param workloadName string = 'maxsales'

@description('Environment name')
param environmentName string = 'exp'

var identityName = 'id-${workloadName}-${environmentName}-eus'

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: identityName
  location: location
  tags: {
    environment: environmentName
    workload: workloadName
  }
}

output identityName string = managedIdentity.name
output identityId string = managedIdentity.id
output identityPrincipalId string = managedIdentity.properties.principalId
output identityClientId string = managedIdentity.properties.clientId
