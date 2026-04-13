const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

function getUserRoles(request) {
  const header = request.headers.get('x-ms-client-principal')
  if (!header) return []
  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8')
    const principal = JSON.parse(decoded)
    return principal.userRoles || []
  } catch {
    return []
  }
}

app.http('create-requisition', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const userRoles = getUserRoles(request)
      context.log('User roles:', userRoles)

      if (!userRoles.includes('hr-admin')) {
        return { status: 403, body: JSON.stringify({ error: 'Only HR Admin can create requisitions' }) }
      }

      const body = await request.json()
      const { 
        title, department, description,
        jobRequisitionNumber, hiringManager, jdIntiationDate,
        jobDescription, hiringType, fy, period, jobDescriptionUrl
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
        .input('jobDescriptionUrl', sql.NVarChar(500), jobDescriptionUrl || null)
        .query(`
          INSERT INTO Requisitions (Title, Department, Description, JobRequisitionNumber, HiringManager, JDIntiationDate, JobDescription, HiringType, FY, Period, JobDescriptionUrl)
          OUTPUT INSERTED.*
          VALUES (@title, @department, @description, @jobRequisitionNumber, @hiringManager, @jdIntiationDate, @jobDescription, @hiringType, @fy, @period, @jobDescriptionUrl)
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
