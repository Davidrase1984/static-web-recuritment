const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.js')

app.http('create-requisition', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json()
      const { title, department, description, hiringManagerName } = body

      if (!title) {
        return { status: 400, body: JSON.stringify({ error: 'title is required' }) }
      }

      const pool = await getConnection()
      const result = await pool.request()
        .input('title', sql.NVarChar(200), title)
        .input('department', sql.NVarChar(100), department || null)
        .input('description', sql.NVarChar(sql.MAX), description || null)
        .input('hiringManagerName', sql.NVarChar(100), hiringManagerName || null)
        .query(`
          INSERT INTO Requisitions (Title, Department, Description, HiringManagerName)
          OUTPUT INSERTED.*
          VALUES (@title, @department, @description, @hiringManagerName)
        `)

      context.log('Created requisition:', result.recordset[0].Title)
      return {
        status: 201,
        body: JSON.stringify({ message: 'Requisition created', requisition: result.recordset[0] })
      }
    } catch (err) {
      context.error('Create requisition error:', err)
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  }
})
