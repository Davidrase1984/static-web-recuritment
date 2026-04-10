const { app } = require('@azure/functions')
const { getConnection, sql } = require('../db.js')

app.http('create-candidate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json()
      const { firstName, lastName, email, phone, position, notes, requisitionId } = body

      if (!firstName || !lastName || !email) {
        return { status: 400, body: JSON.stringify({ error: 'firstName, lastName, and email are required' }) }
      }

      const pool = await getConnection()
      let result

      if (requisitionId) {
        try {
          result = await pool.request()
            .input('firstName', sql.NVarChar(100), firstName)
            .input('lastName', sql.NVarChar(100), lastName)
            .input('email', sql.NVarChar(255), email)
            .input('phone', sql.NVarChar(20), phone || null)
            .input('position', sql.NVarChar(100), position || null)
            .input('notes', sql.NVarChar(sql.MAX), notes || null)
            .input('requisitionId', sql.Int, parseInt(requisitionId))
            .query(`
              INSERT INTO Candidates (FirstName, LastName, Email, Phone, Position, Notes, RequisitionId)
              OUTPUT INSERTED.*
              VALUES (@firstName, @lastName, @email, @phone, @position, @notes, @requisitionId)
            `)
        } catch (e) {
          context.log('RequisitionId column not found, inserting without it')
          result = await pool.request()
            .input('firstName', sql.NVarChar(100), firstName)
            .input('lastName', sql.NVarChar(100), lastName)
            .input('email', sql.NVarChar(255), email)
            .input('phone', sql.NVarChar(20), phone || null)
            .input('position', sql.NVarChar(100), position || null)
            .input('notes', sql.NVarChar(sql.MAX), notes || null)
            .query(`
              INSERT INTO Candidates (FirstName, LastName, Email, Phone, Position, Notes)
              OUTPUT INSERTED.*
              VALUES (@firstName, @lastName, @email, @phone, @position, @notes)
            `)
        }
      } else {
        result = await pool.request()
          .input('firstName', sql.NVarChar(100), firstName)
          .input('lastName', sql.NVarChar(100), lastName)
          .input('email', sql.NVarChar(255), email)
          .input('phone', sql.NVarChar(20), phone || null)
          .input('position', sql.NVarChar(100), position || null)
          .input('notes', sql.NVarChar(sql.MAX), notes || null)
          .query(`
            INSERT INTO Candidates (FirstName, LastName, Email, Phone, Position, Notes)
            OUTPUT INSERTED.*
            VALUES (@firstName, @lastName, @email, @phone, @position, @notes)
          `)
      }

      context.log('Created candidate:', result.recordset[0].Email)
      return {
        status: 201,
        body: JSON.stringify({ message: 'Candidate created', candidate: result.recordset[0] })
      }
    } catch (err) {
      context.error('Create candidate error:', err)
      if (err.message.includes('UNIQUE')) {
        return { status: 409, body: JSON.stringify({ error: 'Email already exists' }) }
      }
      return {
        status: 500,
        body: JSON.stringify({ error: err.message })
      }
    }
  }
})
