const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

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

app.http('get-candidates', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const pool = await getConnection()

      let result
      try {
        result = await pool.request().query(`
          SELECT c.*, r.Title AS RequisitionTitle
          FROM Candidates c
          LEFT JOIN Requisitions r ON c.RequisitionId = r.Id
          ORDER BY c.CreatedAt DESC
        `)
      } catch (joinErr) {
        context.log('Requisitions table not found, falling back to simple query')
        result = await pool.request().query('SELECT * FROM Candidates ORDER BY CreatedAt DESC')
      }

      const candidates = result.recordset.map(c => ({
        ...c,
        StageName: STAGES[c.Stage] || STAGES[1] || 'Applied'
      }))

      context.log(`Retrieved ${candidates.length} candidates`)
      return { body: JSON.stringify({ candidates }) }
    } catch (err) {
      context.error('Get candidates error:', err)
      return {
        status: 500,
        body: JSON.stringify({ error: err.message })
      }
    }
  }
})
