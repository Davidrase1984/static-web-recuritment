const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')
const { requireAnyRole } = require('../auth.js')

const STAGES = {
  1: 'Applied',
  2: 'Screening',
  3: 'Technical Interview',
  4: 'Technical Selected',
  5: 'Technical Rejected',
  6: 'Technical Hold',
  7: 'HR Selected',
  8: 'HR Rejected',
  9: 'HR Hold',
  10: 'Director Review',
  11: 'Director Selected',
  12: 'Director Rejected',
  13: 'Offer Released',
  14: 'Offer Accepted',
  15: 'Offer Revoked'
}

app.http('get-candidate', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const auth = requireAnyRole(request, ['hr-admin', 'hiring-manager', 'director'])
    if (!auth.authorized) return auth.forbiddenResponse

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

      const candidate = {
        ...result.recordset[0],
        StageName: STAGES[result.recordset[0].Stage] || STAGES[1] || 'Applied'
      }

      return { body: JSON.stringify({ candidate }) }
    } catch (err) {
      context.error('Get candidate error:', err)
      return {
        status: 500,
        body: JSON.stringify({ error: err.message })
      }
    }
  }
})
