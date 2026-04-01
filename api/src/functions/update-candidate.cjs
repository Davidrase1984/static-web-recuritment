const { app } = require('@azure/functions')
const { getConnection, sql } = require('./db.cjs')

app.http('update-candidate', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json()
      const { id, firstName, lastName, email, phone, position, status, notes } = body

      if (!id) {
        return { status: 400, body: JSON.stringify({ error: 'id is required' }) }
      }

      const pool = await getConnection()
      const result = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .input('firstName', sql.NVarChar(100), firstName || null)
        .input('lastName', sql.NVarChar(100), lastName || null)
        .input('email', sql.NVarChar(255), email || null)
        .input('phone', sql.NVarChar(20), phone || null)
        .input('position', sql.NVarChar(100), position || null)
        .input('status', sql.NVarChar(50), status || null)
        .input('notes', sql.NVarChar(sql.MAX), notes || null)
        .query(`
          UPDATE Candidates SET
            FirstName = ISNULL(@firstName, FirstName),
            LastName = ISNULL(@lastName, LastName),
            Email = ISNULL(@email, Email),
            Phone = ISNULL(@phone, Phone),
            Position = ISNULL(@position, Position),
            Status = ISNULL(@status, Status),
            Notes = ISNULL(@notes, Notes),
            UpdatedAt = GETUTCDATE()
          WHERE Id = @id;
          SELECT * FROM Candidates WHERE Id = @id;
        `)

      if (result.recordset.length === 0) {
        return { status: 404, body: JSON.stringify({ error: 'Candidate not found' }) }
      }

      context.log('Updated candidate:', result.recordset[0].Email)
      return { body: JSON.stringify({ message: 'Candidate updated', candidate: result.recordset[0] }) }
    } catch (err) {
      context.error('Update candidate error:', err)
      return {
        status: 500,
        body: JSON.stringify({ error: err.message })
      }
    }
  }
})
