const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.js')

app.http('get-candidates', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const pool = await getConnection()
      const result = await pool.request().query('SELECT * FROM Candidates ORDER BY CreatedAt DESC')

      context.log(`Retrieved ${result.recordset.length} candidates`)
      return { body: JSON.stringify({ candidates: result.recordset }) }
    } catch (err) {
      context.error('Get candidates error:', err)
      return {
        status: 500,
        body: JSON.stringify({ error: err.message })
      }
    }
  }
})
