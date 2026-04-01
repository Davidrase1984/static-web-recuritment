const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.js')

app.http('candidates-by-requisition', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
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

      context.log(`Retrieved ${result.recordset.length} candidates for requisition ${requisitionId}`)
      return { body: JSON.stringify({ candidates: result.recordset }) }
    } catch (err) {
      context.error('Get candidates by requisition error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
