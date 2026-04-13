const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')
const { requireAnyRole } = require('../auth.js')

app.http('comments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const auth = requireAnyRole(request, ['hr-admin', 'hiring-manager', 'director'])
    if (!auth.authorized) return auth.forbiddenResponse

    try {
      const candidateId = request.query.get('candidateId')
      if (!candidateId) {
        return { status: 400, body: JSON.stringify({ error: 'candidateId parameter is required' }) }
      }

      const pool = await getConnection()
      const result = await pool.request()
        .input('candidateId', sql.Int, parseInt(candidateId))
        .query(`
          SELECT c.*, r.Title AS RequisitionTitle
          FROM Comments c
          LEFT JOIN Requisitions r ON c.RequisitionId = r.Id
          WHERE c.CandidateId = @candidateId
          ORDER BY c.CreatedAt DESC
        `)

      context.log(`Retrieved ${result.recordset.length} comments for candidate ${candidateId}`)
      return { body: JSON.stringify({ comments: result.recordset }) }
    } catch (err) {
      context.error('Get comments error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
