const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.js')

app.http('get-candidate', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const id = request.query.get('id')
      if (!id) {
        return { status: 400, body: JSON.stringify({ error: 'Missing id parameter' }) }
      }

      const pool = await getConnection()
      const result = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query('SELECT * FROM Candidates WHERE Id = @id')

      if (result.recordset.length === 0) {
        return { status: 404, body: JSON.stringify({ error: 'Candidate not found' }) }
      }

      return { body: JSON.stringify({ candidate: result.recordset[0] }) }
    } catch (err) {
      context.error('Get candidate error:', err)
      return {
        status: 500,
        body: JSON.stringify({ error: err.message })
      }
    }
  }
})
