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

app.http('candidates-by-requisition', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const auth = requireAnyRole(request, ['hr-admin', 'hiring-manager', 'director'])
    if (!auth.authorized) return auth.forbiddenResponse

    try {
      const requisitionId = request.query.get('requisitionId')
      if (!requisitionId) {
        return { status: 400, body: JSON.stringify({ error: 'requisitionId parameter is required' }) }
      }

      const pool = await getConnection()
      const result = await pool.request()
        .input('requisitionId', sql.Int, parseInt(requisitionId))
        .query(`
          SELECT c.*, r.Title AS RequisitionTitle
          FROM Candidates c
          LEFT JOIN Requisitions r ON c.RequisitionId = r.Id
          WHERE c.RequisitionId = @requisitionId
          ORDER BY c.CreatedAt DESC
        `)

      const candidates = result.recordset.map(c => ({
        ...c,
        StageName: STAGES[c.Stage] || STAGES[1] || 'Applied'
      }))

      context.log(`Retrieved ${candidates.length} candidates for requisition ${requisitionId}`)
      return { body: JSON.stringify({ candidates }) }
    } catch (err) {
      context.error('Get candidates by requisition error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})