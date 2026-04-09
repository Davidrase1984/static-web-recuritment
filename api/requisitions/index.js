const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

app.http('requisitions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const status = request.query.get('status')
      const pool = await getConnection()

      let query = 'SELECT * FROM Requisitions'
      if (status) {
        query += ' WHERE Status = @status'
      }
      query += ' ORDER BY CreatedAt DESC'

      const req = pool.request()
      if (status) {
        req.input('status', sql.NVarChar(50), status)
      }

      const result = await req.query(query)
      context.log(`Retrieved ${result.recordset.length} requisitions`)
      return { body: JSON.stringify({ requisitions: result.recordset }) }
    } catch (err) {
      context.error('Get requisitions error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
