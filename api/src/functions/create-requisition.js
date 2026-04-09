const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.js')

app.http('create-requisition', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json()
      const { 
        title, department, description,
        jobRequisitionNumber, hiringManager, jdIntiationDate,
        jobDescription, hiringType, fy, period
      } = body

      if (!title) {
        return { status: 400, body: JSON.stringify({ error: 'title is required' }) }
      }

      const pool = await getConnection()
      const result = await pool.request()
        .input('title', sql.NVarChar(200), title)
        .input('department', sql.NVarChar(100), department || null)
        .input('description', sql.NVarChar(sql.MAX), description || null)
        .input('jobRequisitionNumber', sql.NVarChar(50), jobRequisitionNumber || null)
        .input('hiringManager', sql.NVarChar(100), hiringManager || null)
        .input('jdIntiationDate', sql.DateTime2, jdIntiationDate ? new Date(jdIntiationDate) : null)
        .input('jobDescription', sql.NVarChar(sql.MAX), jobDescription || null)
        .input('hiringType', sql.NVarChar(50), hiringType || null)
        .input('fy', sql.NVarChar(10), fy || null)
        .input('period', sql.NVarChar(10), period || null)
        .query(`
          INSERT INTO Requisitions (Title, Department, Description, JobRequisitionNumber, HiringManager, JDIntiationDate, JobDescription, HiringType, FY, Period)
          OUTPUT INSERTED.*
          VALUES (@title, @department, @description, @jobRequisitionNumber, @hiringManager, @jdIntiationDate, @jobDescription, @hiringType, @fy, @period)
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
