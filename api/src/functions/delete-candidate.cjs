const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.cjs')

app.http('delete-candidate', {
  methods: ['DELETE'],
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
        .query('DELETE FROM Candidates WHERE Id = @id')

      if (result.rowsAffected[0] === 0) {
        return { status: 404, body: JSON.stringify({ error: 'Candidate not found' }) }
      }

      context.log('Deleted candidate:', id)
      return { body: JSON.stringify({ message: 'Candidate deleted' }) }
    } catch (err) {
      context.error('Delete candidate error:', err)
      return {
        status: 500,
        body: JSON.stringify({ error: err.message })
      }
    }
  }
})
