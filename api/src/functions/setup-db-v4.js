const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

app.http('setup-db-v4', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const pool = await getConnection()

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Requisitions') AND name = 'JobDescriptionUrl')
        BEGIN
          ALTER TABLE Requisitions ADD JobDescriptionUrl NVARCHAR(500) NULL
        END
      `)
      context.log('JobDescriptionUrl column ready')

      return { body: JSON.stringify({ message: 'Database v4 setup complete. JobDescriptionUrl column added.' }) }
    } catch (err) {
      context.error('Setup v4 error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
