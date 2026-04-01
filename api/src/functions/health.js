const { app } = require('@azure/functions')

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const hasConnectionString = !!process.env.AZURE_SQL_CONNECTION_STRING
    return {
      body: JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        sqlConfigured: hasConnectionString
      })
    }
  }
})
